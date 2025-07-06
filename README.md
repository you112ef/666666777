# 🧠 Sperm Analyzer AI (Real APK Build)

تحليل الحيوانات المنوية باستخدام الذكاء الاصطناعي بطريقة حقيقية، بدون محاكاة أو وظائف وهمية. هذا المشروع يجمع بين YOLOv8 وDeepSORT وFastAPI لإنشاء تطبيق يعمل على أندرويد (APK) لتحليل فيديوهات الحيوانات المنوية وعرض نتائج إحصائية واقعية.

---

## 📦 مكونات المشروع

- **YOLOv8 + DeepSORT**: لكشف وتتبع الحيوانات المنوية.
- **FastAPI**: لخدمة API فعالة تقبل الفيديوهات وتعيد التحليلات.
- **React Native (Expo)**: لبناء واجهة التطبيق.
- **Chart.js**: لعرض الرسوم البيانية في التطبيق.
- **i18n + RTL**: دعم اللغة العربية بشكل كامل من اليمين لليسار.

---

## 📲 المتطلبات

### 1. Backend - FastAPI

```bash
cd backend/
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 2. AI Model - YOLOv8 + DeepSORT

```bash
cd model/
python train.py --data data.yaml --weights yolov8n.pt --epochs 100
python infer.py --source sample_video.mp4 --weights best.pt
```

### 3. Frontend - React Native (Expo)

```bash
cd frontend/
npm install
npm start
```

### 4. APK Build

```bash
cd frontend/
npm install -g eas-cli
eas build:configure
eas build -p android
```

---

## 🐳 Docker للـ Backend

```bash
cd backend/
docker build -t sperm-analyzer-api .
docker run -p 8000:8000 sperm-analyzer-api
```

---

## 📁 هيكل المشروع

```
sperm-analyzer-ai/
├── backend/           # FastAPI API
├── frontend/          # React Native App
├── model/             # YOLOv8 + DeepSORT
├── results/           # تحليل ونتائج
├── export/            # سكريبت لتشغيل في Termux
└── README.md          # هذا الملف
```

---

## ✅ ملاحظات مهمة

- جميع المكونات حقيقية، بدون استخدام بيانات وهمية أو محاكاة.
- يمكنك تشغيل backend محليًا أو داخل Termux.
- التطبيق متوافق مع Android 8 وما فوق.
- تأكد من أن جهازك يدعم تشغيل فيديو .mp4 و .avi.

---

## 📬 تواصل

للتقارير أو المساهمة في المشروع، افتح Issue أو Pull Request على:

🔗 github.com/username/sperm-analyzer-ai
