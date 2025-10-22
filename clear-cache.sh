#!/bin/bash
echo "清理Expo和Metro缓存..."

# 清理Expo缓存
rm -rf .expo/
echo "✅ 清理.expo目录完成"

# 清理Metro缓存
npx expo start --clear
echo "✅ 清理Metro缓存完成"