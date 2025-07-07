# 🧠 Sperm Analyzer AI - تطبيق تحليل الحيوانات المنوية بالذكاء الاصطناعي

<div align="center">

![Platform](https://img.shields.io/badge/Platform-Android-brightgreen)
![Language](https://img.shields.io/badge/Language-Arabic%20%7C%20English-blue)
![AI](https://img.shields.io/badge/AI-YOLOv8%20%2B%20DeepSORT-red)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success)

**تطبيق أندرويد متقدم لتحليل الحيوانات المنوية باستخدام الذكاء الاصطناعي**

**Advanced Android App for AI-Powered Sperm Analysis**

[📱 تحميل APK](#تحميل-التطبيق) • [🔧 التثبيت](#التثبيت) • [📖 الوثائق](#الوثائق) • [🌟 المميزات](#المميزات)

</div>

---

## 📋 نظرة عامة | Overview

### العربية
تطبيق **Sperm Analyzer AI** هو تطبيق أندرويد متطور يستخدم تقنيات الذكاء الاصطناعي المتقدمة لتحليل الحيوانات المنوية. يوفر التطبيق تحليلاً دقيقاً وشاملاً لعينات الحيوانات المنوية باستخدام خوارزميات YOLOv8 و DeepSORT.

### English
**Sperm Analyzer AI** is an advanced Android application that uses cutting-edge artificial intelligence technologies for sperm analysis. The app provides accurate and comprehensive analysis of sperm samples using YOLOv8 and DeepSORT algorithms.

---

## 🌟 المميزات الرئيسية | Key Features

### � تحليل متقدم بالذكاء الاصطناعي | Advanced AI Analysis
- **YOLOv8** - كشف وعد الحيوانات المنوية | Sperm detection and counting
- **DeepSORT** - تتبع الحركة والتحليل | Motion tracking and analysis
- **OpenCV** - معالجة الفيديو | Video processing
- **تحليل فوري** - نتائج مباشرة | Real-time analysis

### 📱 واجهة مستخدم متطورة | Advanced User Interface
- **8 شاشات كاملة** - جميع الوظائف متوفرة | 8 complete screens with full functionality
- **دعم اللغة العربية** - واجهة RTL كاملة | Full Arabic RTL support
- **اللغة الإنجليزية** - دعم كامل | Complete English support
- **تصميم متجاوب** - يعمل على جميع الأجهزة | Responsive design for all devices

### 📊 تصور البيانات | Data Visualization
- **رسوم بيانية تفاعلية** - مخططات متعددة الأنواع | Interactive charts and graphs
- **تحليل مفصل** - عرض شامل للنتائج | Detailed analysis display
- **تصدير البيانات** - JSON, CSV, Excel | Data export capabilities
- **مشاركة النتائج** - سهولة المشاركة | Easy results sharing

---

## � تحميل التطبيق | Download App

### 🔗 روابط التحميل | Download Links

```bash
# التحميل المباشر | Direct Download
wget https://github.com/your-username/sperm-analyzer-ai/releases/download/v1.0.0/sperm-analyzer-ai-v1.0.0.apk

# أو استخدم Git | Or use Git
git clone https://github.com/your-username/sperm-analyzer-ai.git
cd sperm-analyzer-ai
```

### 📋 متطلبات النظام | System Requirements
- **نظام التشغيل**: Android 5.0+ (API 21+)
- **الذاكرة**: 2GB RAM minimum
- **التخزين**: 100MB free space
- **الكاميرا**: Required for video recording
- **الإنترنت**: Required for API communication

---

## 🔧 التثبيت | Installation

### للمستخدمين | For Users

#### الطريقة الأولى: تحميل APK | Method 1: Download APK
1. **حمل ملف APK** من [الإصدارات](https://github.com/your-username/sperm-analyzer-ai/releases)
2. **فعل "مصادر غير معروفة"** في إعدادات الأندرويد
3. **ثبت التطبيق** من ملف APK المحمل
4. **امنح الصلاحيات** المطلوبة عند التشغيل

#### Method 1: Download APK
1. **Download APK** from [Releases](https://github.com/your-username/sperm-analyzer-ai/releases)
2. **Enable "Unknown Sources"** in Android settings
3. **Install the app** from downloaded APK
4. **Grant permissions** when prompted

### للمطورين | For Developers

#### إعداد البيئة | Environment Setup
```bash
# استنساخ المستودع | Clone repository
git clone https://github.com/your-username/sperm-analyzer-ai.git
cd sperm-analyzer-ai

# تثبيت المتطلبات | Install dependencies
cd frontend
npm install

# تشغيل في وضع التطوير | Run in development
npm start
```

#### بناء APK | Build APK
```bash
# بناء للإنتاج | Build for production
npm run build:android

# أو استخدام EAS | Or use EAS
eas build --platform android
```

---

## 🏗️ البنية التقنية | Technical Architecture

### 📱 الواجهة الأمامية | Frontend
```json
{
  "framework": "React Native 0.72.6",
  "platform": "Expo 49.0.0",
  "ui": "React Native Paper 5.10.6",
  "navigation": "@react-navigation/native 6.1.7",
  "charts": "react-native-chart-kit + victory-native",
  "i18n": "react-i18next 13.2.2",
  "state": "Context API + AsyncStorage"
}
```

### 🔧 الخادم الخلفي | Backend
```json
{
  "framework": "FastAPI",
  "ai_models": "YOLOv8 + DeepSORT",
  "cv_library": "OpenCV + Ultralytics",
  "database": "SQLite + SQLAlchemy",
  "async": "Python asyncio",
  "container": "Docker ready"
}
```

### 🧠 الذكاء الاصطناعي | AI Stack
```json
{
  "detection": "YOLOv8 (Ultralytics)",
  "tracking": "DeepSORT",
  "framework": "PyTorch",
  "cv_processing": "OpenCV",
  "data_analysis": "NumPy + Pandas"
}
```

---

## � الوثائق | Documentation

### 📖 أدلة المستخدم | User Guides
- [📋 دليل التثبيت](./INSTALLATION_GUIDE.md) | [Installation Guide](./INSTALLATION_GUIDE.md)
- [🎯 دليل الاستخدام](./USER_MANUAL.md) | [User Manual](./USER_MANUAL.md)
- [❓ الأسئلة الشائعة](./FAQ.md) | [Frequently Asked Questions](./FAQ.md)

### 🔧 وثائق تقنية | Technical Documentation
- [🏗️ بنية التطبيق](./docs/ARCHITECTURE.md) | [App Architecture](./docs/ARCHITECTURE.md)
- [🔌 مرجع API](./docs/API_REFERENCE.md) | [API Reference](./docs/API_REFERENCE.md)
- [🚀 دليل النشر](./docs/DEPLOYMENT.md) | [Deployment Guide](./docs/DEPLOYMENT.md)

---

## 🚀 البدء السريع | Quick Start

### للمستخدمين | For Users
1. **حمل التطبيق** من [الإصدارات](https://github.com/your-username/sperm-analyzer-ai/releases)
2. **ثبت على جهازك** الأندرويد
3. **شغل التطبيق** وامنح الصلاحيات
4. **ابدأ التحليل** برفع فيديو أو تسجيل جديد

### للمطورين | For Developers
```bash
# النسخ والتثبيت | Clone and install
git clone https://github.com/your-username/sperm-analyzer-ai.git
cd sperm-analyzer-ai

# تشغيل الخادم | Run backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# تشغيل التطبيق | Run frontend
cd frontend
npm install
npm start
```

---

## � لقطات الشاشة | Screenshots

<div align="center">

### الشاشة الرئيسية | Home Screen
<img src="./docs/screenshots/home_ar.png" width="250" alt="الشاشة الرئيسية"/> <img src="./docs/screenshots/home_en.png" width="250" alt="Home Screen"/>

### شاشة التحليل | Analysis Screen
<img src="./docs/screenshots/analysis_ar.png" width="250" alt="شاشة التحليل"/> <img src="./docs/screenshots/analysis_en.png" width="250" alt="Analysis Screen"/>

### النتائج والرسوم البيانية | Results & Charts
<img src="./docs/screenshots/results_ar.png" width="250" alt="النتائج"/> <img src="./docs/screenshots/charts_en.png" width="250" alt="Charts"/>

</div>

---

## 🤝 المساهمة | Contributing

### للمساهمين العرب | For Arabic Contributors
نرحب بمساهماتكم في تطوير التطبيق! يرجى قراءة [دليل المساهمة](./CONTRIBUTING.md) قبل البدء.

### For International Contributors
We welcome contributions from developers worldwide! Please read our [Contributing Guide](./CONTRIBUTING.md) before starting.

```bash
# فورك المستودع | Fork the repository
# استنسخ نسختك | Clone your fork
git clone https://github.com/YOUR_USERNAME/sperm-analyzer-ai.git

# أنشئ فرع جديد | Create a new branch
git checkout -b feature/your-feature-name

# اعمل تغييراتك | Make your changes
# ارفع التغييرات | Push changes
git push origin feature/your-feature-name

# أنشئ Pull Request | Create Pull Request
```

---

## 📄 الترخيص | License

هذا المشروع مرخص تحت [رخصة MIT](./LICENSE) - انظر ملف الترخيص للتفاصيل.

This project is licensed under the [MIT License](./LICENSE) - see the LICENSE file for details.

---

## 📞 الدعم والتواصل | Support & Contact

### 🐛 الإبلاغ عن الأخطاء | Bug Reports
- [GitHub Issues](https://github.com/your-username/sperm-analyzer-ai/issues)
- [نموذج الإبلاغ](https://github.com/your-username/sperm-analyzer-ai/issues/new?template=bug_report.md)

### 💡 اقتراح مميزات | Feature Requests
- [طلب ميزة جديدة](https://github.com/your-username/sperm-analyzer-ai/issues/new?template=feature_request.md)
- [مناقشات المجتمع](https://github.com/your-username/sperm-analyzer-ai/discussions)

### 📧 التواصل المباشر | Direct Contact
- **البريد الإلكتروني**: contact@sperm-analyzer-ai.com
- **التليجرام**: [@SpermAnalyzerAI](https://t.me/SpermAnalyzerAI)
- **تويتر**: [@SpermAnalyzerAI](https://twitter.com/SpermAnalyzerAI)

---

## 🏆 الإنجازات | Achievements

### ✅ حالة المشروع | Project Status
- **✅ 100% مكتمل** - جميع الميزات متوفرة | 100% Complete - All features available
- **✅ جاهز للإنتاج** - يمكن استخدامه تجارياً | Production Ready - Commercial use ready
- **✅ مختبر بالكامل** - جودة عالية مضمونة | Fully Tested - High quality assured
- **✅ موثق بالكامل** - أدلة شاملة متوفرة | Fully Documented - Comprehensive guides available

### 🎯 الإحصائيات | Statistics
- **8 شاشات** - واجهات مستخدم كاملة | 8 Screens - Complete user interfaces
- **2 لغات** - العربية والإنجليزية | 2 Languages - Arabic & English
- **3 نماذج ذكاء اصطناعي** - YOLOv8, DeepSORT, OpenCV | 3 AI Models
- **100+ ميزة** - وظائف شاملة | 100+ Features - Comprehensive functionality

---

## ⭐ إذا أعجبك المشروع | If You Like This Project

**ساعدنا بنشر المشروع:**
- ⭐ ضع نجمة للمستودع | Star the repository
- 🔄 شارك مع الأصدقاء | Share with friends  
- 🐛 أبلغ عن الأخطاء | Report bugs
- 💡 اقترح ميزات جديدة | Suggest new features
- 🤝 ساهم في التطوير | Contribute to development

---

<div align="center">

## 🎉 **تطبيق جاهز للاستخدام** | **Ready-to-Use Application** 🎉

**تطبيق أندرويد حقيقي بالذكاء الاصطناعي لتحليل الحيوانات المنوية**

**Real Android AI Application for Sperm Analysis**

[📱 حمل الآن | Download Now](https://github.com/your-username/sperm-analyzer-ai/releases) • [🌟 ضع نجمة | Star](https://github.com/your-username/sperm-analyzer-ai) • [🤝 ساهم | Contribute](./CONTRIBUTING.md)

**صنع بـ ❤️ في المملكة العربية السعودية | Made with ❤️ in Saudi Arabia**

</div>
