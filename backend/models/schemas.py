from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class AnalysisStatus(str, Enum):
    """حالة التحليل"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class SpermDetection(BaseModel):
    """كشف الحيوان المنوي"""
    bbox: List[float] = Field(..., description="إحداثيات الصندوق المحيط")
    confidence: float = Field(..., description="مستوى الثقة")
    class_id: int = Field(..., description="معرف الفئة")
    center: List[float] = Field(..., description="مركز الكشف")
    size: List[float] = Field(..., description="حجم الكشف")

class SpermTrack(BaseModel):
    """تتبع الحيوان المنوي"""
    track_id: int = Field(..., description="معرف التتبع")
    bbox: List[float] = Field(..., description="إحداثيات الصندوق المحيط")
    center: List[float] = Field(..., description="مركز التتبع")
    velocity: float = Field(..., description="السرعة")
    confidence: float = Field(..., description="مستوى الثقة")

class FrameMetrics(BaseModel):
    """مقاييس الإطار"""
    active_sperm: int = Field(..., description="عدد الحيوانات المنوية النشطة")
    motile_sperm: int = Field(..., description="عدد الحيوانات المنوية المتحركة")
    motility_percentage: float = Field(..., description="نسبة الحركة")
    average_velocity: float = Field(..., description="متوسط السرعة")
    density: float = Field(..., description="الكثافة")
    timestamp: float = Field(..., description="الطابع الزمني")

class FrameResult(BaseModel):
    """نتيجة الإطار"""
    frame_number: int = Field(..., description="رقم الإطار")
    timestamp: float = Field(..., description="الطابع الزمني")
    detections: int = Field(..., description="عدد الكشوفات")
    tracks: int = Field(..., description="عدد التتبعات")
    metrics: FrameMetrics = Field(..., description="مقاييس الإطار")

class TrackAnalysis(BaseModel):
    """تحليل التتبع"""
    track_id: int = Field(..., description="معرف التتبع")
    duration: float = Field(..., description="مدة التتبع")
    total_distance: float = Field(..., description="المسافة الإجمالية")
    average_speed: float = Field(..., description="متوسط السرعة")
    positions_count: int = Field(..., description="عدد المواضع")
    is_motile: bool = Field(..., description="هل متحرك")

class TimeSeriesData(BaseModel):
    """بيانات السلسلة الزمنية"""
    time: float = Field(..., description="الزمن")
    sperm_count: int = Field(..., description="عدد الحيوانات المنوية")
    motility: float = Field(..., description="الحركة")
    velocity: float = Field(..., description="السرعة")
    density: float = Field(..., description="الكثافة")

class MotilityDistribution(BaseModel):
    """توزيع الحركة"""
    low: int = Field(..., description="حركة منخفضة")
    medium: int = Field(..., description="حركة متوسطة")
    high: int = Field(..., description="حركة عالية")

class VelocityDistribution(BaseModel):
    """توزيع السرعة"""
    slow: int = Field(..., description="سرعة بطيئة")
    medium: int = Field(..., description="سرعة متوسطة")
    fast: int = Field(..., description="سرعة سريعة")

class DensityStatistics(BaseModel):
    """إحصائيات الكثافة"""
    min: float = Field(..., description="الحد الأدنى")
    max: float = Field(..., description="الحد الأقصى")
    mean: float = Field(..., description="المتوسط")
    std: float = Field(..., description="الانحراف المعياري")

class Statistics(BaseModel):
    """الإحصائيات"""
    motility_distribution: MotilityDistribution = Field(..., description="توزيع الحركة")
    velocity_distribution: VelocityDistribution = Field(..., description="توزيع السرعة")
    density_statistics: DensityStatistics = Field(..., description="إحصائيات الكثافة")

class VideoInfo(BaseModel):
    """معلومات الفيديو"""
    width: int = Field(..., description="العرض")
    height: int = Field(..., description="الارتفاع")
    fps: float = Field(..., description="معدل الإطارات")
    duration: float = Field(..., description="المدة")
    total_frames: int = Field(..., description="إجمالي الإطارات")
    format: str = Field(..., description="التنسيق")

class AnalysisSummary(BaseModel):
    """ملخص التحليل"""
    total_sperm_detected: int = Field(..., description="إجمالي الحيوانات المنوية المكتشفة")
    max_concurrent_sperm: int = Field(..., description="أقصى عدد متزامن")
    average_sperm_count: float = Field(..., description="متوسط العدد")
    average_motility_percentage: float = Field(..., description="متوسط نسبة الحركة")
    max_motility_percentage: float = Field(..., description="أقصى نسبة حركة")
    average_velocity: float = Field(..., description="متوسط السرعة")
    max_velocity: float = Field(..., description="أقصى سرعة")
    average_density: float = Field(..., description="متوسط الكثافة")
    max_density: float = Field(..., description="أقصى كثافة")
    video_duration: float = Field(..., description="مدة الفيديو")
    total_frames: int = Field(..., description="إجمالي الإطارات")
    fps: float = Field(..., description="معدل الإطارات")

class AnalysisResult(BaseModel):
    """نتيجة التحليل"""
    analysis_id: str = Field(..., description="معرف التحليل")
    video_info: VideoInfo = Field(..., description="معلومات الفيديو")
    summary: AnalysisSummary = Field(..., description="ملخص التحليل")
    detections: List[FrameResult] = Field(..., description="الكشوفات")
    tracks: List[TrackAnalysis] = Field(..., description="التتبعات")
    time_series: List[TimeSeriesData] = Field(..., description="بيانات السلسلة الزمنية")
    statistics: Statistics = Field(..., description="الإحصائيات")
    parameters: Dict[str, Any] = Field(..., description="معاملات التحليل")
    timestamp: str = Field(..., description="الطابع الزمني")

class AnalysisRequest(BaseModel):
    """طلب التحليل"""
    confidence_threshold: Optional[float] = Field(0.5, description="حد الثقة")
    max_detections: Optional[int] = Field(100, description="أقصى عدد كشوفات")
    tracking_max_age: Optional[int] = Field(50, description="أقصى عمر للتتبع")
    motility_threshold: Optional[float] = Field(20.0, description="حد الحركة")
    
class AnalysisStatusResponse(BaseModel):
    """استجابة حالة التحليل"""
    analysis_id: str = Field(..., description="معرف التحليل")
    status: AnalysisStatus = Field(..., description="حالة التحليل")
    progress: int = Field(..., description="نسبة التقدم")
    message: str = Field(..., description="رسالة الحالة")
    created_at: str = Field(..., description="تاريخ الإنشاء")
    estimated_time: Optional[str] = Field(None, description="الوقت المقدر")

class AnalysisStartResponse(BaseModel):
    """استجابة بدء التحليل"""
    analysis_id: str = Field(..., description="معرف التحليل")
    status: str = Field(..., description="حالة البدء")
    message: str = Field(..., description="رسالة البدء")
    estimated_time: str = Field(..., description="الوقت المقدر")

class AnalysisHistoryItem(BaseModel):
    """عنصر تاريخ التحليل"""
    analysis_id: str = Field(..., description="معرف التحليل")
    status: AnalysisStatus = Field(..., description="حالة التحليل")
    created_at: str = Field(..., description="تاريخ الإنشاء")
    message: str = Field(..., description="رسالة الحالة")

class AnalysisHistoryResponse(BaseModel):
    """استجابة تاريخ التحليل"""
    history: List[AnalysisHistoryItem] = Field(..., description="قائمة التاريخ")

class ErrorResponse(BaseModel):
    """استجابة الخطأ"""
    error: str = Field(..., description="رسالة الخطأ")
    detail: Optional[str] = Field(None, description="تفاصيل الخطأ")
    timestamp: str = Field(..., description="الطابع الزمني")

class HealthResponse(BaseModel):
    """استجابة فحص الصحة"""
    status: str = Field(..., description="حالة الصحة")
    timestamp: str = Field(..., description="الطابع الزمني")
    version: Optional[str] = Field(None, description="إصدار التطبيق")

class APIInfo(BaseModel):
    """معلومات API"""
    message: str = Field(..., description="رسالة الترحيب")
    version: str = Field(..., description="إصدار API")
    status: str = Field(..., description="حالة API")
    endpoints: Dict[str, str] = Field(..., description="نقاط النهاية")