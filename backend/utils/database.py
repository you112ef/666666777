import sqlite3
import json
import logging
from typing import Dict, List, Optional, Any
from datetime import datetime
from pathlib import Path
import asyncio
import aiosqlite

logger = logging.getLogger(__name__)

class Database:
    """
    قاعدة بيانات لحفظ تاريخ التحليلات والنتائج
    """
    
    def __init__(self, db_path: str = "sperm_analyzer.db"):
        """
        تهيئة قاعدة البيانات
        
        Args:
            db_path: مسار قاعدة البيانات
        """
        self.db_path = db_path
        self.db_file = Path(db_path)
        
    async def init_db(self):
        """تهيئة قاعدة البيانات وإنشاء الجداول"""
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # Create analyses table
                await db.execute('''
                    CREATE TABLE IF NOT EXISTS analyses (
                        id TEXT PRIMARY KEY,
                        status TEXT NOT NULL,
                        created_at DATETIME NOT NULL,
                        updated_at DATETIME NOT NULL,
                        video_path TEXT,
                        video_info TEXT,
                        parameters TEXT,
                        progress INTEGER DEFAULT 0,
                        message TEXT,
                        error_message TEXT,
                        results_path TEXT,
                        results_json TEXT
                    )
                ''')
                
                # Create analysis_metrics table
                await db.execute('''
                    CREATE TABLE IF NOT EXISTS analysis_metrics (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        analysis_id TEXT NOT NULL,
                        frame_number INTEGER NOT NULL,
                        timestamp REAL NOT NULL,
                        active_sperm INTEGER,
                        motile_sperm INTEGER,
                        motility_percentage REAL,
                        average_velocity REAL,
                        density REAL,
                        FOREIGN KEY (analysis_id) REFERENCES analyses (id)
                    )
                ''')
                
                # Create tracks table
                await db.execute('''
                    CREATE TABLE IF NOT EXISTS tracks (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        analysis_id TEXT NOT NULL,
                        track_id INTEGER NOT NULL,
                        duration REAL,
                        total_distance REAL,
                        average_speed REAL,
                        positions_count INTEGER,
                        is_motile BOOLEAN,
                        FOREIGN KEY (analysis_id) REFERENCES analyses (id)
                    )
                ''')
                
                # Create system_logs table
                await db.execute('''
                    CREATE TABLE IF NOT EXISTS system_logs (
                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                        timestamp DATETIME NOT NULL,
                        level TEXT NOT NULL,
                        message TEXT NOT NULL,
                        analysis_id TEXT,
                        module TEXT
                    )
                ''')
                
                await db.commit()
                logger.info("Database initialized successfully")
                
        except Exception as e:
            logger.error(f"Error initializing database: {str(e)}")
            raise
    
    async def save_analysis(self, analysis_id: str, status: str, video_path: str = None,
                           video_info: Dict = None, parameters: Dict = None) -> bool:
        """
        حفظ تحليل جديد
        
        Args:
            analysis_id: معرف التحليل
            status: حالة التحليل
            video_path: مسار الفيديو
            video_info: معلومات الفيديو
            parameters: معاملات التحليل
            
        Returns:
            True إذا تم الحفظ بنجاح
        """
        try:
            current_time = datetime.now().isoformat()
            
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute('''
                    INSERT OR REPLACE INTO analyses 
                    (id, status, created_at, updated_at, video_path, video_info, parameters)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                ''', (
                    analysis_id,
                    status,
                    current_time,
                    current_time,
                    video_path,
                    json.dumps(video_info) if video_info else None,
                    json.dumps(parameters) if parameters else None
                ))
                
                await db.commit()
                logger.info(f"Analysis saved: {analysis_id}")
                return True
                
        except Exception as e:
            logger.error(f"Error saving analysis: {str(e)}")
            return False
    
    async def update_analysis_status(self, analysis_id: str, status: str, 
                                   progress: int = None, message: str = None,
                                   error_message: str = None) -> bool:
        """
        تحديث حالة التحليل
        
        Args:
            analysis_id: معرف التحليل
            status: الحالة الجديدة
            progress: نسبة التقدم
            message: رسالة الحالة
            error_message: رسالة الخطأ
            
        Returns:
            True إذا تم التحديث بنجاح
        """
        try:
            current_time = datetime.now().isoformat()
            
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute('''
                    UPDATE analyses 
                    SET status = ?, updated_at = ?, progress = ?, message = ?, error_message = ?
                    WHERE id = ?
                ''', (status, current_time, progress, message, error_message, analysis_id))
                
                await db.commit()
                logger.info(f"Analysis status updated: {analysis_id} -> {status}")
                return True
                
        except Exception as e:
            logger.error(f"Error updating analysis status: {str(e)}")
            return False
    
    async def save_analysis_results(self, analysis_id: str, results: Dict,
                                  results_path: str = None) -> bool:
        """
        حفظ نتائج التحليل
        
        Args:
            analysis_id: معرف التحليل
            results: النتائج
            results_path: مسار ملف النتائج
            
        Returns:
            True إذا تم الحفظ بنجاح
        """
        try:
            current_time = datetime.now().isoformat()
            
            async with aiosqlite.connect(self.db_path) as db:
                # Update main analysis record
                await db.execute('''
                    UPDATE analyses 
                    SET results_path = ?, results_json = ?, updated_at = ?
                    WHERE id = ?
                ''', (results_path, json.dumps(results), current_time, analysis_id))
                
                # Save frame metrics
                if 'detections' in results:
                    for detection in results['detections']:
                        metrics = detection.get('metrics', {})
                        await db.execute('''
                            INSERT INTO analysis_metrics 
                            (analysis_id, frame_number, timestamp, active_sperm, motile_sperm,
                             motility_percentage, average_velocity, density)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            analysis_id,
                            detection.get('frame_number', 0),
                            detection.get('timestamp', 0),
                            metrics.get('active_sperm', 0),
                            metrics.get('motile_sperm', 0),
                            metrics.get('motility_percentage', 0),
                            metrics.get('average_velocity', 0),
                            metrics.get('density', 0)
                        ))
                
                # Save track data
                if 'tracks' in results:
                    for track in results['tracks']:
                        await db.execute('''
                            INSERT INTO tracks 
                            (analysis_id, track_id, duration, total_distance, average_speed,
                             positions_count, is_motile)
                            VALUES (?, ?, ?, ?, ?, ?, ?)
                        ''', (
                            analysis_id,
                            track.get('track_id', 0),
                            track.get('duration', 0),
                            track.get('total_distance', 0),
                            track.get('average_speed', 0),
                            track.get('positions_count', 0),
                            track.get('is_motile', False)
                        ))
                
                await db.commit()
                logger.info(f"Analysis results saved: {analysis_id}")
                return True
                
        except Exception as e:
            logger.error(f"Error saving analysis results: {str(e)}")
            return False
    
    async def get_analysis(self, analysis_id: str) -> Optional[Dict]:
        """
        الحصول على تحليل محدد
        
        Args:
            analysis_id: معرف التحليل
            
        Returns:
            بيانات التحليل أو None
        """
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                
                cursor = await db.execute('''
                    SELECT * FROM analyses WHERE id = ?
                ''', (analysis_id,))
                
                row = await cursor.fetchone()
                
                if row:
                    analysis = dict(row)
                    
                    # Parse JSON fields
                    if analysis['video_info']:
                        analysis['video_info'] = json.loads(analysis['video_info'])
                    if analysis['parameters']:
                        analysis['parameters'] = json.loads(analysis['parameters'])
                    if analysis['results_json']:
                        analysis['results_json'] = json.loads(analysis['results_json'])
                    
                    return analysis
                
                return None
                
        except Exception as e:
            logger.error(f"Error getting analysis: {str(e)}")
            return None
    
    async def get_analysis_history(self, limit: int = 50, offset: int = 0) -> List[Dict]:
        """
        الحصول على تاريخ التحليلات
        
        Args:
            limit: عدد النتائج
            offset: الإزاحة
            
        Returns:
            قائمة التحليلات
        """
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                
                cursor = await db.execute('''
                    SELECT id, status, created_at, updated_at, progress, message, error_message
                    FROM analyses 
                    ORDER BY created_at DESC
                    LIMIT ? OFFSET ?
                ''', (limit, offset))
                
                rows = await cursor.fetchall()
                
                history = []
                for row in rows:
                    analysis = dict(row)
                    history.append(analysis)
                
                return history
                
        except Exception as e:
            logger.error(f"Error getting analysis history: {str(e)}")
            return []
    
    async def get_analysis_metrics(self, analysis_id: str) -> List[Dict]:
        """
        الحصول على مقاييس التحليل
        
        Args:
            analysis_id: معرف التحليل
            
        Returns:
            قائمة المقاييس
        """
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                
                cursor = await db.execute('''
                    SELECT * FROM analysis_metrics 
                    WHERE analysis_id = ?
                    ORDER BY frame_number
                ''', (analysis_id,))
                
                rows = await cursor.fetchall()
                
                metrics = []
                for row in rows:
                    metric = dict(row)
                    metrics.append(metric)
                
                return metrics
                
        except Exception as e:
            logger.error(f"Error getting analysis metrics: {str(e)}")
            return []
    
    async def get_analysis_tracks(self, analysis_id: str) -> List[Dict]:
        """
        الحصول على مسارات التحليل
        
        Args:
            analysis_id: معرف التحليل
            
        Returns:
            قائمة المسارات
        """
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                
                cursor = await db.execute('''
                    SELECT * FROM tracks 
                    WHERE analysis_id = ?
                    ORDER BY track_id
                ''', (analysis_id,))
                
                rows = await cursor.fetchall()
                
                tracks = []
                for row in rows:
                    track = dict(row)
                    tracks.append(track)
                
                return tracks
                
        except Exception as e:
            logger.error(f"Error getting analysis tracks: {str(e)}")
            return []
    
    async def delete_analysis(self, analysis_id: str) -> bool:
        """
        حذف التحليل
        
        Args:
            analysis_id: معرف التحليل
            
        Returns:
            True إذا تم الحذف بنجاح
        """
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # Delete from all related tables
                await db.execute('DELETE FROM analysis_metrics WHERE analysis_id = ?', (analysis_id,))
                await db.execute('DELETE FROM tracks WHERE analysis_id = ?', (analysis_id,))
                await db.execute('DELETE FROM analyses WHERE id = ?', (analysis_id,))
                
                await db.commit()
                logger.info(f"Analysis deleted: {analysis_id}")
                return True
                
        except Exception as e:
            logger.error(f"Error deleting analysis: {str(e)}")
            return False
    
    async def get_statistics(self) -> Dict:
        """
        الحصول على الإحصائيات العامة
        
        Returns:
            الإحصائيات العامة
        """
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                
                # Total analyses
                cursor = await db.execute('SELECT COUNT(*) as total FROM analyses')
                total_analyses = (await cursor.fetchone())['total']
                
                # Status counts
                cursor = await db.execute('''
                    SELECT status, COUNT(*) as count 
                    FROM analyses 
                    GROUP BY status
                ''')
                status_counts = {}
                async for row in cursor:
                    status_counts[row['status']] = row['count']
                
                # Recent analyses (last 30 days)
                cursor = await db.execute('''
                    SELECT COUNT(*) as recent 
                    FROM analyses 
                    WHERE created_at >= datetime('now', '-30 days')
                ''')
                recent_analyses = (await cursor.fetchone())['recent']
                
                # Average processing time (for completed analyses)
                cursor = await db.execute('''
                    SELECT AVG(
                        (julianday(updated_at) - julianday(created_at)) * 24 * 60
                    ) as avg_processing_time
                    FROM analyses 
                    WHERE status = 'completed'
                ''')
                avg_processing_time = (await cursor.fetchone())['avg_processing_time']
                
                statistics = {
                    'total_analyses': total_analyses,
                    'status_counts': status_counts,
                    'recent_analyses': recent_analyses,
                    'average_processing_time_minutes': avg_processing_time or 0
                }
                
                return statistics
                
        except Exception as e:
            logger.error(f"Error getting statistics: {str(e)}")
            return {}
    
    async def log_system_event(self, level: str, message: str, 
                             analysis_id: str = None, module: str = None) -> bool:
        """
        تسجيل حدث النظام
        
        Args:
            level: مستوى الحدث
            message: رسالة الحدث
            analysis_id: معرف التحليل (اختياري)
            module: اسم الوحدة (اختياري)
            
        Returns:
            True إذا تم التسجيل بنجاح
        """
        try:
            current_time = datetime.now().isoformat()
            
            async with aiosqlite.connect(self.db_path) as db:
                await db.execute('''
                    INSERT INTO system_logs 
                    (timestamp, level, message, analysis_id, module)
                    VALUES (?, ?, ?, ?, ?)
                ''', (current_time, level, message, analysis_id, module))
                
                await db.commit()
                return True
                
        except Exception as e:
            logger.error(f"Error logging system event: {str(e)}")
            return False
    
    async def get_system_logs(self, limit: int = 100, level: str = None) -> List[Dict]:
        """
        الحصول على سجلات النظام
        
        Args:
            limit: عدد السجلات
            level: مستوى الحدث (اختياري)
            
        Returns:
            قائمة السجلات
        """
        try:
            async with aiosqlite.connect(self.db_path) as db:
                db.row_factory = aiosqlite.Row
                
                if level:
                    cursor = await db.execute('''
                        SELECT * FROM system_logs 
                        WHERE level = ?
                        ORDER BY timestamp DESC
                        LIMIT ?
                    ''', (level, limit))
                else:
                    cursor = await db.execute('''
                        SELECT * FROM system_logs 
                        ORDER BY timestamp DESC
                        LIMIT ?
                    ''', (limit,))
                
                rows = await cursor.fetchall()
                
                logs = []
                for row in rows:
                    log = dict(row)
                    logs.append(log)
                
                return logs
                
        except Exception as e:
            logger.error(f"Error getting system logs: {str(e)}")
            return []
    
    async def cleanup_old_data(self, days_old: int = 30) -> bool:
        """
        تنظيف البيانات القديمة
        
        Args:
            days_old: عمر البيانات بالأيام
            
        Returns:
            True إذا تم التنظيف بنجاح
        """
        try:
            async with aiosqlite.connect(self.db_path) as db:
                # Delete old system logs
                await db.execute('''
                    DELETE FROM system_logs 
                    WHERE timestamp < datetime('now', '-{} days')
                '''.format(days_old))
                
                # Delete old failed analyses
                await db.execute('''
                    DELETE FROM analyses 
                    WHERE status = 'failed' 
                    AND created_at < datetime('now', '-{} days')
                '''.format(days_old))
                
                await db.commit()
                logger.info(f"Cleaned up data older than {days_old} days")
                return True
                
        except Exception as e:
            logger.error(f"Error cleaning up old data: {str(e)}")
            return False
    
    def close(self):
        """إغلاق الاتصال بقاعدة البيانات"""
        # For async operations, connections are automatically closed
        pass