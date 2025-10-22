# 📱 生成 iOS/Android 安装文件完整指南

## 重要说明

`expo export` 生成的文件**不能直接转换**为 iOS/Android 安装文件。这些文件主要用于：
- Expo Go 应用中运行
- Web 部署
- 开发和测试

要生成真正的安装文件（APK/IPA），需要使用以下方法：

## 方法一：EAS Build（推荐）

### 1. 云端构建（当前网络问题）
```bash
# Android APK
eas build --platform android --profile preview

# iOS 模拟器版本
eas build --platform ios --profile preview

# 生产版本
eas build --platform all --profile production
```

**当前状态**: ❌ 网络上传失败
**原因**: Google Cloud Storage 连接问题

### 2. 本地构建（需要完整开发环境）
```bash
# 本地 Android 构建
eas build --platform android --profile preview --local

# 本地 iOS 构建（仅限 macOS）
eas build --platform ios --profile preview --local
```

**要求**:
- Android: Android Studio + Android SDK
- iOS: Xcode + iOS SDK（仅限 macOS）

## 方法二：Expo Prebuild + 原生构建

### 1. 生成原生项目
```bash
# 生成 Android 和 iOS 原生代码
npx expo prebuild

# 仅生成 Android
npx expo prebuild --platform android

# 仅生成 iOS
npx expo prebuild --platform ios
```

### 2. 使用原生工具构建

#### Android 构建
```bash
# 进入 android 目录
cd android

# 构建 APK
./gradlew assembleRelease

# 构建 AAB（Google Play）
./gradlew bundleRelease
```

#### iOS 构建（仅限 macOS）
```bash
# 使用 Xcode 打开项目
open ios/YourApp.xcworkspace

# 或使用命令行
xcodebuild -workspace ios/YourApp.xcworkspace -scheme YourApp archive
```

## 方法三：使用 Expo Application Services

### 1. 在线构建服务
访问 [Expo.dev](https://expo.dev) 在线构建：
1. 登录 Expo 账户
2. 选择项目
3. 配置构建设置
4. 启动构建
5. 下载生成的文件

### 2. GitHub Actions 自动构建
创建 `.github/workflows/build.yml`:

```yaml
name: EAS Build
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    name: Install and build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18.x
          cache: npm
      - name: Setup Expo
        uses: expo/expo-github-action@v8
        with:
          expo-version: latest
          token: ${{ secrets.EXPO_TOKEN }}
      - name: Install dependencies
        run: npm ci
      - name: Build on EAS
        run: eas build --platform all --non-interactive
```

## 方法四：第三方构建服务

### 1. Bitrise
- 支持 React Native 和 Expo
- 免费层可用
- 自动化 CI/CD

### 2. CircleCI
- 强大的 CI/CD 平台
- 支持 Android 和 iOS 构建
- 与 GitHub 集成

### 3. GitHub Actions
- 免费的 CI/CD 服务
- 直接集成到 GitHub 仓库
- 支持多平台构建

## 当前项目的具体解决方案

### 立即可用的方案

#### 1. 使用 Expo Go（推荐）
```bash
# 启动开发服务器
npm start

# 用户在手机上：
# 1. 安装 Expo Go 应用
# 2. 扫描二维码
# 3. 直接使用完整功能
```

#### 2. Web 版本部署
```bash
# 导出 Web 版本
npx expo export --platform web

# 部署到静态服务器
npx serve dist
# 或上传到 Netlify、Vercel 等平台
```

### 解决网络问题后的方案

#### 1. 重试 EAS Build
```bash
# 等待网络稳定后重试
eas build --platform android --profile preview

# 或使用不同的网络环境
# 如：移动热点、VPN 等
```

#### 2. 配置本地构建环境

##### Android 环境配置
```bash
# 1. 安装 Android Studio
# 2. 配置 Android SDK
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

# 3. 本地构建
eas build --platform android --profile preview --local
```

##### iOS 环境配置（仅限 macOS）
```bash
# 1. 安装 Xcode
# 2. 安装 Xcode Command Line Tools
xcode-select --install

# 3. 本地构建
eas build --platform ios --profile preview --local
```

## 构建配置优化

### 更新 eas.json
```json
{
  "cli": {
    "version": ">= 13.2.0",
    "appVersionSource": "local"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      },
      "ios": {
        "simulator": true,
        "buildConfiguration": "Release"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      },
      "ios": {
        "buildConfiguration": "Release"
      }
    }
  }
}
```

### 更新 app.json
```json
{
  "expo": {
    "name": "晨梦日记",
    "slug": "morning-dream-diary",
    "version": "0.1.0",
    "android": {
      "package": "com.morningdreamdiary.app",
      "versionCode": 1,
      "compileSdkVersion": 34,
      "targetSdkVersion": 34,
      "buildToolsVersion": "34.0.0"
    },
    "ios": {
      "bundleIdentifier": "com.morningdreamdiary.app",
      "buildNumber": "1"
    }
  }
}
```

## 文件类型说明

### Expo Export 生成的文件
- **用途**: Expo Go 运行、Web 部署
- **格式**: JavaScript bundles (.js, .hbc)
- **不能**: 直接安装到设备

### 原生安装文件
- **Android**: APK（直接安装）、AAB（Google Play）
- **iOS**: IPA（App Store）、.app（模拟器）
- **生成方式**: EAS Build、原生构建工具

## 推荐的开发流程

### 开发阶段
1. 使用 `npm start` + Expo Go 快速测试
2. 使用 `expo export --platform web` 测试 Web 版本

### 测试阶段
1. 使用 EAS Build 生成测试版本
2. 分发给测试用户

### 发布阶段
1. 使用 EAS Build 生成生产版本
2. 提交到应用商店

## 总结

目前由于网络问题，EAS Build 暂时不可用，但有以下替代方案：

1. **立即可用**: Expo Go（完整功能）
2. **Web 部署**: 静态文件服务器
3. **本地构建**: 配置完整开发环境
4. **稍后重试**: 等待网络稳定

应用功能完全正常，用户可以通过 Expo Go 体验完整的愿望日记功能！