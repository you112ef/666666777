import cv2
import numpy as np
import torch
from ultralytics import YOLO
from deep_sort_realtime import DeepSort
import logging
from typing import Dict, List, Tuple, Optional
from datetime import datetime
import os
import asyncio
import json
from pathlib import Path

logger = logging.getLogger(__name__)

class SpermAnalyzer:
    """
    محلل الحيوانات المنوية باستخدام YOLOv8 و DeepSORT
    """
    
    def __init__(self, model_path: str = "yolov8n.pt", confidence_threshold: float = 0.5):
        """
        تهيئة محلل الحيوانات المنوية
        
        Args:
            model_path: مسار نموذج YOLOv8
            confidence_threshold: حد الثقة للكشف
        """
        self.model_path = model_path
        self.confidence_threshold = confidence_threshold
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        
        # Initialize models
        self.yolo_model = None
        self.deep_sort = None
        self.class_names = ['sperm']
        
        # Tracking variables
        self.track_history = {}
        self.sperm_count = 0
        self.motility_data = []
        self.density_data = []
        
        logger.info(f"SpermAnalyzer initialized with device: {self.device}")
    
    def load_model(self):
        """تحميل نموذج YOLOv8"""
        try:
            # Load YOLOv8 model
            if os.path.exists(self.model_path):
                self.yolo_model = YOLO(self.model_path)
                logger.info(f"Loaded custom model from {self.model_path}")
            else:
                # Use pretrained model and retrain for sperm detection
                self.yolo_model = YOLO('yolov8n.pt')
                logger.info("Loaded pretrained YOLOv8 model")
            
            # Initialize DeepSORT
            self.deep_sort = DeepSort(
                max_age=50,
                n_init=3,
                nms_max_overlap=1.0,
                max_cosine_distance=0.3,
                nn_budget=None,
                override_track_class=None,
                embedder="mobilenet",
                half=True,
                bgr=True,
                embedder_gpu=torch.cuda.is_available(),
                embedder_model_name=None,
                embedder_wts=None,
                polygon=False,
                today=None
            )
            
            logger.info("Models loaded successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error loading models: {str(e)}")
            return False
    
    async def analyze_video(self, video_path: str, parameters: Dict = None) -> Dict:
        """
        تحليل فيديو الحيوانات المنوية
        
        Args:
            video_path: مسار الفيديو
            parameters: معاملات التحليل
            
        Returns:
            نتائج التحليل الكاملة
        """
        try:
            # Load models if not already loaded
            if not self.yolo_model or not self.deep_sort:
                if not self.load_model():
                    raise Exception("Failed to load models")
            
            # Set parameters
            if parameters:
                self.confidence_threshold = parameters.get('confidence_threshold', 0.5)
            
            # Open video
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise Exception(f"Cannot open video file: {video_path}")
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            duration = total_frames / fps if fps > 0 else 0
            
            logger.info(f"Video properties: {width}x{height}, {fps} FPS, {duration:.2f}s")
            
            # Initialize tracking variables
            self.track_history = {}
            self.sperm_count = 0
            self.motility_data = []
            self.density_data = []
            
            frame_results = []
            frame_count = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Run detection
                detections = self.detect_sperm(frame)
                
                # Run tracking
                tracks = self.track_sperm(detections, frame)
                
                # Calculate metrics
                frame_metrics = self.calculate_frame_metrics(tracks, frame_count, fps)
                
                # Store results
                frame_results.append({
                    'frame_number': frame_count,
                    'timestamp': frame_count / fps,
                    'detections': len(detections),
                    'tracks': len(tracks),
                    'metrics': frame_metrics
                })
                
                frame_count += 1
                
                # Progress update (for real-time monitoring)
                if frame_count % 30 == 0:  # Every 30 frames
                    progress = (frame_count / total_frames) * 100
                    logger.info(f"Processing progress: {progress:.1f}%")
            
            cap.release()
            
            # Generate final analysis
            final_results = self.generate_final_analysis(frame_results, fps, duration)
            
            logger.info("Video analysis completed successfully")
            return final_results
            
        except Exception as e:
            logger.error(f"Error in analyze_video: {str(e)}")
            raise
    
    def detect_sperm(self, frame: np.ndarray) -> List[Dict]:
        """
        كشف الحيوانات المنوية في الإطار
        
        Args:
            frame: إطار الفيديو
            
        Returns:
            قائمة الكشوفات
        """
        try:
            # Run YOLOv8 detection
            results = self.yolo_model(frame, conf=self.confidence_threshold, verbose=False)
            
            detections = []
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        # Extract box coordinates
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                        confidence = box.conf[0].cpu().numpy()
                        class_id = int(box.cls[0].cpu().numpy())
                        
                        # Calculate center and dimensions
                        center_x = (x1 + x2) / 2
                        center_y = (y1 + y2) / 2
                        width = x2 - x1
                        height = y2 - y1
                        
                        detections.append({
                            'bbox': [x1, y1, x2, y2],
                            'confidence': float(confidence),
                            'class_id': class_id,
                            'center': [center_x, center_y],
                            'size': [width, height]
                        })
            
            return detections
            
        except Exception as e:
            logger.error(f"Error in detect_sperm: {str(e)}")
            return []
    
    def track_sperm(self, detections: List[Dict], frame: np.ndarray) -> List[Dict]:
        """
        تتبع الحيوانات المنوية
        
        Args:
            detections: قائمة الكشوفات
            frame: إطار الفيديو
            
        Returns:
            قائمة التتبع
        """
        try:
            # Prepare detections for DeepSORT
            detection_list = []
            for det in detections:
                x1, y1, x2, y2 = det['bbox']
                confidence = det['confidence']
                detection_list.append([[x1, y1, x2, y2], confidence, 'sperm'])
            
            # Update tracker
            tracks = self.deep_sort.update_tracks(detection_list, frame=frame)
            
            # Process tracks
            track_results = []
            for track in tracks:
                if not track.is_confirmed():
                    continue
                
                # Get track information
                track_id = track.track_id
                ltrb = track.to_ltrb()
                
                # Calculate center and velocity
                center_x = (ltrb[0] + ltrb[2]) / 2
                center_y = (ltrb[1] + ltrb[3]) / 2
                
                # Update track history
                if track_id not in self.track_history:
                    self.track_history[track_id] = {
                        'positions': [],
                        'velocities': [],
                        'first_seen': datetime.now(),
                        'last_seen': datetime.now()
                    }
                
                # Add current position
                self.track_history[track_id]['positions'].append([center_x, center_y])
                self.track_history[track_id]['last_seen'] = datetime.now()
                
                # Calculate velocity
                velocity = self.calculate_velocity(track_id)
                
                track_results.append({
                    'track_id': track_id,
                    'bbox': ltrb,
                    'center': [center_x, center_y],
                    'velocity': velocity,
                    'confidence': getattr(track, 'confidence', 0.0)
                })
            
            return track_results
            
        except Exception as e:
            logger.error(f"Error in track_sperm: {str(e)}")
            return []
    
    def calculate_velocity(self, track_id: int) -> float:
        """
        حساب سرعة الحيوان المنوي
        
        Args:
            track_id: معرف التتبع
            
        Returns:
            السرعة بالبكسل في الثانية
        """
        try:
            positions = self.track_history[track_id]['positions']
            if len(positions) < 2:
                return 0.0
            
            # Calculate distance between last two positions
            p1 = positions[-2]
            p2 = positions[-1]
            distance = np.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)
            
            # Assume 30 FPS for time calculation
            time_diff = 1.0 / 30.0
            velocity = distance / time_diff
            
            return velocity
            
        except Exception as e:
            logger.error(f"Error calculating velocity: {str(e)}")
            return 0.0
    
    def calculate_frame_metrics(self, tracks: List[Dict], frame_number: int, fps: float) -> Dict:
        """
        حساب مقاييس الإطار
        
        Args:
            tracks: قائمة التتبع
            frame_number: رقم الإطار
            fps: معدل الإطارات في الثانية
            
        Returns:
            مقاييس الإطار
        """
        try:
            # Count active sperm
            active_sperm = len(tracks)
            
            # Calculate motility metrics
            motile_sperm = 0
            total_velocity = 0
            
            for track in tracks:
                velocity = track['velocity']
                if velocity > 20:  # Threshold for motile sperm (pixels/second)
                    motile_sperm += 1
                total_velocity += velocity
            
            # Calculate motility percentage
            motility_percentage = (motile_sperm / active_sperm * 100) if active_sperm > 0 else 0
            
            # Calculate average velocity
            avg_velocity = total_velocity / active_sperm if active_sperm > 0 else 0
            
            # Calculate density (sperm per unit area)
            # Assume frame size for density calculation
            frame_area = 640 * 480  # Standard assumption
            density = active_sperm / frame_area * 10000  # Per 10K pixels
            
            metrics = {
                'active_sperm': active_sperm,
                'motile_sperm': motile_sperm,
                'motility_percentage': motility_percentage,
                'average_velocity': avg_velocity,
                'density': density,
                'timestamp': frame_number / fps
            }
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error calculating frame metrics: {str(e)}")
            return {}
    
    def generate_final_analysis(self, frame_results: List[Dict], fps: float, duration: float) -> Dict:
        """
        إنشاء التحليل النهائي
        
        Args:
            frame_results: نتائج الإطارات
            fps: معدل الإطارات في الثانية
            duration: مدة الفيديو
            
        Returns:
            التحليل النهائي الكامل
        """
        try:
            # Extract metrics data
            sperm_counts = [frame['metrics'].get('active_sperm', 0) for frame in frame_results]
            motility_percentages = [frame['metrics'].get('motility_percentage', 0) for frame in frame_results]
            velocities = [frame['metrics'].get('average_velocity', 0) for frame in frame_results]
            densities = [frame['metrics'].get('density', 0) for frame in frame_results]
            
            # Calculate summary statistics
            total_sperm_detected = len(self.track_history)
            max_concurrent_sperm = max(sperm_counts) if sperm_counts else 0
            avg_sperm_count = np.mean(sperm_counts) if sperm_counts else 0
            
            # Motility analysis
            avg_motility = np.mean(motility_percentages) if motility_percentages else 0
            max_motility = max(motility_percentages) if motility_percentages else 0
            
            # Velocity analysis
            avg_velocity = np.mean(velocities) if velocities else 0
            max_velocity = max(velocities) if velocities else 0
            
            # Density analysis
            avg_density = np.mean(densities) if densities else 0
            max_density = max(densities) if densities else 0
            
            # Generate detailed track analysis
            track_analysis = []
            for track_id, track_data in self.track_history.items():
                positions = track_data['positions']
                if len(positions) > 1:
                    # Calculate total distance traveled
                    total_distance = 0
                    for i in range(1, len(positions)):
                        p1 = positions[i-1]
                        p2 = positions[i]
                        distance = np.sqrt((p2[0] - p1[0])**2 + (p2[1] - p1[1])**2)
                        total_distance += distance
                    
                    # Calculate track duration
                    track_duration = len(positions) / fps
                    
                    # Calculate average speed
                    avg_speed = total_distance / track_duration if track_duration > 0 else 0
                    
                    track_analysis.append({
                        'track_id': track_id,
                        'duration': track_duration,
                        'total_distance': total_distance,
                        'average_speed': avg_speed,
                        'positions_count': len(positions),
                        'is_motile': avg_speed > 20
                    })
            
            # Generate time series data for charts
            time_series = []
            for i, frame in enumerate(frame_results):
                time_series.append({
                    'time': i / fps,
                    'sperm_count': frame['metrics'].get('active_sperm', 0),
                    'motility': frame['metrics'].get('motility_percentage', 0),
                    'velocity': frame['metrics'].get('average_velocity', 0),
                    'density': frame['metrics'].get('density', 0)
                })
            
            # Final results
            final_results = {
                'summary': {
                    'total_sperm_detected': total_sperm_detected,
                    'max_concurrent_sperm': max_concurrent_sperm,
                    'average_sperm_count': round(avg_sperm_count, 2),
                    'average_motility_percentage': round(avg_motility, 2),
                    'max_motility_percentage': round(max_motility, 2),
                    'average_velocity': round(avg_velocity, 2),
                    'max_velocity': round(max_velocity, 2),
                    'average_density': round(avg_density, 4),
                    'max_density': round(max_density, 4),
                    'video_duration': round(duration, 2),
                    'total_frames': len(frame_results),
                    'fps': fps
                },
                'detections': frame_results,
                'tracks': track_analysis,
                'time_series': time_series,
                'statistics': {
                    'motility_distribution': {
                        'low': len([x for x in motility_percentages if x < 30]),
                        'medium': len([x for x in motility_percentages if 30 <= x < 70]),
                        'high': len([x for x in motility_percentages if x >= 70])
                    },
                    'velocity_distribution': {
                        'slow': len([x for x in velocities if x < 20]),
                        'medium': len([x for x in velocities if 20 <= x < 50]),
                        'fast': len([x for x in velocities if x >= 50])
                    },
                    'density_statistics': {
                        'min': min(densities) if densities else 0,
                        'max': max(densities) if densities else 0,
                        'mean': np.mean(densities) if densities else 0,
                        'std': np.std(densities) if densities else 0
                    }
                }
            }
            
            return final_results
            
        except Exception as e:
            logger.error(f"Error generating final analysis: {str(e)}")
            raise
    
    def save_analysis_video(self, video_path: str, output_path: str, results: Dict):
        """
        حفظ فيديو التحليل مع التصورات
        
        Args:
            video_path: مسار الفيديو الأصلي
            output_path: مسار الفيديو المحفوظ
            results: نتائج التحليل
        """
        try:
            cap = cv2.VideoCapture(video_path)
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # Create video writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            frame_count = 0
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Add visualizations
                frame = self.add_visualizations(frame, results, frame_count)
                
                out.write(frame)
                frame_count += 1
            
            cap.release()
            out.release()
            
            logger.info(f"Analysis video saved to: {output_path}")
            
        except Exception as e:
            logger.error(f"Error saving analysis video: {str(e)}")
    
    def add_visualizations(self, frame: np.ndarray, results: Dict, frame_index: int) -> np.ndarray:
        """
        إضافة التصورات للإطار
        
        Args:
            frame: الإطار الأصلي
            results: نتائج التحليل
            frame_index: رقم الإطار
            
        Returns:
            الإطار مع التصورات
        """
        try:
            # Get frame results
            if frame_index < len(results['detections']):
                frame_result = results['detections'][frame_index]
                metrics = frame_result['metrics']
                
                # Add text overlay
                cv2.putText(frame, f"Sperm Count: {metrics.get('active_sperm', 0)}", 
                           (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(frame, f"Motility: {metrics.get('motility_percentage', 0):.1f}%", 
                           (10, 60), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
                cv2.putText(frame, f"Avg Velocity: {metrics.get('average_velocity', 0):.1f}", 
                           (10, 90), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 0), 2)
            
            return frame
            
        except Exception as e:
            logger.error(f"Error adding visualizations: {str(e)}")
            return frame