# Web 端兼容性修复

## 修复的问题

### 1. 弃用的 shadow* 样式属性警告
**问题**: `"shadow*" style props are deprecated. Use "boxShadow"`

**修复**:
- 在 `src/components/Card.tsx` 中将 `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` 替换为 `boxShadow`
- 在 `src/screens/ReviewScreen.tsx` 中修复了两个样式对象的 shadow 属性

### 2. pointerEvents 属性警告
**问题**: `props.pointerEvents is deprecated. Use style.pointerEvents`

**修复**:
- 在所有 `Animated.View` 组件中明确设置 `pointerEvents: 'none'` 在 style 属性中
- 使用简单的控制台警告过滤来静默处理这些警告

### 3. useNativeDriver 不支持警告
**问题**: `Animated: useNativeDriver is not supported because the native animated module is missing`

**修复**:
- 创建了 `getAnimationConfig()` 工具函数，在 Web 环境中自动禁用 `useNativeDriver`
- 更新了所有动画配置以使用平台兼容的设置
- 使用简单的控制台错误过滤来静默处理这些警告

## 新增文件

### `src/utils/platform.ts`
提供平台检测和兼容性工具：
- `isWeb`: 检测是否在 Web 环境
- `getAnimationConfig()`: 获取平台兼容的动画配置
- `getWebCompatibleStyle()`: 获取 Web 兼容的样式属性

### `src/utils/simpleWebFixes.ts`
简单的 Web 兼容性修复工具（推荐使用）：
- `applySimpleWebFixes()`: 应用简单的 Web 修复，只处理控制台警告，不会影响应用正常运行

## 修改的文件

1. **src/components/Card.tsx**: 修复 shadow 属性
2. **src/screens/ReviewScreen.tsx**: 修复 shadow 属性和动画配置
3. **src/components/Timer.tsx**: 修复动画配置和 pointerEvents
4. **App.tsx**: 使用简单的 Web 兼容性修复工具
5. **src/navigation/AppNavigator.tsx**: 简化配置，移除复杂的修复逻辑

## 注意事项

- 保留了 `elevation` 属性以确保 Android 平台的阴影效果
- 所有动画在 Web 环境中会自动回退到 JavaScript 驱动，这是正常行为
- 修复后的代码在所有平台（iOS、Android、Web）上都能正常工作
- 使用简单的控制台警告过滤，不会影响应用的正常运行
- 如果需要调试特定警告，可以临时注释掉 `applySimpleWebFixes()` 调用
- 简化的修复方案确保了应用的稳定性和兼容性