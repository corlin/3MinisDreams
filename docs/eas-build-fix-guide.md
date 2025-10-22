# 🔧 EAS Build 上传问题完整修复指南

## 问题分析

### 错误类型
1. **MalformedSecurityHeader**: Google Cloud Storage 签名头格式问题
2. **上传卡住**: 文件上传在 64KB 处停止

### 根本原因
- 网络连接不稳定
- 防火墙或代理干扰
- EAS CLI 版本兼容性问题
- Google Cloud Storage 服务问题

## 🚀 解决方案（按优先级排序）

### 方案一：使用 Expo Prebuild + 本地构建

这是最可靠的方法，不依赖网络上传：

```bash
# 1. 生成原生项目
npx expo prebuild --clean

# 2. 安装依赖
npm install

# 3. Android 构建
cd android
./gradlew assembleRelease

# 4. 查找生成的 APK
find . -name "*.apk" -type f
```

生成的 APK 文件通常在：
- `android/app/build/outputs/apk/release/app-release.apk`

### 方案二：网络环境优化

#### 2.1 更换网络连接
```bash
# 尝试不同的网络环境
# 1. 移动热点
# 2. 不同的 WiFi 网络
# 3. 有线网络连接
# 4. VPN 连接

# 重新尝试构建
eas build --platform android --profile preview
```

#### 2.2 配置网络代理
```bash
# 如果使用代理，配置环境变量
export HTTP_PROXY=http://proxy.example.com:8080
export HTTPS_PROXY=http://proxy.example.com:8080
export NO_PROXY=localhost,127.0.0.1

# 或者临时禁用代理
unset HTTP_PROXY HTTPS_PROXY
```

### 方案三：EAS CLI 完全重置

```bash
# 1. 完全卸载 EAS CLI
npm uninstall -g eas-cli

# 2. 清理 npm 缓存
npm cache clean --force

# 3. 重新安装最新版本
npm install -g eas-cli@latest

# 4. 重新登录
eas logout
eas login

# 5. 重新配置项目
eas build:configure
```

### 方案四：项目文件优化

#### 4.1 减少项目大小
```bash
# 1. 清理不必要的文件
rm -rf node_modules/.cache
rm -rf .expo
rm -rf dist

# 2. 添加 .easignore 文件
echo "node_modules/.cache" > .easignore
echo "dist/" >> .easignore
echo ".expo/" >> .easignore
echo "docs/" >> .easignore
echo "*.log" >> .easignore

# 3. 重新安装依赖
npm ci
```

#### 4.2 更新 EAS 配置
```json
{
  "cli": {
    "version": ">= 16.0.0",
    "appVersionSource": "local"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      },
      "cache": {
        "disabled": false
      }
    }
  }
}
```

### 方案五：使用 GitHub Actions 自动构建

创建 `.github/workflows/build-android.yml`:

```yaml
name: Build Android APK
on:
  workflow_dispatch:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Setup Java
        uses: actions/setup-java@v3
        with:
          distribution: 'temurin'
          java-version: '17'

      - name: Setup Android SDK
        uses: android-actions/setup-android@v2

      - name: Install dependencies
        run: npm ci

      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}

      - name: Generate native code
        run: npx expo prebuild --platform android --clean

      - name: Build Android APK
        run: |
          cd android
          ./gradlew assembleRelease

      - name: Upload APK
        uses: actions/upload-artifact@v3
        with:
          name: android-apk
          path: android/app/build/outputs/apk/release/app-release.apk
```

### 方案六：使用第三方构建服务

#### 6.1 Bitrise
1. 注册 [Bitrise](https://bitrise.io) 账户
2. 连接 GitHub 仓库
3. 配置 React Native 构建流程
4. 自动生成 APK

#### 6.2 CircleCI
```yaml
# .circleci/config.yml
version: 2.1
jobs:
  build-android:
    docker:
      - image: cimg/android:2023.12.1-node
    steps:
      - checkout
      - run: npm ci
      - run: npx expo prebuild --platform android --clean
      - run: cd android && ./gradlew assembleRelease
      - store_artifacts:
          path: android/app/build/outputs/apk/release/app-release.apk
```

## 🛠️ 立即可用的替代方案

### 1. 使用 Expo Go（推荐）
```bash
# 启动开发服务器
npm start

# 用户操作：
# 1. 在手机上安装 Expo Go
# 2. 扫描二维码
# 3. 直接使用完整功能
```

### 2. Web 版本部署
```bash
# 导出 Web 版本
npx expo export --platform web

# 部署到静态服务器
npx serve dist

# 或上传到免费托管平台：
# - Netlify: drag & drop dist 文件夹
# - Vercel: vercel --prod
# - GitHub Pages: 推送到 gh-pages 分支
```

### 3. 开发构建（本地）
```bash
# 如果有 Android Studio
npx expo run:android

# 如果有 Xcode（macOS）
npx expo run:ios
```

## 📱 Android APK 手动构建详细步骤

### 前置要求
1. 安装 Android Studio
2. 配置 Android SDK
3. 设置环境变量

### 构建步骤
```bash
# 1. 生成原生代码
npx expo prebuild --platform android --clean

# 2. 进入 Android 目录
cd android

# 3. 构建 Release APK
./gradlew assembleRelease

# 4. 查找生成的文件
ls -la app/build/outputs/apk/release/

# 5. 安装到设备
adb install app/build/outputs/apk/release/app-release.apk
```

### 签名 APK（可选）
```bash
# 生成签名密钥
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# 签名 APK
jarsigner -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore app-release-unsigned.apk my-key-alias

# 对齐 APK
zipalign -v 4 app-release-unsigned.apk app-release.apk
```

## 🔍 问题诊断工具

### 网络连接测试
```bash
# 测试 Google Cloud Storage 连接
curl -I https://storage.googleapis.com

# 测试 Expo 服务
curl -I https://exp.host

# 检查代理设置
echo $HTTP_PROXY
echo $HTTPS_PROXY
```

### EAS CLI 诊断
```bash
# 检查 EAS CLI 状态
eas whoami
eas --version

# 检查项目配置
eas config

# 清理本地缓存
eas build:list
```

## 📋 故障排除检查清单

- [ ] 网络连接稳定
- [ ] EAS CLI 最新版本
- [ ] 项目配置正确
- [ ] 没有代理干扰
- [ ] 磁盘空间充足
- [ ] 防火墙允许连接
- [ ] Expo 账户正常
- [ ] 项目文件完整

## 🎯 推荐的开发流程

### 开发阶段
1. 使用 `npm start` + Expo Go 快速测试
2. 使用 `expo export --platform web` 测试 Web 版本

### 测试阶段
1. 使用 `expo prebuild` + 本地构建生成 APK
2. 或使用 GitHub Actions 自动构建

### 发布阶段
1. 网络稳定时使用 EAS Build
2. 或使用本地构建 + 手动上传到应用商店

## 总结

虽然 EAS Build 遇到了网络问题，但我们有多种可靠的替代方案：

1. **立即可用**: Expo Go（完整功能测试）
2. **本地构建**: `expo prebuild` + Android Studio
3. **自动化**: GitHub Actions 构建
4. **Web 部署**: 静态文件服务器

应用功能完全正常，用户可以通过多种方式体验完整的愿望日记功能！