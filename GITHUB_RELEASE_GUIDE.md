# 🚀 دليل نشر GitHub مع APK | GitHub Release Guide with APK

## 📋 نظرة عامة | Overview

### العربية
هذا الدليل يوضح خطوات نشر تطبيق **Sperm Analyzer AI** على GitHub مع إنشاء إصدارات APK تلقائياً.

### English
This guide explains how to publish the **Sperm Analyzer AI** app on GitHub with automatic APK release creation.

---

## 📦 المتطلبات المسبقة | Prerequisites

### العربية
قبل البدء، تأكد من توفر:
- حساب GitHub
- حساب Expo (للبناء)
- Android Studio (للتطوير المحلي)
- Git مثبت على جهازك

### English
Before starting, ensure you have:
- GitHub account
- Expo account (for building)
- Android Studio (for local development)
- Git installed on your system

---

## 🏗️ إعداد المستودع | Repository Setup

### العربية

#### 1. إنشاء مستودع جديد
```bash
# إنشاء مستودع جديد على GitHub
# اسم المستودع: sperm-analyzer-ai
# وصف: AI-powered sperm analysis Android app
# عام أم خاص: عام (Public)
```

#### 2. استنساخ المستودع محلياً
```bash
git clone https://github.com/YOUR_USERNAME/sperm-analyzer-ai.git
cd sperm-analyzer-ai
```

#### 3. إضافة الملفات الموجودة
```bash
# نسخ جميع ملفات المشروع إلى المجلد
cp -r /path/to/your/project/* .

# إضافة جميع الملفات
git add .
git commit -m "🎉 Initial commit: Complete Sperm Analyzer AI app"
git push origin main
```

### English

#### 1. Create New Repository
```bash
# Create new repository on GitHub
# Repository name: sperm-analyzer-ai
# Description: AI-powered sperm analysis Android app
# Public or Private: Public
```

#### 2. Clone Repository Locally
```bash
git clone https://github.com/YOUR_USERNAME/sperm-analyzer-ai.git
cd sperm-analyzer-ai
```

#### 3. Add Existing Files
```bash
# Copy all project files to the folder
cp -r /path/to/your/project/* .

# Add all files
git add .
git commit -m "🎉 Initial commit: Complete Sperm Analyzer AI app"
git push origin main
```

---

## 🔧 إعداد GitHub Actions | GitHub Actions Setup

### العربية

#### 1. إنشاء Secrets
اذهب إلى Settings > Secrets and variables > Actions وأضف:

```
EXPO_TOKEN=your_expo_token_here
ANDROID_KEYSTORE_FILE=your_keystore_content_base64
ANDROID_KEYSTORE_PASSWORD=your_keystore_password
ANDROID_KEY_ALIAS=your_key_alias
ANDROID_KEY_PASSWORD=your_key_password
DISCORD_WEBHOOK=your_discord_webhook_url
CODECOV_TOKEN=your_codecov_token
```

#### 2. تفعيل GitHub Actions
الملف `.github/workflows/build-apk.yml` سيقوم بـ:
- بناء APK تلقائياً
- تشغيل الاختبارات
- رفع APK كـ artifact
- إنشاء releases تلقائياً

### English

#### 1. Create Secrets
Go to Settings > Secrets and variables > Actions and add:

```
EXPO_TOKEN=your_expo_token_here
ANDROID_KEYSTORE_FILE=your_keystore_content_base64
ANDROID_KEYSTORE_PASSWORD=your_keystore_password
ANDROID_KEY_ALIAS=your_key_alias
ANDROID_KEY_PASSWORD=your_key_password
DISCORD_WEBHOOK=your_discord_webhook_url
CODECOV_TOKEN=your_codecov_token
```

#### 2. Enable GitHub Actions
The `.github/workflows/build-apk.yml` file will:
- Build APK automatically
- Run tests
- Upload APK as artifact
- Create releases automatically

---

## 📱 إنشاء الإصدار الأول | Creating First Release

### العربية

#### 1. إنشاء Tag
```bash
# إنشاء tag للإصدار الأول
git tag -a v1.0.0 -m "🎉 الإصدار الأول من Sperm Analyzer AI"
git push origin v1.0.0
```

#### 2. إنشاء Release على GitHub
```bash
# الذهاب إلى صفحة Releases
# النقر على "Create a new release"
# اختيار tag: v1.0.0
# عنوان الإصدار: "🎉 Sperm Analyzer AI v1.0.0"
# وصف الإصدار: (انسخ من CHANGELOG.md)
```

#### 3. الإصدار التلقائي
GitHub Actions سيقوم بـ:
- بناء APK
- رفع APK إلى الإصدار
- إرسال إشعار Discord

### English

#### 1. Create Tag
```bash
# Create tag for first release
git tag -a v1.0.0 -m "🎉 First release of Sperm Analyzer AI"
git push origin v1.0.0
```

#### 2. Create Release on GitHub
```bash
# Go to Releases page
# Click "Create a new release"
# Choose tag: v1.0.0
# Release title: "🎉 Sperm Analyzer AI v1.0.0"
# Release description: (copy from CHANGELOG.md)
```

#### 3. Automatic Release
GitHub Actions will:
- Build APK
- Upload APK to release
- Send Discord notification

---

## 🛠️ أوامر مهمة | Important Commands

### العربية

#### بناء APK محلياً
```bash
# الانتقال إلى مجلد frontend
cd frontend

# تثبيت المتطلبات
npm install

# بناء APK
npm run build:android

# أو باستخدام EAS
eas build --platform android
```

#### تشغيل الاختبارات
```bash
# اختبار Frontend
cd frontend
npm test

# اختبار Backend
cd backend
pytest
```

#### إنشاء إصدار جديد
```bash
# تحديث رقم الإصدار في package.json
# تحديث CHANGELOG.md
# إنشاء commit جديد
git add .
git commit -m "📦 Bump version to v1.0.1"

# إنشاء tag جديد
git tag -a v1.0.1 -m "🔧 Bug fixes and improvements"
git push origin v1.0.1
```

### English

#### Build APK Locally
```bash
# Navigate to frontend folder
cd frontend

# Install dependencies
npm install

# Build APK
npm run build:android

# Or using EAS
eas build --platform android
```

#### Run Tests
```bash
# Test Frontend
cd frontend
npm test

# Test Backend
cd backend
pytest
```

#### Create New Release
```bash
# Update version in package.json
# Update CHANGELOG.md
# Create new commit
git add .
git commit -m "📦 Bump version to v1.0.1"

# Create new tag
git tag -a v1.0.1 -m "🔧 Bug fixes and improvements"
git push origin v1.0.1
```

---

## 📊 مراقبة الإصدارات | Release Monitoring

### العربية

#### GitHub Actions Status
- تحقق من تبويب "Actions" في مستودع GitHub
- مراقبة حالة البناء
- تحميل APK من Artifacts

#### Discord Notifications
- إعداد webhook للإشعارات
- تلقي إشعارات البناء
- مراقبة الأخطاء

#### Download Statistics
- مراقبة تنزيلات APK
- تحليل الإحصائيات
- تتبع المستخدمين

### English

#### GitHub Actions Status
- Check "Actions" tab in GitHub repository
- Monitor build status
- Download APK from Artifacts

#### Discord Notifications
- Setup webhook for notifications
- Receive build notifications
- Monitor errors

#### Download Statistics
- Monitor APK downloads
- Analyze statistics
- Track users

---

## 📋 قائمة مراجعة النشر | Release Checklist

### العربية
- [ ] إنشاء مستودع GitHub
- [ ] إضافة جميع الملفات
- [ ] إعداد GitHub Actions
- [ ] إضافة Secrets
- [ ] اختبار البناء محلياً
- [ ] إنشاء tag للإصدار
- [ ] إنشاء Release على GitHub
- [ ] التحقق من APK
- [ ] تحديث الوثائق
- [ ] إشعار المجتمع

### English
- [ ] Create GitHub repository
- [ ] Add all files
- [ ] Setup GitHub Actions
- [ ] Add Secrets
- [ ] Test local build
- [ ] Create release tag
- [ ] Create GitHub Release
- [ ] Verify APK
- [ ] Update documentation
- [ ] Notify community

---

## 🚨 استكشاف الأخطاء | Troubleshooting

### العربية

#### مشاكل البناء الشائعة
```bash
# خطأ في Expo token
# الحل: تحقق من صحة EXPO_TOKEN في Secrets

# خطأ في keystore
# الحل: تحقق من ملف keystore وكلمة المرور

# خطأ في المتطلبات
# الحل: تحديث package.json و requirements.txt
```

#### مشاكل APK
```bash
# APK لا يعمل
# الحل: تحقق من الأذونات في AndroidManifest.xml

# أخطاء في الكاميرا
# الحل: تحقق من أذونات الكاميرا

# مشاكل في الشبكة
# الحل: تحقق من إعدادات API
```

### English

#### Common Build Issues
```bash
# Expo token error
# Solution: Check EXPO_TOKEN validity in Secrets

# Keystore error
# Solution: Verify keystore file and password

# Dependencies error
# Solution: Update package.json and requirements.txt
```

#### APK Issues
```bash
# APK not working
# Solution: Check permissions in AndroidManifest.xml

# Camera errors
# Solution: Check camera permissions

# Network issues
# Solution: Check API settings
```

---

## 🔗 روابط مفيدة | Useful Links

### العربية
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Android Developer Guide](https://developer.android.com/guide)

### English
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Expo Build Documentation](https://docs.expo.dev/build/introduction/)
- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Android Developer Guide](https://developer.android.com/guide)

---

## 📞 المساعدة | Support

### العربية
إذا واجهت مشاكل في النشر:
- افتح issue في المستودع
- راسلنا على: support@sperm-analyzer-ai.com
- انضم إلى مجتمع Discord

### English
If you encounter publishing issues:
- Open issue in the repository
- Contact us at: support@sperm-analyzer-ai.com
- Join our Discord community

---

**نجح النشر! تطبيقك الآن متاح للتحميل من GitHub! 🎉**

**Publishing successful! Your app is now available for download from GitHub! 🎉**