import cv2
import numpy as np
import os
import logging
from typing import Dict, Tuple, Optional, List
import asyncio
from pathlib import Path
import subprocess
import shutil

logger = logging.getLogger(__name__)

class VideoProcessor:
    """
    معالج الفيديو لاستخراج المعلومات ومعالجة الفيديوهات
    """
    
    def __init__(self):
        """تهيئة معالج الفيديو"""
        self.supported_formats = ['.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv']
        
    async def process_video(self, video_path: str) -> Dict:
        """
        معالجة الفيديو واستخراج المعلومات
        
        Args:
            video_path: مسار الفيديو
            
        Returns:
            معلومات الفيديو
        """
        try:
            # Check if file exists
            if not os.path.exists(video_path):
                raise FileNotFoundError(f"Video file not found: {video_path}")
            
            # Get video properties
            video_info = self.get_video_info(video_path)
            
            # Validate video
            if not self.validate_video(video_path):
                raise ValueError("Invalid video file or corrupted")
            
            # Extract additional metadata
            metadata = self.extract_metadata(video_path)
            
            # Combine all information
            processed_info = {
                **video_info,
                **metadata,
                "file_path": video_path,
                "file_size": os.path.getsize(video_path),
                "processed_at": np.datetime64('now').astype(str)
            }
            
            logger.info(f"Video processed successfully: {video_path}")
            return processed_info
            
        except Exception as e:
            logger.error(f"Error processing video: {str(e)}")
            raise
    
    def get_video_info(self, video_path: str) -> Dict:
        """
        استخراج معلومات الفيديو الأساسية
        
        Args:
            video_path: مسار الفيديو
            
        Returns:
            معلومات الفيديو
        """
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                raise ValueError(f"Cannot open video file: {video_path}")
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            frame_count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # Calculate duration
            duration = frame_count / fps if fps > 0 else 0
            
            # Get format information
            fourcc = int(cap.get(cv2.CAP_PROP_FOURCC))
            codec = "".join([chr((fourcc >> 8 * i) & 0xFF) for i in range(4)])
            
            # Get file extension
            file_ext = Path(video_path).suffix.lower()
            
            cap.release()
            
            info = {
                "width": width,
                "height": height,
                "fps": fps,
                "duration": duration,
                "total_frames": frame_count,
                "format": file_ext,
                "codec": codec,
                "resolution": f"{width}x{height}",
                "aspect_ratio": width / height if height > 0 else 1.0
            }
            
            return info
            
        except Exception as e:
            logger.error(f"Error getting video info: {str(e)}")
            raise
    
    def validate_video(self, video_path: str) -> bool:
        """
        التحقق من صحة الفيديو
        
        Args:
            video_path: مسار الفيديو
            
        Returns:
            True إذا كان الفيديو صحيحاً
        """
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return False
            
            # Try to read first frame
            ret, frame = cap.read()
            if not ret or frame is None:
                cap.release()
                return False
            
            # Check frame properties
            if frame.shape[0] < 10 or frame.shape[1] < 10:
                cap.release()
                return False
            
            # Check if we can read multiple frames
            frame_count = 0
            while frame_count < 10:  # Test first 10 frames
                ret, frame = cap.read()
                if not ret:
                    break
                frame_count += 1
            
            cap.release()
            
            # Video should have at least a few frames
            return frame_count > 0
            
        except Exception as e:
            logger.error(f"Error validating video: {str(e)}")
            return False
    
    def extract_metadata(self, video_path: str) -> Dict:
        """
        استخراج البيانات الوصفية للفيديو
        
        Args:
            video_path: مسار الفيديو
            
        Returns:
            البيانات الوصفية
        """
        try:
            metadata = {}
            
            # Get file stats
            stat = os.stat(video_path)
            metadata["created_at"] = str(np.datetime64(int(stat.st_ctime), 's'))
            metadata["modified_at"] = str(np.datetime64(int(stat.st_mtime), 's'))
            
            # Try to get additional metadata using ffprobe if available
            try:
                result = subprocess.run([
                    'ffprobe', '-v', 'quiet', '-print_format', 'json',
                    '-show_format', '-show_streams', video_path
                ], capture_output=True, text=True, timeout=10)
                
                if result.returncode == 0:
                    import json
                    ffprobe_data = json.loads(result.stdout)
                    
                    # Extract relevant information
                    if 'format' in ffprobe_data:
                        format_info = ffprobe_data['format']
                        metadata["bitrate"] = format_info.get('bit_rate', 0)
                        metadata["format_name"] = format_info.get('format_name', '')
                        
                    if 'streams' in ffprobe_data:
                        for stream in ffprobe_data['streams']:
                            if stream.get('codec_type') == 'video':
                                metadata["video_codec"] = stream.get('codec_name', '')
                                metadata["pixel_format"] = stream.get('pix_fmt', '')
                                break
                
            except (subprocess.TimeoutExpired, FileNotFoundError, json.JSONDecodeError):
                # ffprobe not available or failed, use basic metadata
                logger.warning("ffprobe not available, using basic metadata")
            
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting metadata: {str(e)}")
            return {}
    
    def resize_video(self, input_path: str, output_path: str, 
                    target_width: int, target_height: int) -> bool:
        """
        تغيير حجم الفيديو
        
        Args:
            input_path: مسار الفيديو المدخل
            output_path: مسار الفيديو المخرج
            target_width: العرض المطلوب
            target_height: الارتفاع المطلوب
            
        Returns:
            True إذا تم التغيير بنجاح
        """
        try:
            cap = cv2.VideoCapture(input_path)
            if not cap.isOpened():
                return False
            
            # Get original properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            
            # Create video writer
            out = cv2.VideoWriter(output_path, fourcc, fps, (target_width, target_height))
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                # Resize frame
                resized_frame = cv2.resize(frame, (target_width, target_height))
                out.write(resized_frame)
            
            cap.release()
            out.release()
            
            logger.info(f"Video resized successfully: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error resizing video: {str(e)}")
            return False
    
    def extract_frames(self, video_path: str, output_dir: str, 
                      interval: int = 30) -> List[str]:
        """
        استخراج إطارات من الفيديو
        
        Args:
            video_path: مسار الفيديو
            output_dir: مجلد الإخراج
            interval: فترة استخراج الإطارات (كل n إطار)
            
        Returns:
            قائمة بمسارات الإطارات المستخرجة
        """
        try:
            # Create output directory
            os.makedirs(output_dir, exist_ok=True)
            
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return []
            
            extracted_frames = []
            frame_count = 0
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                if frame_count % interval == 0:
                    # Save frame
                    frame_filename = f"frame_{frame_count:06d}.jpg"
                    frame_path = os.path.join(output_dir, frame_filename)
                    cv2.imwrite(frame_path, frame)
                    extracted_frames.append(frame_path)
                
                frame_count += 1
            
            cap.release()
            
            logger.info(f"Extracted {len(extracted_frames)} frames to {output_dir}")
            return extracted_frames
            
        except Exception as e:
            logger.error(f"Error extracting frames: {str(e)}")
            return []
    
    def create_video_thumbnail(self, video_path: str, output_path: str, 
                             timestamp: float = 1.0) -> bool:
        """
        إنشاء صورة مصغرة للفيديو
        
        Args:
            video_path: مسار الفيديو
            output_path: مسار الصورة المصغرة
            timestamp: الوقت لاستخراج الصورة المصغرة
            
        Returns:
            True إذا تم إنشاء الصورة المصغرة بنجاح
        """
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return False
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            # Calculate frame number for timestamp
            frame_number = int(timestamp * fps)
            frame_number = min(frame_number, total_frames - 1)
            
            # Seek to frame
            cap.set(cv2.CAP_PROP_POS_FRAMES, frame_number)
            
            # Read frame
            ret, frame = cap.read()
            if not ret:
                cap.release()
                return False
            
            # Resize to thumbnail size
            thumbnail_size = (320, 240)
            thumbnail = cv2.resize(frame, thumbnail_size)
            
            # Save thumbnail
            cv2.imwrite(output_path, thumbnail)
            
            cap.release()
            
            logger.info(f"Thumbnail created: {output_path}")
            return True
            
        except Exception as e:
            logger.error(f"Error creating thumbnail: {str(e)}")
            return False
    
    def convert_video_format(self, input_path: str, output_path: str, 
                           target_format: str = 'mp4') -> bool:
        """
        تحويل تنسيق الفيديو
        
        Args:
            input_path: مسار الفيديو المدخل
            output_path: مسار الفيديو المخرج
            target_format: التنسيق المطلوب
            
        Returns:
            True إذا تم التحويل بنجاح
        """
        try:
            # Check if ffmpeg is available
            result = subprocess.run(['ffmpeg', '-version'], 
                                  capture_output=True, text=True)
            if result.returncode != 0:
                logger.warning("ffmpeg not available, using OpenCV conversion")
                return self._convert_with_opencv(input_path, output_path)
            
            # Use ffmpeg for conversion
            cmd = [
                'ffmpeg', '-i', input_path, '-c:v', 'libx264',
                '-c:a', 'aac', '-f', target_format, '-y', output_path
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            
            if result.returncode == 0:
                logger.info(f"Video converted successfully: {output_path}")
                return True
            else:
                logger.error(f"ffmpeg conversion failed: {result.stderr}")
                return False
                
        except Exception as e:
            logger.error(f"Error converting video: {str(e)}")
            return False
    
    def _convert_with_opencv(self, input_path: str, output_path: str) -> bool:
        """
        تحويل الفيديو باستخدام OpenCV
        
        Args:
            input_path: مسار الفيديو المدخل
            output_path: مسار الفيديو المخرج
            
        Returns:
            True إذا تم التحويل بنجاح
        """
        try:
            cap = cv2.VideoCapture(input_path)
            if not cap.isOpened():
                return False
            
            # Get video properties
            fps = cap.get(cv2.CAP_PROP_FPS)
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            
            # Create video writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                out.write(frame)
            
            cap.release()
            out.release()
            
            return True
            
        except Exception as e:
            logger.error(f"Error in OpenCV conversion: {str(e)}")
            return False
    
    def get_video_quality_metrics(self, video_path: str) -> Dict:
        """
        حساب مقاييس جودة الفيديو
        
        Args:
            video_path: مسار الفيديو
            
        Returns:
            مقاييس الجودة
        """
        try:
            cap = cv2.VideoCapture(video_path)
            if not cap.isOpened():
                return {}
            
            # Sample frames for quality analysis
            sample_frames = []
            frame_count = 0
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            sample_interval = max(1, total_frames // 10)  # Sample 10 frames
            
            while len(sample_frames) < 10:
                ret, frame = cap.read()
                if not ret:
                    break
                
                if frame_count % sample_interval == 0:
                    sample_frames.append(frame)
                
                frame_count += 1
            
            cap.release()
            
            if not sample_frames:
                return {}
            
            # Calculate quality metrics
            metrics = {}
            
            # Brightness
            brightness_values = []
            for frame in sample_frames:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                brightness = np.mean(gray)
                brightness_values.append(brightness)
            
            metrics["average_brightness"] = np.mean(brightness_values)
            metrics["brightness_std"] = np.std(brightness_values)
            
            # Sharpness (using Laplacian variance)
            sharpness_values = []
            for frame in sample_frames:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                laplacian = cv2.Laplacian(gray, cv2.CV_64F)
                sharpness = laplacian.var()
                sharpness_values.append(sharpness)
            
            metrics["average_sharpness"] = np.mean(sharpness_values)
            metrics["sharpness_std"] = np.std(sharpness_values)
            
            # Contrast
            contrast_values = []
            for frame in sample_frames:
                gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
                contrast = gray.std()
                contrast_values.append(contrast)
            
            metrics["average_contrast"] = np.mean(contrast_values)
            metrics["contrast_std"] = np.std(contrast_values)
            
            return metrics
            
        except Exception as e:
            logger.error(f"Error calculating quality metrics: {str(e)}")
            return {}