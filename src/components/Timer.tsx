import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

interface TimerProps {
  duration?: number; // 计时时长（秒），默认3分钟
  onComplete?: (focusTime: number) => void; // 计时完成回调
  onTimeUpdate?: (remainingTime: number, focusTime: number) => void; // 时间更新回调
  style?: any;
}

export default function Timer({ 
  duration = 180, // 3分钟 = 180秒
  onComplete,
  onTimeUpdate,
  style 
}: TimerProps) {
  const [remainingTime, setRemainingTime] = useState(duration);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [focusTime, setFocusTime] = useState(0); // 实际专注时间
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isRunning && !isPaused && remainingTime > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingTime(prev => {
          const newTime = prev - 1;
          setFocusTime(current => {
            const newFocusTime = current + 1;
            
            // 通知时间更新 - 使用setTimeout避免在render中调用
            setTimeout(() => {
              if (onTimeUpdate) {
                onTimeUpdate(newTime, newFocusTime);
              }
            }, 0);
            
            return newFocusTime;
          });
          
          // 更新进度动画
          const progress = newTime / duration;
          Animated.timing(progressAnim, {
            toValue: progress,
            duration: 100,
            useNativeDriver: false,
          }).start();

          // 计时结束
          if (newTime <= 0) {
            handleComplete();
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, isPaused, remainingTime, duration]);

  const handleComplete = () => {
    setIsRunning(false);
    setIsPaused(false);
    
    // 播放完成动画
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // 显示激励性提示
    Alert.alert(
      '🎉 专注时间完成！',
      `恭喜你完成了${Math.floor(focusTime / 60)}分${focusTime % 60}秒的专注时间！\n\n专注的力量让你的愿望更加清晰，继续保持这份专注来完成你的愿望记录吧！`,
      [
        {
          text: '太棒了！',
          onPress: () => {
            if (onComplete) {
              onComplete(focusTime);
            }
          }
        }
      ]
    );
  };

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    
    // 开始脉冲动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handlePause = () => {
    setIsPaused(true);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const handleResume = () => {
    setIsPaused(false);
    
    // 恢复脉冲动画
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  };

  const handleReset = () => {
    setIsRunning(false);
    setIsPaused(false);
    setRemainingTime(duration);
    setFocusTime(0);
    progressAnim.setValue(1);
    pulseAnim.stopAnimation();
    pulseAnim.setValue(1);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimerStatus = (): string => {
    if (!isRunning && remainingTime === duration) return '准备开始专注';
    if (isRunning && !isPaused) return '专注进行中...';
    if (isPaused) return '暂停中';
    if (remainingTime === 0) return '专注完成！';
    return '计时器已停止';
  };

  const progress = 1 - (remainingTime / duration);

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>🧘‍♀️ 3分钟专注时间</Text>
        <Text style={styles.subtitle}>{getTimerStatus()}</Text>
      </View>

      <Animated.View 
        style={[
          styles.timerCircle,
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              {
                height: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['100%', '0%'],
                }),
              }
            ]}
          />
        </View>
        
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(remainingTime)}</Text>
          <Text style={styles.focusTimeText}>
            已专注: {Math.floor(focusTime / 60)}:{(focusTime % 60).toString().padStart(2, '0')}
          </Text>
        </View>
      </Animated.View>

      <View style={styles.controls}>
        {!isRunning ? (
          <TouchableOpacity style={styles.startButton} onPress={handleStart}>
            <Text style={styles.startButtonText}>开始专注</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.runningControls}>
            <TouchableOpacity 
              style={styles.controlButton} 
              onPress={isPaused ? handleResume : handlePause}
            >
              <Text style={styles.controlButtonText}>
                {isPaused ? '继续' : '暂停'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Text style={styles.resetButtonText}>重置</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      <View style={styles.tips}>
        <Text style={styles.tipsText}>
          💡 专注小贴士：深呼吸，专心思考你的愿望，让目标更加清晰
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  timerCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: COLORS.background,
    borderWidth: 4,
    borderColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    overflow: 'hidden',
  },
  progressContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 76,
    overflow: 'hidden',
  },
  progressBar: {
    backgroundColor: COLORS.primary + '20',
    width: '100%',
  },
  timeContainer: {
    alignItems: 'center',
    zIndex: 1,
  },
  timeText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  focusTimeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  controls: {
    width: '100%',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  startButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  runningControls: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  controlButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  controlButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  resetButton: {
    backgroundColor: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 20,
    minWidth: 80,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
  },
  tips: {
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: 8,
    width: '100%',
  },
  tipsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});