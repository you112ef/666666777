# 🔒 سياسة الأمان | Security Policy

## 🌐 اللغات المدعومة | Supported Languages

هذا المستند متوفر باللغتين العربية والإنجليزية.
This document is available in both Arabic and English.

---

## 🛡️ الإصدارات المدعومة | Supported Versions

### العربية
نحن نقدم تحديثات الأمان للإصدارات التالية من **Sperm Analyzer AI**:

### English
We provide security updates for the following versions of **Sperm Analyzer AI**:

| الإصدار | Version | مدعوم | Supported |
| ------- | ------- | ------ | --------- |
| 1.0.x   | 1.0.x   | ✅ | ✅ |
| 0.9.x   | 0.9.x   | ❌ | ❌ |
| < 0.9   | < 0.9   | ❌ | ❌ |

---

## 🚨 الإبلاغ عن الثغرات الأمنية | Reporting Security Vulnerabilities

### العربية

#### 📧 الإبلاغ السري
إذا اكتشفت ثغرة أمنية، **لا تقم بإنشاء Issue عام**. بدلاً من ذلك، اتصل بنا مباشرة:

- **البريد الإلكتروني**: security@sperm-analyzer-ai.com
- **تشفير PGP**: [مفتاح PGP العام](./pgp-key.txt)
- **التليجرام**: [@SpermAnalyzerAI_Security](https://t.me/SpermAnalyzerAI_Security)

#### 📋 معلومات مطلوبة
عند الإبلاغ عن ثغرة أمنية، يرجى تضمين:

1. **وصف الثغرة**: وصف مفصل للمشكلة
2. **خطوات الاستغلال**: كيفية استغلال الثغرة
3. **التأثير**: ما هي المخاطر المحتملة
4. **الحل المقترح**: إذا كان لديك اقتراح للحل
5. **معلومات البيئة**: إصدار التطبيق ونظام التشغيل

#### ⏰ زمن الاستجابة
- **الإقرار**: خلال 24 ساعة
- **التقييم الأولي**: خلال 72 ساعة
- **الإصلاح**: خلال 30 يوم (حسب التعقيد)

### English

#### 📧 Private Reporting
If you discover a security vulnerability, **do not create a public issue**. Instead, contact us directly:

- **Email**: security@sperm-analyzer-ai.com
- **PGP Encryption**: [Public PGP Key](./pgp-key.txt)
- **Telegram**: [@SpermAnalyzerAI_Security](https://t.me/SpermAnalyzerAI_Security)

#### 📋 Required Information
When reporting a security vulnerability, please include:

1. **Vulnerability Description**: Detailed description of the issue
2. **Exploitation Steps**: How to exploit the vulnerability
3. **Impact**: What are the potential risks
4. **Proposed Solution**: If you have a suggested fix
5. **Environment Information**: App version and operating system

#### ⏰ Response Time
- **Acknowledgment**: Within 24 hours
- **Initial Assessment**: Within 72 hours
- **Fix**: Within 30 days (depending on complexity)

---

## 🔒 أنواع الثغرات | Types of Vulnerabilities

### العربية
نحن مهتمون بشكل خاص بالثغرات التالية:

### English
We are particularly interested in the following vulnerabilities:

#### 🎯 عالية الأولوية | High Priority
- **حقن SQL** | SQL Injection
- **تنفيذ كود عن بعد** | Remote Code Execution
- **رفع ملفات خبيثة** | Malicious File Upload
- **تسريب البيانات** | Data Leakage
- **مشاكل المصادقة** | Authentication Issues

#### 📊 متوسطة الأولوية | Medium Priority
- **Cross-Site Scripting (XSS)**
- **Cross-Site Request Forgery (CSRF)**
- **مشاكل الأذونات** | Permission Issues
- **تسريب المعلومات** | Information Disclosure
- **مشاكل التشفير** | Encryption Issues

#### 📋 منخفضة الأولوية | Low Priority
- **مشاكل الأداء** | Performance Issues
- **مشاكل الواجهة** | UI Issues
- **مشاكل التوافق** | Compatibility Issues

---

## 🛡️ تدابير الأمان | Security Measures

### العربية
التطبيق يتضمن التدابير الأمنية التالية:

### English
The application includes the following security measures:

#### 🔐 تشفير البيانات | Data Encryption
- **TLS 1.3** للاتصالات | for communications
- **AES-256** لتشفير الملفات | for file encryption
- **bcrypt** لكلمات المرور | for password hashing

#### 🛡️ حماية API | API Protection
- **Rate Limiting** تحديد معدل الطلبات | Request rate limiting
- **Input Validation** التحقق من المدخلات | Input validation
- **CORS Protection** حماية CORS | CORS protection
- **JWT Authentication** مصادقة JWT | JWT authentication

#### 📱 حماية التطبيق | App Protection
- **Code Obfuscation** تشويش الكود | Code obfuscation
- **Certificate Pinning** تثبيت الشهادات | Certificate pinning
- **Root Detection** كشف الجذر | Root detection
- **Anti-Debugging** مكافحة التتبع | Anti-debugging

---

## 🏆 برنامج المكافآت | Bounty Program

### العربية
نحن نقدر الباحثين الأمنيين ونقدم مكافآت للثغرات الصالحة:

### English
We appreciate security researchers and offer rewards for valid vulnerabilities:

#### 💰 المكافآت | Rewards
- **حرجة | Critical**: $500 - $1000
- **عالية | High**: $200 - $500
- **متوسطة | Medium**: $50 - $200
- **منخفضة | Low**: $10 - $50

#### 📋 الشروط | Conditions
- الثغرة يجب أن تكون جديدة | Vulnerability must be new
- إثبات العمل مطلوب | Proof of concept required
- لا ضرر للبيانات | No data damage
- إتباع الإفصاح المسؤول | Follow responsible disclosure

---

## 📞 الاتصال | Contact

### العربية
للأسئلة الأمنية غير العاجلة:

### English
For non-urgent security questions:

- **البريد الإلكتروني | Email**: security@sperm-analyzer-ai.com
- **GitHub Issues**: [Security Questions](https://github.com/your-username/sperm-analyzer-ai/issues/new?template=security.md)
- **تليجرام | Telegram**: [@SpermAnalyzerAI_Security](https://t.me/SpermAnalyzerAI_Security)

---

## 📋 سجل الثغرات | Vulnerability Log

### العربية
سجل الثغرات المكتشفة والمصححة:

### English
Log of discovered and fixed vulnerabilities:

| التاريخ | Date | الثغرة | Vulnerability | الحالة | Status |
|---------|------|--------|---------------|--------|--------|
| 2024-01-15 | 2024-01-15 | مثال | Example | مصححة | Fixed |

---

## 🔄 تحديثات الأمان | Security Updates

### العربية
سيتم الإعلان عن تحديثات الأمان في:

### English
Security updates will be announced in:

- **GitHub Releases**: [صفحة الإصدارات](https://github.com/your-username/sperm-analyzer-ai/releases)
- **Security Advisories**: [الإشعارات الأمنية](https://github.com/your-username/sperm-analyzer-ai/security/advisories)
- **البريد الإلكتروني | Email**: security@sperm-analyzer-ai.com
- **تليجرام | Telegram**: [@SpermAnalyzerAI_Updates](https://t.me/SpermAnalyzerAI_Updates)

---

**نشكرك على مساعدتك في الحفاظ على أمان التطبيق! 🔒**

**Thank you for helping keep the app secure! 🔒**