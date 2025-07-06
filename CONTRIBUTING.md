# 🤝 دليل المساهمة | Contributing Guide

## العربية | Arabic

### 👋 مرحباً بالمساهمين

نرحب بمساهماتكم في تطوير **Sperm Analyzer AI**! هذا الدليل سيساعدكم في البدء بالمساهمة في المشروع.

### 🎯 كيفية المساهمة

#### 1. إعداد البيئة المحلية
```bash
# استنساخ المستودع
git clone https://github.com/your-username/sperm-analyzer-ai.git
cd sperm-analyzer-ai

# تثبيت المتطلبات
cd frontend
npm install
cd ../backend
pip install -r requirements.txt
```

#### 2. إنشاء فرع جديد
```bash
# إنشاء فرع للميزة الجديدة
git checkout -b feature/اسم-الميزة

# أو لإصلاح خطأ
git checkout -b fix/وصف-الخطأ
```

#### 3. إجراء التغييرات
- اكتب كود نظيف ومفهوم
- أضف تعليقات باللغة العربية والإنجليزية
- اتبع معايير التصميم المستخدمة في المشروع

#### 4. اختبار التغييرات
```bash
# اختبار الواجهة الأمامية
cd frontend
npm test

# اختبار الخادم الخلفي
cd backend
pytest
```

#### 5. إرسال Pull Request
```bash
# رفع التغييرات
git add .
git commit -m "إضافة: وصف التغييرات"
git push origin feature/اسم-الميزة
```

### 📋 أنواع المساهمات المرحب بها

#### 🐛 إصلاح الأخطاء
- إصلاح الأخطاء البرمجية
- تحسين الأداء
- إصلاح مشاكل الواجهة

#### 🌟 الميزات الجديدة
- إضافة خوارزميات تحليل جديدة
- تحسين واجهة المستخدم
- إضافة دعم لغات أخرى

#### 📖 الوثائق
- تحسين الوثائق الموجودة
- إضافة أمثلة جديدة
- ترجمة الوثائق

#### 🎨 التصميم
- تحسين واجهة المستخدم
- إضافة رسوم بيانية جديدة
- تحسين تجربة المستخدم

### 🔧 معايير البرمجة

#### React Native
```javascript
// استخدم أسماء واضحة للمتغيرات
const analysisResults = await analyzeSpermVideo(videoPath);

// أضف تعليقات للوظائف المعقدة
/**
 * تحليل فيديو الحيوانات المنوية
 * @param {string} videoPath - مسار الفيديو
 * @returns {Object} نتائج التحليل
 */
const analyzeSpermVideo = async (videoPath) => {
  // منطق التحليل
};
```

#### Python (FastAPI)
```python
# استخدم Type Hints
from typing import List, Dict, Optional

async def analyze_sperm_video(
    video_path: str,
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    """
    تحليل فيديو الحيوانات المنوية
    
    Args:
        video_path: مسار الفيديو
        parameters: معاملات التحليل
    
    Returns:
        نتائج التحليل
    """
    # منطق التحليل
    pass
```

---

## English

### 👋 Welcome Contributors

We welcome contributions to **Sperm Analyzer AI**! This guide will help you get started with contributing to the project.

### 🎯 How to Contribute

#### 1. Set up local environment
```bash
# Clone repository
git clone https://github.com/your-username/sperm-analyzer-ai.git
cd sperm-analyzer-ai

# Install dependencies
cd frontend
npm install
cd ../backend
pip install -r requirements.txt
```

#### 2. Create new branch
```bash
# Create feature branch
git checkout -b feature/feature-name

# Or bug fix branch
git checkout -b fix/bug-description
```

#### 3. Make changes
- Write clean, understandable code
- Add comments in both Arabic and English
- Follow the project's design patterns

#### 4. Test changes
```bash
# Test frontend
cd frontend
npm test

# Test backend
cd backend
pytest
```

#### 5. Submit Pull Request
```bash
# Push changes
git add .
git commit -m "Add: description of changes"
git push origin feature/feature-name
```

### 📋 Types of Contributions Welcome

#### 🐛 Bug Fixes
- Fix programming errors
- Performance improvements
- UI/UX issues

#### 🌟 New Features
- Add new analysis algorithms
- Improve user interface
- Add support for other languages

#### 📖 Documentation
- Improve existing documentation
- Add new examples
- Translate documentation

#### 🎨 Design
- Improve user interface
- Add new charts
- Enhance user experience

### 🔧 Coding Standards

#### React Native
```javascript
// Use clear variable names
const analysisResults = await analyzeSpermVideo(videoPath);

// Add comments for complex functions
/**
 * Analyze sperm video
 * @param {string} videoPath - Video file path
 * @returns {Object} Analysis results
 */
const analyzeSpermVideo = async (videoPath) => {
  // Analysis logic
};
```

#### Python (FastAPI)
```python
# Use Type Hints
from typing import List, Dict, Optional

async def analyze_sperm_video(
    video_path: str,
    parameters: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Analyze sperm video
    
    Args:
        video_path: Path to video file
        parameters: Analysis parameters
    
    Returns:
        Analysis results
    """
    # Analysis logic
    pass
```

---

## 📬 الاتصال | Contact

### للأسئلة | For Questions
- **GitHub Issues**: [طرح سؤال](https://github.com/your-username/sperm-analyzer-ai/issues/new?template=question.md)
- **GitHub Discussions**: [مناقشة](https://github.com/your-username/sperm-analyzer-ai/discussions)

### للمساعدة | For Help
- **Discord**: [انضم للمجتمع](https://discord.gg/sperm-analyzer-ai)
- **Telegram**: [@SpermAnalyzerAI](https://t.me/SpermAnalyzerAI)

---

## 🏆 الاعتراف بالمساهمين | Recognition

جميع المساهمين سيتم ذكرهم في:
- ملف README
- قائمة المساهمين
- الإصدارات

All contributors will be recognized in:
- README file
- Contributors list
- Release notes

---

## 📄 رخصة المساهمة | Contribution License

بالمساهمة في هذا المشروع، أنت توافق على أن مساهماتك ستكون مرخصة تحت رخصة MIT نفسها.

By contributing to this project, you agree that your contributions will be licensed under the same MIT License.

---

**شكراً لكم على المساهمة في تطوير هذا المشروع! 🙏**

**Thank you for contributing to this project! 🙏**