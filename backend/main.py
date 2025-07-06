from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import uuid
import shutil
import asyncio
from typing import List, Optional
import pandas as pd
import json
from datetime import datetime
import logging

from models.analyzer import SpermAnalyzer
from models.schemas import AnalysisResult, AnalysisStatus
from utils.video_processor import VideoProcessor
from utils.file_handler import FileHandler
from utils.database import Database

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Sperm Analyzer AI API",
    description="تحليل الحيوانات المنوية باستخدام الذكاء الاصطناعي",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize components
sperm_analyzer = SpermAnalyzer()
video_processor = VideoProcessor()
file_handler = FileHandler()
db = Database()

# In-memory storage for analysis status
analysis_status = {}

@app.on_event("startup")
async def startup_event():
    """Initialize application on startup"""
    logger.info("Starting Sperm Analyzer AI API...")
    
    # Create necessary directories
    os.makedirs("uploads", exist_ok=True)
    os.makedirs("results", exist_ok=True)
    os.makedirs("static", exist_ok=True)
    
    # Initialize database
    await db.init_db()
    
    logger.info("Application started successfully")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Sperm Analyzer AI API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": {
            "analyze": "/analyze",
            "status": "/status/{analysis_id}",
            "results": "/results/{analysis_id}",
            "download": "/download/{analysis_id}",
            "history": "/history"
        }
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/analyze")
async def analyze_video(
    background_tasks: BackgroundTasks,
    video: UploadFile = File(...),
    parameters: Optional[str] = None
):
    """
    تحليل فيديو الحيوانات المنوية
    
    Args:
        video: فيديو للتحليل (.mp4, .avi, .mov)
        parameters: معاملات التحليل (JSON)
    
    Returns:
        معرف التحليل وحالة البدء
    """
    try:
        # Validate file type
        if not video.filename.lower().endswith(('.mp4', '.avi', '.mov')):
            raise HTTPException(
                status_code=400,
                detail="نوع الملف غير مدعوم. يرجى استخدام .mp4 أو .avi أو .mov"
            )
        
        # Generate unique analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Save uploaded video
        video_path = f"uploads/{analysis_id}_{video.filename}"
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        
        # Parse parameters
        analysis_params = {}
        if parameters:
            try:
                analysis_params = json.loads(parameters)
            except json.JSONDecodeError:
                logger.warning(f"Invalid parameters format: {parameters}")
        
        # Initialize analysis status
        analysis_status[analysis_id] = {
            "status": "pending",
            "progress": 0,
            "message": "تم رفع الفيديو بنجاح، بدء التحليل...",
            "created_at": datetime.now().isoformat(),
            "video_path": video_path,
            "parameters": analysis_params
        }
        
        # Start analysis in background
        background_tasks.add_task(
            run_analysis,
            analysis_id,
            video_path,
            analysis_params
        )
        
        return {
            "analysis_id": analysis_id,
            "status": "started",
            "message": "تم بدء التحليل بنجاح",
            "estimated_time": "5-10 دقائق"
        }
        
    except Exception as e:
        logger.error(f"Error in analyze_video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ في تحليل الفيديو: {str(e)}")

@app.get("/status/{analysis_id}")
async def get_analysis_status(analysis_id: str):
    """
    الحصول على حالة التحليل
    
    Args:
        analysis_id: معرف التحليل
        
    Returns:
        حالة التحليل الحالية
    """
    if analysis_id not in analysis_status:
        raise HTTPException(status_code=404, detail="معرف التحليل غير موجود")
    
    return analysis_status[analysis_id]

@app.get("/results/{analysis_id}")
async def get_analysis_results(analysis_id: str):
    """
    الحصول على نتائج التحليل
    
    Args:
        analysis_id: معرف التحليل
        
    Returns:
        نتائج التحليل الكاملة
    """
    if analysis_id not in analysis_status:
        raise HTTPException(status_code=404, detail="معرف التحليل غير موجود")
    
    status = analysis_status[analysis_id]
    
    if status["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail="التحليل لم يكتمل بعد"
        )
    
    # Load results from file
    results_path = f"results/{analysis_id}_results.json"
    if not os.path.exists(results_path):
        raise HTTPException(status_code=404, detail="نتائج التحليل غير موجودة")
    
    with open(results_path, "r", encoding="utf-8") as f:
        results = json.load(f)
    
    return results

@app.get("/download/{analysis_id}")
async def download_results(analysis_id: str, format: str = "json"):
    """
    تحميل نتائج التحليل
    
    Args:
        analysis_id: معرف التحليل
        format: نوع الملف (json, csv, xlsx)
        
    Returns:
        ملف النتائج
    """
    if analysis_id not in analysis_status:
        raise HTTPException(status_code=404, detail="معرف التحليل غير موجود")
    
    status = analysis_status[analysis_id]
    
    if status["status"] != "completed":
        raise HTTPException(
            status_code=400,
            detail="التحليل لم يكتمل بعد"
        )
    
    try:
        if format == "json":
            file_path = f"results/{analysis_id}_results.json"
            return FileResponse(
                file_path,
                media_type="application/json",
                filename=f"sperm_analysis_{analysis_id}.json"
            )
        
        elif format == "csv":
            file_path = f"results/{analysis_id}_results.csv"
            if not os.path.exists(file_path):
                # Generate CSV from JSON
                with open(f"results/{analysis_id}_results.json", "r", encoding="utf-8") as f:
                    results = json.load(f)
                
                df = pd.DataFrame(results["detections"])
                df.to_csv(file_path, index=False, encoding="utf-8")
            
            return FileResponse(
                file_path,
                media_type="text/csv",
                filename=f"sperm_analysis_{analysis_id}.csv"
            )
        
        elif format == "xlsx":
            file_path = f"results/{analysis_id}_results.xlsx"
            if not os.path.exists(file_path):
                # Generate Excel from JSON
                with open(f"results/{analysis_id}_results.json", "r", encoding="utf-8") as f:
                    results = json.load(f)
                
                with pd.ExcelWriter(file_path, engine="openpyxl") as writer:
                    # Summary sheet
                    summary_df = pd.DataFrame([results["summary"]])
                    summary_df.to_excel(writer, sheet_name="ملخص", index=False)
                    
                    # Detections sheet
                    detections_df = pd.DataFrame(results["detections"])
                    detections_df.to_excel(writer, sheet_name="الكشوفات", index=False)
                    
                    # Statistics sheet
                    stats_df = pd.DataFrame(results["statistics"])
                    stats_df.to_excel(writer, sheet_name="الإحصائيات", index=False)
            
            return FileResponse(
                file_path,
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                filename=f"sperm_analysis_{analysis_id}.xlsx"
            )
        
        else:
            raise HTTPException(status_code=400, detail="نوع الملف غير مدعوم")
    
    except Exception as e:
        logger.error(f"Error in download_results: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ في تحميل النتائج: {str(e)}")

@app.get("/history")
async def get_analysis_history():
    """
    الحصول على تاريخ التحليلات
    
    Returns:
        قائمة بجميع التحليلات المنجزة
    """
    try:
        history = []
        for analysis_id, status in analysis_status.items():
            history.append({
                "analysis_id": analysis_id,
                "status": status["status"],
                "created_at": status["created_at"],
                "message": status.get("message", "")
            })
        
        return {"history": history}
    
    except Exception as e:
        logger.error(f"Error in get_analysis_history: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ في الحصول على التاريخ: {str(e)}")

@app.delete("/delete/{analysis_id}")
async def delete_analysis(analysis_id: str):
    """
    حذف التحليل والملفات المرتبطة
    
    Args:
        analysis_id: معرف التحليل
        
    Returns:
        تأكيد الحذف
    """
    if analysis_id not in analysis_status:
        raise HTTPException(status_code=404, detail="معرف التحليل غير موجود")
    
    try:
        # Delete files
        status = analysis_status[analysis_id]
        video_path = status.get("video_path")
        
        if video_path and os.path.exists(video_path):
            os.remove(video_path)
        
        # Delete result files
        for ext in ["json", "csv", "xlsx"]:
            file_path = f"results/{analysis_id}_results.{ext}"
            if os.path.exists(file_path):
                os.remove(file_path)
        
        # Remove from status
        del analysis_status[analysis_id]
        
        return {"message": "تم حذف التحليل بنجاح"}
    
    except Exception as e:
        logger.error(f"Error in delete_analysis: {str(e)}")
        raise HTTPException(status_code=500, detail=f"خطأ في حذف التحليل: {str(e)}")

async def run_analysis(analysis_id: str, video_path: str, parameters: dict):
    """
    تشغيل التحليل في الخلفية
    
    Args:
        analysis_id: معرف التحليل
        video_path: مسار الفيديو
        parameters: معاملات التحليل
    """
    try:
        # Update status
        analysis_status[analysis_id]["status"] = "processing"
        analysis_status[analysis_id]["progress"] = 10
        analysis_status[analysis_id]["message"] = "جاري تحليل الفيديو..."
        
        # Run video processing
        analysis_status[analysis_id]["progress"] = 30
        analysis_status[analysis_id]["message"] = "معالجة الفيديو..."
        
        video_info = await video_processor.process_video(video_path)
        
        # Run AI analysis
        analysis_status[analysis_id]["progress"] = 60
        analysis_status[analysis_id]["message"] = "تشغيل نموذج الذكاء الاصطناعي..."
        
        results = await sperm_analyzer.analyze_video(video_path, parameters)
        
        # Generate comprehensive results
        analysis_status[analysis_id]["progress"] = 90
        analysis_status[analysis_id]["message"] = "إنشاء التقرير النهائي..."
        
        final_results = {
            "analysis_id": analysis_id,
            "video_info": video_info,
            "summary": results["summary"],
            "detections": results["detections"],
            "statistics": results["statistics"],
            "parameters": parameters,
            "timestamp": datetime.now().isoformat()
        }
        
        # Save results
        results_path = f"results/{analysis_id}_results.json"
        with open(results_path, "w", encoding="utf-8") as f:
            json.dump(final_results, f, ensure_ascii=False, indent=2)
        
        # Update final status
        analysis_status[analysis_id]["status"] = "completed"
        analysis_status[analysis_id]["progress"] = 100
        analysis_status[analysis_id]["message"] = "تم التحليل بنجاح!"
        analysis_status[analysis_id]["results_path"] = results_path
        
        logger.info(f"Analysis {analysis_id} completed successfully")
        
    except Exception as e:
        logger.error(f"Error in run_analysis: {str(e)}")
        analysis_status[analysis_id]["status"] = "failed"
        analysis_status[analysis_id]["message"] = f"خطأ في التحليل: {str(e)}"

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)