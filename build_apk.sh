#!/data/data/com.termux/files/usr/bin/bash

# 🧠 Sperm Analyzer AI - Termux Setup Script
# إعداد محلل الحيوانات المنوية AI في Termux

echo "🧠 Setting up Sperm Analyzer AI in Termux"
echo "==========================================="

# Update and upgrade packages
echo "📦 Updating Termux packages..."
pkg update -y && pkg upgrade -y

# Install required packages
echo "📦 Installing required packages..."
pkg install -y python python-pip git clang make cmake rust binutils

# Install Python packages
echo "🐍 Installing Python dependencies..."
pip install --upgrade pip
pip install wheel setuptools

# Install OpenCV and other computer vision libraries
echo "👁️ Installing computer vision libraries..."
pip install opencv-python
pip install numpy pillow matplotlib

# Install PyTorch (CPU version for Termux)
echo "🧠 Installing PyTorch..."
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu

# Install Ultralytics YOLOv8
echo "🎯 Installing YOLOv8..."
pip install ultralytics

# Install FastAPI and related packages
echo "🚀 Installing FastAPI..."
pip install fastapi uvicorn python-multipart
pip install sqlalchemy aiosqlite
pip install pandas openpyxl
pip install aiofiles

# Install DeepSORT
echo "🔄 Installing DeepSORT..."
pip install deep-sort-realtime

# Create project directory
echo "📁 Creating project directory..."
mkdir -p ~/sperm-analyzer-ai
cd ~/sperm-analyzer-ai

# Download project files (if available on GitHub)
# git clone https://github.com/username/sperm-analyzer-ai.git .

# Create basic structure
mkdir -p {backend,uploads,results,static,models}

# Create a simple FastAPI app for Termux
cat > backend/main.py << 'EOF'
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import os
import uuid
import shutil
from datetime import datetime

app = FastAPI(title="Sperm Analyzer AI - Termux Edition")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
os.makedirs("uploads", exist_ok=True)
os.makedirs("results", exist_ok=True)

@app.get("/")
async def root():
    return {
        "message": "Sperm Analyzer AI - Termux Edition",
        "status": "running",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "platform": "termux"}

@app.post("/analyze")
async def analyze_video(video: UploadFile = File(...)):
    try:
        # Generate analysis ID
        analysis_id = str(uuid.uuid4())
        
        # Save uploaded video
        video_path = f"uploads/{analysis_id}_{video.filename}"
        with open(video_path, "wb") as buffer:
            shutil.copyfileobj(video.file, buffer)
        
        # TODO: Implement actual analysis here
        # For now, return mock results
        results = {
            "analysis_id": analysis_id,
            "status": "completed",
            "message": "Analysis completed (mock)",
            "summary": {
                "total_sperm_detected": 42,
                "average_motility_percentage": 65.5,
                "average_velocity": 25.3,
                "average_density": 0.12
            }
        }
        
        return results
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

# Create startup script
cat > start_server.sh << 'EOF'
#!/data/data/com.termux/files/usr/bin/bash
cd ~/sperm-analyzer-ai
echo "🚀 Starting Sperm Analyzer AI Server..."
echo "📱 Access at: http://localhost:8000"
echo "📖 API docs at: http://localhost:8000/docs"
python backend/main.py
EOF

chmod +x start_server.sh

# Create requirements file
cat > requirements.txt << 'EOF'
fastapi==0.104.1
uvicorn[standard]==0.24.0
python-multipart==0.0.6
opencv-python==4.8.1.78
ultralytics==8.0.202
torch==2.1.0
torchvision==0.16.0
numpy==1.24.3
Pillow==10.0.1
deep-sort-realtime==1.3.2
pandas==2.1.3
sqlalchemy==2.0.23
aiosqlite==0.19.0
aiofiles==23.2.1
openpyxl==3.1.2
EOF

# Install requirements
echo "📦 Installing project requirements..."
pip install -r requirements.txt

# Create README for Termux
cat > README_TERMUX.md << 'EOF'
# 🧠 Sperm Analyzer AI - Termux Edition

## Running on Termux

### Start the server:
```bash
./start_server.sh
```

### Access the API:
- Main endpoint: http://localhost:8000
- API documentation: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### Upload and analyze video:
```bash
curl -X POST "http://localhost:8000/analyze" \
     -H "accept: application/json" \
     -H "Content-Type: multipart/form-data" \
     -F "video=@your_video.mp4"
```

### Features:
- ✅ FastAPI server running on Android
- ✅ Video upload endpoint
- ✅ Health monitoring
- ✅ CORS enabled for mobile app access
- 🔄 YOLOv8 integration (in progress)
- 🔄 DeepSORT tracking (in progress)

### Performance Notes:
- CPU-only inference on mobile device
- Reduced model size recommended
- Processing time depends on device specs

### Termux-specific optimizations:
- Uses aiosqlite instead of PostgreSQL
- CPU-optimized PyTorch
- Minimal memory footprint
EOF

echo ""
echo "✅ Termux setup completed!"
echo ""
echo "🚀 To start the server:"
echo "   ./start_server.sh"
echo ""
echo "📱 Server will be available at:"
echo "   http://localhost:8000"
echo ""
echo "📖 API documentation:"
echo "   http://localhost:8000/docs"
echo ""
echo "🔧 Next steps:"
echo "1. Run ./start_server.sh to start the API server"
echo "2. Test with: curl http://localhost:8000/health"
echo "3. Upload videos to /analyze endpoint"
echo "4. Integrate with mobile app"
echo ""
echo "⚠️  Note: This is a basic setup. For full AI functionality,"
echo "   you'll need to implement the YOLOv8 + DeepSORT integration"
echo "   in the analyze_video function."
echo ""
echo "Happy analyzing! 🧬"