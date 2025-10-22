// Web端通知诊断工具

export interface NotificationDiagnostics {
  browserSupport: boolean;
  permission: string;
  pageVisible: boolean;
  pageFocused: boolean;
  userAgent: string;
  protocol: string;
  serviceWorkerSupported: boolean;
  issues: string[];
  recommendations: string[];
}

export const runNotificationDiagnostics = (): NotificationDiagnostics => {
  const diagnostics: NotificationDiagnostics = {
    browserSupport: false,
    permission: 'unknown',
    pageVisible: true,
    pageFocused: true,
    userAgent: '',
    protocol: '',
    serviceWorkerSupported: false,
    issues: [],
    recommendations: [],
  };

  // 检查浏览器支持
  if (typeof window === 'undefined') {
    diagnostics.issues.push('不在浏览器环境中运行');
    return diagnostics;
  }

  diagnostics.userAgent = navigator.userAgent;
  diagnostics.protocol = window.location.protocol;

  // 检查Notification API支持
  if (!('Notification' in window)) {
    diagnostics.issues.push('浏览器不支持Notification API');
    diagnostics.recommendations.push('请使用现代浏览器（Chrome 22+, Firefox 22+, Safari 6+）');
  } else {
    diagnostics.browserSupport = true;
    diagnostics.permission = Notification.permission;
  }

  // 检查HTTPS协议
  if (diagnostics.protocol !== 'https:' && diagnostics.protocol !== 'file:' && !window.location.hostname.includes('localhost')) {
    diagnostics.issues.push('通知需要HTTPS协议或localhost环境');
    diagnostics.recommendations.push('请在HTTPS网站或localhost上测试通知功能');
  }

  // 检查页面可见性
  if (document.hidden) {
    diagnostics.pageVisible = false;
    diagnostics.issues.push('页面当前在后台');
    diagnostics.recommendations.push('请确保页面标签页处于活跃状态');
  }

  // 检查页面焦点
  if (!document.hasFocus()) {
    diagnostics.pageFocused = false;
    diagnostics.issues.push('页面当前失去焦点');
    diagnostics.recommendations.push('请点击页面以获得焦点');
  }

  // 检查Service Worker支持
  if ('serviceWorker' in navigator) {
    diagnostics.serviceWorkerSupported = true;
  }

  // 检查通知权限状态
  if (diagnostics.browserSupport) {
    switch (diagnostics.permission) {
      case 'denied':
        diagnostics.issues.push('通知权限被拒绝');
        diagnostics.recommendations.push('请在浏览器设置中允许通知权限，或重新加载页面重新请求权限');
        break;
      case 'default':
        diagnostics.issues.push('尚未请求通知权限');
        diagnostics.recommendations.push('请点击"请求通知权限"按钮');
        break;
      case 'granted':
        // 权限正常
        break;
    }
  }

  // 浏览器特定问题检查
  const userAgent = diagnostics.userAgent.toLowerCase();
  
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
    diagnostics.recommendations.push('Safari浏览器可能需要用户交互才能显示通知');
  }
  
  if (userAgent.includes('firefox')) {
    diagnostics.recommendations.push('Firefox浏览器可能需要在设置中启用通知');
  }

  if (userAgent.includes('mobile')) {
    diagnostics.issues.push('移动浏览器的通知支持可能有限');
    diagnostics.recommendations.push('建议在桌面浏览器中测试通知功能');
  }

  return diagnostics;
};

export const printDiagnosticsReport = (): NotificationDiagnostics => {
  const diagnostics = runNotificationDiagnostics();
  
  console.log('🔍 Web通知诊断报告');
  console.log('==================');
  
  console.log('📋 基本信息:');
  console.log(`  浏览器支持: ${diagnostics.browserSupport ? '✅' : '❌'}`);
  console.log(`  通知权限: ${diagnostics.permission}`);
  console.log(`  页面可见: ${diagnostics.pageVisible ? '✅' : '❌'}`);
  console.log(`  页面焦点: ${diagnostics.pageFocused ? '✅' : '❌'}`);
  console.log(`  协议: ${diagnostics.protocol}`);
  console.log(`  Service Worker: ${diagnostics.serviceWorkerSupported ? '✅' : '❌'}`);
  
  if (diagnostics.issues.length > 0) {
    console.log('⚠️ 发现的问题:');
    diagnostics.issues.forEach((issue, index) => {
      console.log(`  ${index + 1}. ${issue}`);
    });
  }
  
  if (diagnostics.recommendations.length > 0) {
    console.log('💡 建议:');
    diagnostics.recommendations.forEach((rec, index) => {
      console.log(`  ${index + 1}. ${rec}`);
    });
  }
  
  if (diagnostics.issues.length === 0) {
    console.log('✅ 未发现明显问题，通知功能应该正常工作');
  }
  
  console.log('==================');
  
  return diagnostics;
};

// 测试通知显示的高级函数
export const testNotificationWithDiagnostics = async (title: string, body: string): Promise<boolean> => {
  console.log('🧪 开始通知诊断测试...');
  
  const diagnostics = printDiagnosticsReport();
  
  if (!diagnostics.browserSupport) {
    console.error('❌ 浏览器不支持通知，测试终止');
    return false;
  }
  
  if (diagnostics.permission !== 'granted') {
    console.error('❌ 通知权限不足，测试终止');
    return false;
  }
  
  try {
    console.log('🚀 创建测试通知...');
    
    const notification = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: 'diagnostic-test',
      requireInteraction: false,
      silent: false,
    });
    
    let notificationShown = false;
    let notificationError = false;
    
    // 监听通知事件
    notification.onshow = () => {
      console.log('🎉 诊断测试：通知已成功显示');
      notificationShown = true;
    };
    
    notification.onerror = (error) => {
      console.error('❌ 诊断测试：通知显示失败', error);
      notificationError = true;
    };
    
    notification.onclick = () => {
      console.log('🖱️ 诊断测试：用户点击了通知');
      notification.close();
    };
    
    // 等待一段时间检查结果
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (notificationError) {
      console.error('❌ 通知显示过程中发生错误');
      return false;
    }
    
    if (!notificationShown) {
      console.warn('⚠️ 通知可能未显示或显示事件未触发');
      console.log('💡 这可能是正常的，某些浏览器不会触发onshow事件');
    }
    
    // 自动关闭通知
    setTimeout(() => {
      notification.close();
    }, 5000);
    
    console.log('✅ 诊断测试完成');
    return true;
    
  } catch (error) {
    console.error('❌ 诊断测试失败:', error);
    return false;
  }
};

// 在开发模式下自动运行诊断
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  setTimeout(() => {
    console.log('🔍 自动运行Web通知诊断...');
    printDiagnosticsReport();
  }, 3000);
}