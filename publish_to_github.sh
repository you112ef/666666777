#!/bin/bash

# 🚀 Sperm Analyzer AI - GitHub Publishing Script
# This script automates the process of publishing the app to GitHub

set -e

echo "🚀 Starting GitHub Publishing Process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
REPO_NAME="sperm-analyzer-ai"
INITIAL_VERSION="v1.0.0"
BRANCH_NAME="main"

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if git is installed
check_git() {
    if ! command -v git &> /dev/null; then
        print_error "Git is not installed. Please install Git first."
        exit 1
    fi
    print_success "Git is installed"
}

# Check if we're in a git repository
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_warning "Not in a git repository. Initializing..."
        git init
        print_success "Git repository initialized"
    else
        print_success "Already in a git repository"
    fi
}

# Setup git user if not configured
setup_git_user() {
    if ! git config user.name > /dev/null 2>&1; then
        echo -n "Enter your Git username: "
        read git_username
        git config user.name "$git_username"
        print_success "Git username configured"
    fi
    
    if ! git config user.email > /dev/null 2>&1; then
        echo -n "Enter your Git email: "
        read git_email
        git config user.email "$git_email"
        print_success "Git email configured"
    fi
}

# Add remote origin
setup_remote() {
    echo -n "Enter your GitHub username: "
    read github_username
    
    remote_url="https://github.com/$github_username/$REPO_NAME.git"
    
    if git remote get-url origin > /dev/null 2>&1; then
        print_warning "Remote origin already exists"
        git remote set-url origin "$remote_url"
        print_success "Remote origin updated"
    else
        git remote add origin "$remote_url"
        print_success "Remote origin added"
    fi
    
    echo "Remote URL: $remote_url"
}

# Stage and commit all files
commit_files() {
    print_status "Staging all files..."
    git add .
    
    if git diff --cached --quiet; then
        print_warning "No changes to commit"
        return 0
    fi
    
    print_status "Committing files..."
    git commit -m "🎉 Initial commit: Complete Sperm Analyzer AI App

📱 Features:
- 8 complete screens with Arabic/English support
- AI-powered analysis with YOLOv8 + DeepSORT
- Real-time video processing
- Interactive charts and data visualization
- Export capabilities (JSON/CSV/Excel)
- Material Design UI with RTL support
- Production-ready APK with GitHub Actions

🔧 Technical Stack:
- Frontend: React Native + Expo
- Backend: FastAPI + SQLite
- AI: YOLOv8, DeepSORT, OpenCV
- Charts: Victory Native, Chart Kit
- i18n: Full Arabic RTL support

🚀 Ready for production deployment!"
    
    print_success "Files committed successfully"
}

# Create and push tags
create_tag() {
    print_status "Creating git tag $INITIAL_VERSION..."
    
    if git tag -l | grep -q "^$INITIAL_VERSION$"; then
        print_warning "Tag $INITIAL_VERSION already exists"
        return 0
    fi
    
    git tag -a "$INITIAL_VERSION" -m "🎉 First Release - Sperm Analyzer AI v1.0.0

🌟 Features:
- Complete Android app with AI analysis
- YOLOv8 + DeepSORT integration
- 8 screens with Arabic/English support
- Real-time video processing
- Interactive charts and data export
- Material Design UI
- GitHub Actions for APK building

🔬 AI Analysis:
- Sperm detection and counting
- Motility analysis
- Morphology assessment
- Concentration calculations
- Velocity measurements

📱 Mobile App:
- React Native with Expo
- Arabic RTL support
- Material Design
- Camera integration
- Real-time progress tracking

🔧 Backend:
- FastAPI with async support
- SQLite database
- Docker ready
- RESTful API

🚀 Production ready with comprehensive testing!"
    
    print_success "Tag $INITIAL_VERSION created"
}

# Push to GitHub
push_to_github() {
    print_status "Pushing to GitHub..."
    
    # Push main branch
    git push -u origin "$BRANCH_NAME"
    print_success "Main branch pushed"
    
    # Push tags
    git push origin --tags
    print_success "Tags pushed"
}

# Create .gitignore if it doesn't exist
create_gitignore() {
    if [ ! -f ".gitignore" ]; then
        print_status "Creating .gitignore file..."
        cat > .gitignore << 'EOF'
# Dependencies
node_modules/
*/node_modules/

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
env/
venv/
.env
.venv/

# React Native
.expo/
.expo-shared/
dist/
web-build/

# Android
*.apk
*.ap_
*.aab
*.dex
*.class
bin/
gen/
.gradle/
local.properties
*.keystore
!debug.keystore
*.jks

# iOS
build/
DerivedData/
*.xcworkspace
!default.xcworkspace
*.xcuserstate
*.pbxuser
!default.pbxuser
*.mode1v3
!default.mode1v3
*.mode2v3
!default.mode2v3
*.perspectivev3
!default.perspectivev3

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage
coverage/
*.lcov
.nyc_output

# AI Models
*.pt
*.pth
*.onnx
models/weights/
results/
uploads/

# Temporary files
*.tmp
*.temp
*.cache
EOF
        print_success ".gitignore created"
    fi
}

# Display final instructions
show_instructions() {
    echo ""
    echo "🎉 GitHub Publishing Complete!"
    echo ""
    echo "📋 Next Steps:"
    echo "1. Go to https://github.com/$github_username/$REPO_NAME"
    echo "2. Create a new release from tag $INITIAL_VERSION"
    echo "3. Add release notes from CHANGELOG.md"
    echo "4. Configure GitHub Actions secrets (if using automated builds)"
    echo "5. Enable GitHub Pages (if desired)"
    echo ""
    echo "🔧 GitHub Actions Setup (Optional):"
    echo "Go to Settings > Secrets and variables > Actions"
    echo "Add the following secrets:"
    echo "- EXPO_TOKEN: Your Expo access token"
    echo "- ANDROID_KEYSTORE_FILE: Base64 encoded keystore"
    echo "- ANDROID_KEYSTORE_PASSWORD: Keystore password"
    echo "- ANDROID_KEY_ALIAS: Key alias"
    echo "- ANDROID_KEY_PASSWORD: Key password"
    echo ""
    echo "🚀 Your app is now available at:"
    echo "https://github.com/$github_username/$REPO_NAME"
    echo ""
    echo "📱 APK will be built automatically when you create a release!"
}

# Main execution
main() {
    print_status "🧠 Sperm Analyzer AI - GitHub Publisher"
    print_status "======================================="
    
    # Pre-flight checks
    check_git
    check_git_repo
    setup_git_user
    
    # Setup repository
    create_gitignore
    setup_remote
    
    # Commit and push
    commit_files
    create_tag
    push_to_github
    
    # Final instructions
    show_instructions
    
    print_success "✅ Publishing completed successfully!"
}

# Error handling
trap 'print_error "Script failed at line $LINENO"' ERR

# Run main function
main "$@"