# 🧠 Sperm Analyzer AI - Complete Installation Guide

> **Real APK Build** - تطبيق APK حقيقي بالكامل لمشروع تحليل الحيوانات المنوية باستخدام الذكاء الاصطناعي

## 📋 Project Overview

This is a complete real-world implementation of a Sperm Analyzer AI application that includes:

- ✅ **Backend API** (FastAPI + YOLOv8 + DeepSORT)
- ✅ **Frontend Mobile App** (React Native + Expo)
- ✅ **AI Model** (YOLOv8 for detection + DeepSORT for tracking)
- ✅ **Real APK Build** (Production-ready Android application)
- ✅ **Arabic/English Support** (RTL layout + i18n)
- ✅ **Charts & Analytics** (Real-time data visualization)
- ✅ **Docker Support** (Containerized deployment)
- ✅ **Termux Support** (Run on Android devices)

---

## 🏗️ Architecture

```
sperm-analyzer-ai/
├── backend/              # FastAPI Server
│   ├── main.py          # Main API application
│   ├── models/          # Pydantic schemas & AI models
│   ├── utils/           # Utilities (DB, file handling, video processing)
│   ├── Dockerfile       # Docker configuration
│   └── requirements.txt # Python dependencies
├── frontend/            # React Native App
│   ├── App.js          # Main app entry point
│   ├── src/            # Source code
│   │   ├── screens/    # App screens
│   │   ├── components/ # Reusable components
│   │   ├── services/   # API & context
│   │   ├── locales/    # i18n translations
│   │   └── utils/      # Utilities & theme
│   ├── app.json        # Expo configuration
│   ├── eas.json        # EAS Build configuration
│   └── package.json    # Dependencies
├── model/              # AI Model Training
│   ├── train.py        # YOLOv8 training script
│   ├── infer.py        # Inference script
│   └── data.yaml       # Dataset configuration
├── results/            # Analysis results
├── export/             # Export scripts
├── build_apk.sh        # Termux setup script
└── README.md           # Project documentation
```

---

## 🚀 Quick Start

### Option 1: Complete Development Setup

#### 1. Clone Repository
```bash
git clone https://github.com/username/sperm-analyzer-ai.git
cd sperm-analyzer-ai
```

#### 2. Backend Setup
```bash
cd backend/
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate     # Windows

pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### 3. Frontend Setup
```bash
cd frontend/
npm install
npm start
```

#### 4. Build APK
```bash
cd frontend/
npm install -g eas-cli
eas build:configure
eas build -p android
```

### Option 2: Docker Deployment
```bash
cd backend/
docker build -t sperm-analyzer-api .
docker run -p 8000:8000 sperm-analyzer-api
```

### Option 3: Termux (Android Device)
```bash
# In Termux app
curl -O https://raw.githubusercontent.com/username/sperm-analyzer-ai/main/build_apk.sh
chmod +x build_apk.sh
./build_apk.sh
```

---

## 📱 Frontend Development

### Dependencies
The React Native app includes:

- **Navigation**: React Navigation v6
- **UI**: React Native Paper + Material Icons
- **Charts**: React Native Chart Kit + Victory Native
- **Internationalization**: react-i18next (Arabic + English)
- **State Management**: Context API + useReducer
- **HTTP Client**: Axios
- **Camera**: Expo Camera
- **File System**: Expo File System

### Key Features
- ✅ Video recording and upload
- ✅ Real-time analysis progress
- ✅ Interactive charts and graphs
- ✅ Analysis history
- ✅ Export results (JSON, CSV, Excel)
- ✅ Arabic RTL support
- ✅ Dark/Light themes
- ✅ Offline capability

### Building APK

#### Using EAS Build (Recommended)
```bash
cd frontend/
npm install -g eas-cli
eas login
eas build:configure
eas build -p android --profile production
```

#### Using Expo CLI (Legacy)
```bash
expo build:android
```

#### Manual Build (React Native CLI)
```bash
cd frontend/
react-native run-android --variant=release
```

---

## 🧠 AI Model Training

### Dataset Preparation
```bash
cd model/
# Organize your dataset:
# data/
# ├── train/
# │   ├── images/
# │   └── labels/
# └── val/
#     ├── images/
#     └── labels/
```

### Training YOLOv8
```bash
python train.py --data data.yaml --weights yolov8n.pt --epochs 100
```

### Inference
```bash
python infer.py --source video.mp4 --weights best.pt
```

### Model Integration
The trained model is automatically integrated into the backend API and used for real-time sperm detection and tracking.

---

## 🌐 API Documentation

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | API information |
| GET | `/health` | Health check |
| POST | `/analyze` | Upload & analyze video |
| GET | `/status/{id}` | Analysis status |
| GET | `/results/{id}` | Analysis results |
| GET | `/download/{id}` | Download results |
| GET | `/history` | Analysis history |
| DELETE | `/delete/{id}` | Delete analysis |

### Example Usage
```bash
# Health check
curl http://localhost:8000/health

# Upload video for analysis
curl -X POST "http://localhost:8000/analyze" \
     -H "Content-Type: multipart/form-data" \
     -F "video=@sperm_sample.mp4" \
     -F "parameters={\"confidence_threshold\": 0.5}"

# Check analysis status
curl http://localhost:8000/status/abc123

# Get results
curl http://localhost:8000/results/abc123

# Download as CSV
curl "http://localhost:8000/download/abc123?format=csv"
```

---

## 🔧 Configuration

### Backend Configuration
```python
# backend/config.py
API_HOST = "0.0.0.0"
API_PORT = 8000
DATABASE_URL = "sqlite:///./sperm_analyzer.db"
UPLOAD_DIR = "uploads"
RESULTS_DIR = "results"
MAX_FILE_SIZE = 500 * 1024 * 1024  # 500MB
```

### Frontend Configuration
```javascript
// frontend/src/config.js
export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:8000'
  : 'https://your-production-api.com';

export const APP_CONFIG = {
  maxVideoSize: 500 * 1024 * 1024, // 500MB
  supportedFormats: ['.mp4', '.avi', '.mov'],
  defaultLanguage: 'en',
  chartRefreshInterval: 2000,
};
```

---

## 📊 Features & Capabilities

### Analysis Features
- **Real-time Detection**: YOLOv8-based sperm detection
- **Motion Tracking**: DeepSORT multi-object tracking
- **Motility Analysis**: Speed and movement patterns
- **Density Calculation**: Concentration measurements
- **Statistical Analysis**: Comprehensive metrics
- **Export Formats**: JSON, CSV, Excel

### Mobile App Features
- **Multi-language**: Arabic (RTL) + English
- **Camera Integration**: Record videos directly
- **Progress Tracking**: Real-time analysis updates
- **Data Visualization**: Interactive charts
- **Offline Mode**: Local data storage
- **Share Results**: Export and share analysis

### Backend Features
- **FastAPI Framework**: Modern, fast API
- **Async Processing**: Background task handling
- **Database Integration**: SQLite + PostgreSQL support
- **File Management**: Upload/download handling
- **Docker Support**: Containerized deployment
- **API Documentation**: Auto-generated docs

---

## 🔒 Security & Privacy

### Data Protection
- ✅ Local data processing option
- ✅ Encrypted file transfer
- ✅ No data retention policies
- ✅ User consent mechanisms
- ✅ GDPR compliance ready

### API Security
- ✅ CORS configuration
- ✅ File validation
- ✅ Size limitations
- ✅ Rate limiting
- ✅ Error handling

---

## 🚀 Deployment Options

### 1. Cloud Deployment (Production)
```bash
# Deploy to cloud provider
# Configure production API URL in app
# Build production APK
eas build -p android --profile production
```

### 2. Local Network Deployment
```bash
# Run backend on local network
uvicorn main:app --host 0.0.0.0 --port 8000

# Configure app to use local IP
# Build and install APK
```

### 3. Termux Deployment (Android)
```bash
# Install Termux from F-Droid
# Run build_apk.sh script
# Access API locally on device
```

---

## 🛠️ Development Tools

### Required Software
- **Node.js** 18+ (Frontend)
- **Python** 3.8+ (Backend)
- **Android Studio** (APK building)
- **Expo CLI** (Mobile development)
- **Docker** (Containerization)

### Recommended IDE
- **VS Code** with extensions:
  - React Native Tools
  - Python
  - Docker
  - Arabic Language Pack

---

## 📈 Performance Optimization

### Backend Optimization
- **Async Processing**: Background tasks
- **Model Optimization**: Quantized models
- **Caching**: Result caching
- **Database Indexing**: Query optimization

### Mobile App Optimization
- **Image Optimization**: Compressed assets
- **Lazy Loading**: Component-based loading
- **Memory Management**: Proper cleanup
- **Network Optimization**: Request batching

---

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Port already in use
lsof -ti:8000 | xargs kill -9

# Permission errors
chmod +x build_apk.sh

# Missing dependencies
pip install -r requirements.txt
```

#### Frontend Issues
```bash
# Node modules issues
rm -rf node_modules package-lock.json
npm install

# Metro bundler issues
npx react-native start --reset-cache

# Android build issues
cd android && ./gradlew clean
```

#### APK Build Issues
```bash
# EAS build setup
eas login
eas build:configure

# Check build status
eas build:list

# Download APK
eas build:download
```

---

## 📝 Contributing

### Development Workflow
1. Fork repository
2. Create feature branch
3. Implement changes
4. Add tests
5. Submit pull request

### Code Standards
- **Backend**: Black formatting, PEP 8
- **Frontend**: ESLint, Prettier
- **Documentation**: Markdown, JSDoc
- **Testing**: Pytest, Jest

---

## 📄 License

MIT License - See LICENSE file for details.

---

## 🤝 Support

### Community
- **GitHub Issues**: Bug reports & features
- **Discussions**: Q&A and ideas
- **Wiki**: Additional documentation

### Commercial Support
Contact: info@spermanalyzer.ai

---

## 🎯 Roadmap

### Phase 1 ✅
- [x] Basic API implementation
- [x] Mobile app foundation
- [x] APK build process

### Phase 2 🔄
- [ ] Advanced AI features
- [ ] Cloud synchronization
- [ ] Multi-user support

### Phase 3 📋
- [ ] Machine learning improvements
- [ ] Advanced analytics
- [ ] Integration APIs

---

**Happy Building! 🚀**

> This is a complete, production-ready implementation of a Sperm Analyzer AI application with real APK build capabilities. All components are functional and can be deployed immediately.

---

**أتمنى لك بناءً موفقاً! 🧬**