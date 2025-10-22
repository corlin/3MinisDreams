# Web端通知问题排查指南

## 常见问题及解决方案

### 1. 通知权限已授予但通知未显示

#### 可能原因：
- **页面在后台**：浏览器标签页不是当前活跃标签页
- **页面失去焦点**：用户点击了其他窗口或应用
- **浏览器设置**：浏览器或系统级别禁用了通知
- **协议限制**：非HTTPS网站的通知功能受限
- **浏览器兼容性**：不同浏览器的通知行为差异

#### 解决方案：

##### 1. 检查页面状态
```javascript
// 检查页面是否可见
if (document.hidden) {
    console.warn('页面在后台，通知可能不会显示');
}

// 检查页面是否有焦点
if (!document.hasFocus()) {
    console.warn('页面失去焦点，通知可能不会显示');
}
```

##### 2. 增强通知创建
```javascript
function createRobustNotification(title, body) {
    try {
        const notification = new Notification(title, {
            body,
            icon: '/favicon.ico',
            tag: 'unique-tag',
            requireInteraction: false,
            silent: false,
        });
        
        // 添加事件监听器
        notification.onshow = () => console.log('通知已显示');
        notification.onerror = (e) => console.error('通知错误:', e);
        notification.onclick = () => {
            window.focus();
            notification.close();
        };
        
        return notification;
    } catch (error) {
        console.error('创建通知失败:', error);
        return null;
    }
}
```

##### 3. 浏览器特定处理
```javascript
function handleBrowserSpecificIssues() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
        // Safari需要用户交互
        console.log('Safari浏览器，确保在用户交互后发送通知');
    }
    
    if (userAgent.includes('firefox')) {
        // Firefox可能需要特殊处理
        console.log('Firefox浏览器，检查about:config中的通知设置');
    }
    
    if (userAgent.includes('mobile')) {
        // 移动浏览器支持有限
        console.log('移动浏览器，通知功能可能受限');
    }
}
```

### 2. 通知显示但立即消失

#### 原因：
- 通知被系统或浏览器自动关闭
- 其他通知覆盖了当前通知
- 通知标签(tag)冲突

#### 解决方案：
```javascript
// 使用唯一标签避免冲突
const notification = new Notification(title, {
    body,
    tag: `notification-${Date.now()}`, // 唯一标签
    requireInteraction: true, // 要求用户交互才关闭
});

// 延长显示时间
setTimeout(() => {
    if (notification) {
        notification.close();
    }
}, 10000); // 10秒后关闭
```

### 3. 通知权限请求失败

#### 原因：
- 用户之前拒绝了权限
- 浏览器策略限制
- 非用户交互触发的权限请求

#### 解决方案：
```javascript
async function requestNotificationPermission() {
    // 检查当前权限状态
    if (Notification.permission === 'denied') {
        alert('通知权限被拒绝，请在浏览器设置中手动启用');
        return false;
    }
    
    if (Notification.permission === 'granted') {
        return true;
    }
    
    try {
        // 必须在用户交互事件中请求权限
        const permission = await Notification.requestPermission();
        return permission === 'granted';
    } catch (error) {
        console.error('请求权限失败:', error);
        return false;
    }
}
```

### 4. 开发环境vs生产环境差异

#### 开发环境 (localhost)：
- 通知功能通常正常工作
- 不需要HTTPS

#### 生产环境：
- 必须使用HTTPS
- 可能受到更严格的浏览器策略限制

#### 解决方案：
```javascript
function checkEnvironment() {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1';
    const isHTTPS = window.location.protocol === 'https:';
    
    if (!isLocalhost && !isHTTPS) {
        console.warn('生产环境需要HTTPS才能使用通知功能');
        return false;
    }
    
    return true;
}
```

## 调试工具

### 1. 使用测试页面
访问 `/notification-test.html` 进行基础功能测试

### 2. 浏览器开发者工具
- 打开控制台查看错误信息
- 检查网络标签页的权限设置
- 查看应用标签页的通知权限

### 3. 系统通知设置
- **Windows**: 设置 > 系统 > 通知和操作
- **macOS**: 系统偏好设置 > 通知
- **Linux**: 系统设置 > 通知

## 最佳实践

### 1. 渐进式增强
```javascript
function setupNotifications() {
    if (!('Notification' in window)) {
        console.log('浏览器不支持通知，使用替代方案');
        return false;
    }
    
    // 继续设置通知功能
    return true;
}
```

### 2. 用户体验优化
- 在用户交互后请求权限
- 提供清晰的权限说明
- 优雅降级到其他提醒方式

### 3. 错误处理
```javascript
function safeNotification(title, body) {
    try {
        if (Notification.permission !== 'granted') {
            throw new Error('没有通知权限');
        }
        
        const notification = new Notification(title, { body });
        
        notification.onerror = (error) => {
            console.error('通知错误:', error);
            // 回退到其他提醒方式
            showInAppAlert(title, body);
        };
        
        return notification;
    } catch (error) {
        console.error('通知创建失败:', error);
        showInAppAlert(title, body);
        return null;
    }
}
```

## 浏览器兼容性

| 浏览器 | 版本 | 支持程度 | 注意事项 |
|--------|------|----------|----------|
| Chrome | 22+ | 完全支持 | 最佳兼容性 |
| Firefox | 22+ | 完全支持 | 需检查设置 |
| Safari | 6+ | 部分支持 | 需用户交互 |
| Edge | 14+ | 完全支持 | 与Chrome类似 |
| Mobile | 各异 | 有限支持 | 建议避免使用 |

## 故障排除检查清单

- [ ] 浏览器支持Notification API
- [ ] 通知权限已授予
- [ ] 页面使用HTTPS或localhost
- [ ] 页面当前可见且有焦点
- [ ] 系统通知设置已启用
- [ ] 浏览器通知设置已启用
- [ ] 没有其他通知阻塞
- [ ] 通知标签没有冲突
- [ ] 在用户交互事件中触发