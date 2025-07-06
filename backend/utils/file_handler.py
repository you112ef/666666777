import os
import shutil
import logging
from typing import List, Dict, Optional, Tuple
from pathlib import Path
import hashlib
import json
import mimetypes
from datetime import datetime
import zipfile
import tempfile
import aiofiles
import asyncio

logger = logging.getLogger(__name__)

class FileHandler:
    """
    معالج الملفات لإدارة الرفع والتحميل وعمليات الملفات
    """
    
    def __init__(self, base_dir: str = ".", max_file_size: int = 500 * 1024 * 1024):
        """
        تهيئة معالج الملفات
        
        Args:
            base_dir: المجلد الأساسي
            max_file_size: الحد الأقصى لحجم الملف (بالبايت)
        """
        self.base_dir = Path(base_dir)
        self.max_file_size = max_file_size
        self.upload_dir = self.base_dir / "uploads"
        self.results_dir = self.base_dir / "results"
        self.static_dir = self.base_dir / "static"
        self.temp_dir = self.base_dir / "temp"
        
        # Create directories if they don't exist
        self._create_directories()
        
        # Supported file types
        self.supported_video_types = [
            'video/mp4', 'video/avi', 'video/quicktime', 'video/x-msvideo',
            'video/x-ms-wmv', 'video/x-flv', 'video/x-matroska'
        ]
        
        self.supported_extensions = [
            '.mp4', '.avi', '.mov', '.wmv', '.flv', '.mkv'
        ]
    
    def _create_directories(self):
        """إنشاء المجلدات المطلوبة"""
        directories = [
            self.upload_dir,
            self.results_dir,
            self.static_dir,
            self.temp_dir
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            logger.info(f"Created directory: {directory}")
    
    def validate_file(self, file_path: str, check_content: bool = True) -> Tuple[bool, str]:
        """
        التحقق من صحة الملف
        
        Args:
            file_path: مسار الملف
            check_content: فحص محتوى الملف
            
        Returns:
            (صحيح أم لا، رسالة الخطأ)
        """
        try:
            file_path = Path(file_path)
            
            # Check if file exists
            if not file_path.exists():
                return False, "الملف غير موجود"
            
            # Check file size
            file_size = file_path.stat().st_size
            if file_size > self.max_file_size:
                return False, f"حجم الملف كبير جداً (الحد الأقصى: {self.max_file_size // (1024*1024)} MB)"
            
            if file_size == 0:
                return False, "الملف فارغ"
            
            # Check file extension
            if file_path.suffix.lower() not in self.supported_extensions:
                return False, f"نوع الملف غير مدعوم. الأنواع المدعومة: {', '.join(self.supported_extensions)}"
            
            # Check MIME type
            mime_type, _ = mimetypes.guess_type(str(file_path))
            if mime_type not in self.supported_video_types:
                return False, f"نوع MIME غير مدعوم: {mime_type}"
            
            # Content validation (optional)
            if check_content:
                if not self._validate_video_content(file_path):
                    return False, "محتوى الملف غير صحيح أو تالف"
            
            return True, "الملف صحيح"
            
        except Exception as e:
            logger.error(f"Error validating file: {str(e)}")
            return False, f"خطأ في التحقق من الملف: {str(e)}"
    
    def _validate_video_content(self, file_path: Path) -> bool:
        """
        التحقق من محتوى الفيديو
        
        Args:
            file_path: مسار الملف
            
        Returns:
            True إذا كان المحتوى صحيحاً
        """
        try:
            import cv2
            cap = cv2.VideoCapture(str(file_path))
            
            if not cap.isOpened():
                return False
            
            # Try to read first frame
            ret, frame = cap.read()
            cap.release()
            
            return ret and frame is not None
            
        except Exception as e:
            logger.error(f"Error validating video content: {str(e)}")
            return False
    
    def calculate_file_hash(self, file_path: str, algorithm: str = 'sha256') -> str:
        """
        حساب hash للملف
        
        Args:
            file_path: مسار الملف
            algorithm: خوارزمية الـ hash
            
        Returns:
            hash الملف
        """
        try:
            hash_obj = hashlib.new(algorithm)
            
            with open(file_path, 'rb') as f:
                # Read file in chunks to handle large files
                for chunk in iter(lambda: f.read(4096), b""):
                    hash_obj.update(chunk)
            
            return hash_obj.hexdigest()
            
        except Exception as e:
            logger.error(f"Error calculating file hash: {str(e)}")
            return ""
    
    def save_uploaded_file(self, file_content: bytes, filename: str, 
                          analysis_id: str) -> str:
        """
        حفظ الملف المرفوع
        
        Args:
            file_content: محتوى الملف
            filename: اسم الملف
            analysis_id: معرف التحليل
            
        Returns:
            مسار الملف المحفوظ
        """
        try:
            # Create safe filename
            safe_filename = self._create_safe_filename(filename)
            
            # Create file path with analysis ID
            file_path = self.upload_dir / f"{analysis_id}_{safe_filename}"
            
            # Write file
            with open(file_path, 'wb') as f:
                f.write(file_content)
            
            logger.info(f"File saved: {file_path}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Error saving uploaded file: {str(e)}")
            raise
    
    async def save_uploaded_file_async(self, file_content: bytes, filename: str, 
                                     analysis_id: str) -> str:
        """
        حفظ الملف المرفوع بشكل غير متزامن
        
        Args:
            file_content: محتوى الملف
            filename: اسم الملف
            analysis_id: معرف التحليل
            
        Returns:
            مسار الملف المحفوظ
        """
        try:
            # Create safe filename
            safe_filename = self._create_safe_filename(filename)
            
            # Create file path with analysis ID
            file_path = self.upload_dir / f"{analysis_id}_{safe_filename}"
            
            # Write file asynchronously
            async with aiofiles.open(file_path, 'wb') as f:
                await f.write(file_content)
            
            logger.info(f"File saved asynchronously: {file_path}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Error saving uploaded file async: {str(e)}")
            raise
    
    def _create_safe_filename(self, filename: str) -> str:
        """
        إنشاء اسم ملف آمن
        
        Args:
            filename: اسم الملف الأصلي
            
        Returns:
            اسم الملف الآمن
        """
        # Remove unsafe characters
        safe_chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_."
        safe_filename = ''.join(c for c in filename if c in safe_chars)
        
        # Ensure filename is not empty
        if not safe_filename:
            safe_filename = "video.mp4"
        
        # Limit filename length
        if len(safe_filename) > 100:
            name, ext = os.path.splitext(safe_filename)
            safe_filename = name[:95] + ext
        
        return safe_filename
    
    def save_analysis_results(self, analysis_id: str, results: Dict, 
                            format_type: str = 'json') -> str:
        """
        حفظ نتائج التحليل
        
        Args:
            analysis_id: معرف التحليل
            results: النتائج
            format_type: نوع التنسيق
            
        Returns:
            مسار الملف المحفوظ
        """
        try:
            if format_type == 'json':
                file_path = self.results_dir / f"{analysis_id}_results.json"
                with open(file_path, 'w', encoding='utf-8') as f:
                    json.dump(results, f, ensure_ascii=False, indent=2)
            
            elif format_type == 'csv':
                file_path = self.results_dir / f"{analysis_id}_results.csv"
                self._save_results_as_csv(results, file_path)
            
            elif format_type == 'xlsx':
                file_path = self.results_dir / f"{analysis_id}_results.xlsx"
                self._save_results_as_excel(results, file_path)
            
            else:
                raise ValueError(f"Unsupported format type: {format_type}")
            
            logger.info(f"Analysis results saved: {file_path}")
            return str(file_path)
            
        except Exception as e:
            logger.error(f"Error saving analysis results: {str(e)}")
            raise
    
    def _save_results_as_csv(self, results: Dict, file_path: Path):
        """
        حفظ النتائج كملف CSV
        
        Args:
            results: النتائج
            file_path: مسار الملف
        """
        try:
            import pandas as pd
            
            # Create DataFrame from detections
            if 'detections' in results and results['detections']:
                detections_data = []
                for detection in results['detections']:
                    metrics = detection.get('metrics', {})
                    row = {
                        'frame_number': detection.get('frame_number', 0),
                        'timestamp': detection.get('timestamp', 0),
                        'active_sperm': metrics.get('active_sperm', 0),
                        'motile_sperm': metrics.get('motile_sperm', 0),
                        'motility_percentage': metrics.get('motility_percentage', 0),
                        'average_velocity': metrics.get('average_velocity', 0),
                        'density': metrics.get('density', 0)
                    }
                    detections_data.append(row)
                
                df = pd.DataFrame(detections_data)
                df.to_csv(file_path, index=False, encoding='utf-8')
            
        except Exception as e:
            logger.error(f"Error saving CSV: {str(e)}")
            raise
    
    def _save_results_as_excel(self, results: Dict, file_path: Path):
        """
        حفظ النتائج كملف Excel
        
        Args:
            results: النتائج
            file_path: مسار الملف
        """
        try:
            import pandas as pd
            
            with pd.ExcelWriter(file_path, engine='openpyxl') as writer:
                # Summary sheet
                if 'summary' in results:
                    summary_df = pd.DataFrame([results['summary']])
                    summary_df.to_excel(writer, sheet_name='ملخص', index=False)
                
                # Detections sheet
                if 'detections' in results and results['detections']:
                    detections_data = []
                    for detection in results['detections']:
                        metrics = detection.get('metrics', {})
                        row = {
                            'رقم الإطار': detection.get('frame_number', 0),
                            'الوقت': detection.get('timestamp', 0),
                            'الحيوانات النشطة': metrics.get('active_sperm', 0),
                            'الحيوانات المتحركة': metrics.get('motile_sperm', 0),
                            'نسبة الحركة': metrics.get('motility_percentage', 0),
                            'متوسط السرعة': metrics.get('average_velocity', 0),
                            'الكثافة': metrics.get('density', 0)
                        }
                        detections_data.append(row)
                    
                    detections_df = pd.DataFrame(detections_data)
                    detections_df.to_excel(writer, sheet_name='التحليلات', index=False)
                
                # Tracks sheet
                if 'tracks' in results and results['tracks']:
                    tracks_df = pd.DataFrame(results['tracks'])
                    tracks_df.to_excel(writer, sheet_name='المسارات', index=False)
            
        except Exception as e:
            logger.error(f"Error saving Excel: {str(e)}")
            raise
    
    def create_results_archive(self, analysis_id: str) -> str:
        """
        إنشاء أرشيف للنتائج
        
        Args:
            analysis_id: معرف التحليل
            
        Returns:
            مسار ملف الأرشيف
        """
        try:
            archive_path = self.results_dir / f"{analysis_id}_archive.zip"
            
            with zipfile.ZipFile(archive_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
                # Add all result files for this analysis
                for file_pattern in ['json', 'csv', 'xlsx']:
                    result_file = self.results_dir / f"{analysis_id}_results.{file_pattern}"
                    if result_file.exists():
                        zipf.write(result_file, result_file.name)
                
                # Add video file if exists
                video_files = list(self.upload_dir.glob(f"{analysis_id}_*"))
                for video_file in video_files:
                    zipf.write(video_file, f"original_{video_file.name}")
            
            logger.info(f"Archive created: {archive_path}")
            return str(archive_path)
            
        except Exception as e:
            logger.error(f"Error creating archive: {str(e)}")
            raise
    
    def cleanup_old_files(self, max_age_days: int = 7):
        """
        تنظيف الملفات القديمة
        
        Args:
            max_age_days: العمر الأقصى للملفات بالأيام
        """
        try:
            import time
            
            current_time = time.time()
            max_age_seconds = max_age_days * 24 * 60 * 60
            
            # Clean upload directory
            self._cleanup_directory(self.upload_dir, current_time, max_age_seconds)
            
            # Clean results directory
            self._cleanup_directory(self.results_dir, current_time, max_age_seconds)
            
            # Clean temp directory
            self._cleanup_directory(self.temp_dir, current_time, max_age_seconds)
            
            logger.info(f"Cleanup completed. Removed files older than {max_age_days} days")
            
        except Exception as e:
            logger.error(f"Error in cleanup: {str(e)}")
    
    def _cleanup_directory(self, directory: Path, current_time: float, max_age_seconds: float):
        """
        تنظيف مجلد محدد
        
        Args:
            directory: المجلد
            current_time: الوقت الحالي
            max_age_seconds: العمر الأقصى بالثواني
        """
        try:
            for file_path in directory.iterdir():
                if file_path.is_file():
                    file_age = current_time - file_path.stat().st_mtime
                    if file_age > max_age_seconds:
                        file_path.unlink()
                        logger.info(f"Deleted old file: {file_path}")
                
        except Exception as e:
            logger.error(f"Error cleaning directory {directory}: {str(e)}")
    
    def get_file_info(self, file_path: str) -> Dict:
        """
        الحصول على معلومات الملف
        
        Args:
            file_path: مسار الملف
            
        Returns:
            معلومات الملف
        """
        try:
            file_path = Path(file_path)
            
            if not file_path.exists():
                return {}
            
            stat = file_path.stat()
            
            info = {
                'filename': file_path.name,
                'size': stat.st_size,
                'size_mb': round(stat.st_size / (1024 * 1024), 2),
                'created_at': datetime.fromtimestamp(stat.st_ctime).isoformat(),
                'modified_at': datetime.fromtimestamp(stat.st_mtime).isoformat(),
                'extension': file_path.suffix.lower(),
                'mime_type': mimetypes.guess_type(str(file_path))[0],
                'hash': self.calculate_file_hash(str(file_path))
            }
            
            return info
            
        except Exception as e:
            logger.error(f"Error getting file info: {str(e)}")
            return {}
    
    def get_storage_usage(self) -> Dict:
        """
        الحصول على استخدام التخزين
        
        Returns:
            معلومات استخدام التخزين
        """
        try:
            def get_directory_size(directory: Path) -> int:
                """حساب حجم المجلد"""
                total_size = 0
                for file_path in directory.rglob('*'):
                    if file_path.is_file():
                        total_size += file_path.stat().st_size
                return total_size
            
            upload_size = get_directory_size(self.upload_dir)
            results_size = get_directory_size(self.results_dir)
            static_size = get_directory_size(self.static_dir)
            temp_size = get_directory_size(self.temp_dir)
            
            total_size = upload_size + results_size + static_size + temp_size
            
            usage = {
                'upload_size': upload_size,
                'upload_size_mb': round(upload_size / (1024 * 1024), 2),
                'results_size': results_size,
                'results_size_mb': round(results_size / (1024 * 1024), 2),
                'static_size': static_size,
                'static_size_mb': round(static_size / (1024 * 1024), 2),
                'temp_size': temp_size,
                'temp_size_mb': round(temp_size / (1024 * 1024), 2),
                'total_size': total_size,
                'total_size_mb': round(total_size / (1024 * 1024), 2)
            }
            
            return usage
            
        except Exception as e:
            logger.error(f"Error getting storage usage: {str(e)}")
            return {}
    
    def delete_analysis_files(self, analysis_id: str) -> bool:
        """
        حذف ملفات التحليل
        
        Args:
            analysis_id: معرف التحليل
            
        Returns:
            True إذا تم الحذف بنجاح
        """
        try:
            deleted_files = []
            
            # Delete upload files
            upload_files = list(self.upload_dir.glob(f"{analysis_id}_*"))
            for file_path in upload_files:
                file_path.unlink()
                deleted_files.append(str(file_path))
            
            # Delete result files
            result_files = list(self.results_dir.glob(f"{analysis_id}_*"))
            for file_path in result_files:
                file_path.unlink()
                deleted_files.append(str(file_path))
            
            logger.info(f"Deleted files for analysis {analysis_id}: {deleted_files}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting analysis files: {str(e)}")
            return False