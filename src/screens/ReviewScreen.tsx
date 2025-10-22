import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Animated,
  Dimensions,
} from 'react-native';
import { WishEntry, AchievementReview, AchievementStatus, EmotionalState, WishStatus } from '../types';
import { StorageService } from '../services/storageService';
import { isWishReviewable, formatRelativeTime, formatDate, getDateOneWeekAgo } from '../utils/dateUtils';
import { createMultipleTestWishes, clearTestData, checkWishStatusUpdates } from '../utils/testReviewData';

const { width } = Dimensions.get('window');

interface ReviewScreenProps {
  navigation?: any;
}

const ReviewScreen: React.FC<ReviewScreenProps> = ({ navigation }) => {
  const [reviewableWishes, setReviewableWishes] = useState<WishEntry[]>([]);
  const [currentWishIndex, setCurrentWishIndex] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<AchievementStatus | null>(null);
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionalState | null>(null);
  const [reflection, setReflection] = useState('');
  const [celebrationMoment, setCelebrationMoment] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCelebration, setShowCelebration] = useState(false);
  const [successRate, setSuccessRate] = useState(0);
  const celebrationAnimation = new Animated.Value(0);

  useEffect(() => {
    loadReviewableWishes();
  }, []);

  const loadReviewableWishes = async () => {
    try {
      setLoading(true);
      const allWishes = await StorageService.getAllWishes();
      console.log('所有愿望数量:', allWishes.length);
      
      // 调试信息：显示每个愿望的创建时间和是否可回顾
      allWishes.forEach(wish => {
        const reviewable = isWishReviewable(wish.createdAt);
        console.log(`愿望 "${wish.title}": 创建于 ${formatDate(wish.createdAt)}, 可回顾: ${reviewable}`);
      });
      
      const reviewable = allWishes.filter(wish => isWishReviewable(wish.createdAt));
      console.log('可回顾愿望数量:', reviewable.length);
      
      // 过滤掉已经回顾过的愿望
      const existingReviews = await StorageService.getAllReviews();
      const reviewedWishIds = existingReviews.map(review => review.wishEntryId);
      const unreviewed = reviewable.filter(wish => !reviewedWishIds.includes(wish.id));
      
      console.log('未回顾愿望数量:', unreviewed.length);
      setReviewableWishes(unreviewed);
      
      // 计算成功率
      if (existingReviews.length > 0) {
        const successfulReviews = existingReviews.filter(
          review => review.achievementStatus === 'fully_achieved' || review.achievementStatus === 'partially_achieved'
        );
        setSuccessRate(Math.round((successfulReviews.length / existingReviews.length) * 100));
      }
    } catch (error) {
      console.error('Error loading reviewable wishes:', error);
      Alert.alert('错误', '加载可回顾愿望时出错');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusSelect = (status: AchievementStatus) => {
    setSelectedStatus(status);
  };

  const handleEmotionSelect = (emotion: EmotionalState) => {
    setSelectedEmotion(emotion);
  };

  const submitReview = async () => {
    if (!selectedStatus || !selectedEmotion) {
      Alert.alert('提示', '请选择实现状态和情感状态');
      return;
    }

    const currentWish = reviewableWishes[currentWishIndex];
    if (!currentWish) return;

    try {
      const review: AchievementReview = {
        id: `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        wishEntryId: currentWish.id,
        userId: currentWish.userId,
        achievementStatus: selectedStatus,
        achievementPercentage: getAchievementPercentage(selectedStatus),
        reflection: reflection || '暂无感悟',
        emotionalStateAfter: selectedEmotion,
        celebrationMoment: celebrationMoment || '完成了这个目标！',
        lessonsLearned: [],
        improvementAreas: [],
        nextGoals: [],
        gratitudeNotes: [],
        createdAt: new Date(),
      };

      await StorageService.saveAchievementReview(review);
      
      // 更新愿望的状态
      const newStatus = mapAchievementStatusToWishStatus(selectedStatus);
      const updatedWish: WishEntry = {
        ...currentWish,
        status: newStatus,
        updatedAt: new Date(),
      };
      await StorageService.saveWishEntry(updatedWish);
      console.log(`愿望状态已更新: "${currentWish.title}" 从 "${currentWish.status}" 更新为 "${newStatus}"`);
      
      // 显示庆祝动画
      if (selectedStatus === 'fully_achieved' || selectedStatus === 'partially_achieved') {
        showCelebrationAnimation();
      }

      // 移动到下一个愿望或完成回顾
      if (currentWishIndex < reviewableWishes.length - 1) {
        setCurrentWishIndex(currentWishIndex + 1);
        resetForm();
      } else {
        // 所有愿望都回顾完了
        Alert.alert(
          '回顾完成！',
          `恭喜你完成了所有愿望的回顾！你的总体实现率为 ${successRate}%`,
          [
            {
              text: '查看愿望列表',
              onPress: () => navigation?.navigate('WishList'),
            },
            {
              text: '查看统计',
              onPress: () => navigation?.navigate('Profile'),
            },
            {
              text: '继续记录',
              onPress: () => navigation?.navigate('WishEntry'),
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      Alert.alert('错误', '提交回顾时出错');
    }
  };

  const getAchievementPercentage = (status: AchievementStatus): number => {
    switch (status) {
      case 'fully_achieved':
        return 100;
      case 'partially_achieved':
        return 70;
      case 'in_progress':
        return 30;
      case 'not_achieved':
        return 0;
      default:
        return 0;
    }
  };

  const mapAchievementStatusToWishStatus = (achievementStatus: AchievementStatus): WishStatus => {
    switch (achievementStatus) {
      case 'fully_achieved':
        return 'achieved';
      case 'partially_achieved':
        return 'partially_achieved';
      case 'not_achieved':
        return 'not_achieved';
      case 'in_progress':
        return 'pending'; // 进行中的愿望保持待实现状态
      default:
        return 'pending';
    }
  };

  const showCelebrationAnimation = () => {
    setShowCelebration(true);
    Animated.sequence([
      Animated.timing(celebrationAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(celebrationAnimation, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowCelebration(false);
    });
  };

  const resetForm = () => {
    setSelectedStatus(null);
    setSelectedEmotion(null);
    setReflection('');
    setCelebrationMoment('');
  };

  const getStatusText = (status: AchievementStatus): string => {
    switch (status) {
      case 'fully_achieved':
        return '完全实现';
      case 'partially_achieved':
        return '部分实现';
      case 'in_progress':
        return '进行中';
      case 'not_achieved':
        return '未实现';
      default:
        return '';
    }
  };

  const getEmotionText = (emotion: EmotionalState): string => {
    switch (emotion) {
      case 'proud':
        return '自豪';
      case 'satisfied':
        return '满意';
      case 'motivated':
        return '有动力';
      case 'disappointed':
        return '失望';
      case 'determined':
        return '坚定';
      default:
        return '';
    }
  };

  const getMotivationalMessage = (status: AchievementStatus): string => {
    switch (status) {
      case 'fully_achieved':
        return '🎉 太棒了！你完全实现了这个愿望！继续保持这种积极的态度！';
      case 'partially_achieved':
        return '👏 很好！虽然部分实现，但这已经是很大的进步了！';
      case 'in_progress':
        return '💪 继续努力！你正在朝着目标前进，坚持就是胜利！';
      case 'not_achieved':
        return '🌱 没关系，每次尝试都是成长！重新调整目标，再次出发！';
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>正在加载可回顾的愿望...</Text>
      </View>
    );
  }

  if (reviewableWishes.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>🌟 暂无可回顾的愿望</Text>
          <Text style={styles.emptySubtitle}>
            当你记录的愿望满一周后，就可以在这里回顾实现情况了
          </Text>
          <Text style={styles.debugText}>
            当前时间: {formatDate(new Date())}
          </Text>
          <Text style={styles.debugText}>
            一周前: {formatDate(getDateOneWeekAgo())}
          </Text>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation?.navigate('WishEntry')}
          >
            <Text style={styles.actionButtonText}>去记录愿望</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#64748b', marginTop: 10 }]}
            onPress={() => navigation?.navigate('WishList')}
          >
            <Text style={styles.actionButtonText}>查看所有愿望</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#10b981', marginTop: 10 }]}
            onPress={async () => {
              await createMultipleTestWishes();
              loadReviewableWishes();
            }}
          >
            <Text style={styles.actionButtonText}>创建测试数据</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#ef4444', marginTop: 10 }]}
            onPress={async () => {
              await clearTestData();
              loadReviewableWishes();
            }}
          >
            <Text style={styles.actionButtonText}>清除测试数据</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: '#8b5cf6', marginTop: 10 }]}
            onPress={checkWishStatusUpdates}
          >
            <Text style={styles.actionButtonText}>检查状态更新</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const currentWish = reviewableWishes[currentWishIndex];

  return (
    <ScrollView style={styles.container}>
      {/* 庆祝动画 */}
      {showCelebration && (
        <Animated.View
          style={[
            styles.celebrationOverlay,
            {
              opacity: celebrationAnimation,
              transform: [
                {
                  scale: celebrationAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1.2],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.celebrationText}>🎉 恭喜你！ 🎉</Text>
        </Animated.View>
      )}

      {/* 进度指示器 */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          {currentWishIndex + 1} / {reviewableWishes.length}
        </Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${((currentWishIndex + 1) / reviewableWishes.length) * 100}%` },
            ]}
          />
        </View>
      </View>

      {/* 愿望卡片 */}
      <View style={styles.wishCard}>
        <Text style={styles.wishTitle}>{currentWish.title}</Text>
        <Text style={styles.wishContent}>{currentWish.content}</Text>
        <Text style={styles.wishDate}>
          记录于: {formatRelativeTime(currentWish.createdAt)}
        </Text>
        <Text style={styles.wishCategory}>分类: {currentWish.category}</Text>
      </View>

      {/* 实现状态选择 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>这个愿望实现得如何？</Text>
        <View style={styles.statusGrid}>
          {(['fully_achieved', 'partially_achieved', 'in_progress', 'not_achieved'] as AchievementStatus[]).map(
            (status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusButton,
                  selectedStatus === status && styles.statusButtonSelected,
                ]}
                onPress={() => handleStatusSelect(status)}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    selectedStatus === status && styles.statusButtonTextSelected,
                  ]}
                >
                  {getStatusText(status)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* 情感状态选择 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>现在的感受如何？</Text>
        <View style={styles.emotionGrid}>
          {(['proud', 'satisfied', 'motivated', 'disappointed', 'determined'] as EmotionalState[]).map(
            (emotion) => (
              <TouchableOpacity
                key={emotion}
                style={[
                  styles.emotionButton,
                  selectedEmotion === emotion && styles.emotionButtonSelected,
                ]}
                onPress={() => handleEmotionSelect(emotion)}
              >
                <Text
                  style={[
                    styles.emotionButtonText,
                    selectedEmotion === emotion && styles.emotionButtonTextSelected,
                  ]}
                >
                  {getEmotionText(emotion)}
                </Text>
              </TouchableOpacity>
            )
          )}
        </View>
      </View>

      {/* 激励性反馈 */}
      {selectedStatus && (
        <View style={styles.motivationContainer}>
          <Text style={styles.motivationText}>
            {getMotivationalMessage(selectedStatus)}
          </Text>
        </View>
      )}

      {/* 提交按钮 */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!selectedStatus || !selectedEmotion) && styles.submitButtonDisabled,
        ]}
        onPress={submitReview}
        disabled={!selectedStatus || !selectedEmotion}
      >
        <Text style={styles.submitButtonText}>
          {currentWishIndex < reviewableWishes.length - 1 ? '下一个愿望' : '完成回顾'}
        </Text>
      </TouchableOpacity>

      {/* 统计信息 */}
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>你的实现率</Text>
        <Text style={styles.statsValue}>{successRate}%</Text>
        <Text style={styles.statsSubtitle}>继续加油！每一步都是进步</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    textAlign: 'center',
    marginTop: 100,
    fontSize: 16,
    color: '#64748b',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 24,
  },
  actionButton: {
    backgroundColor: '#6366f1',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  actionButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  celebrationOverlay: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -width / 4 }, { translateY: -50 }],
    zIndex: 1000,
    backgroundColor: 'rgba(99, 102, 241, 0.9)',
    padding: 20,
    borderRadius: 15,
    width: width / 2,
    alignItems: 'center',
  },
  celebrationText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  progressContainer: {
    padding: 20,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 10,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6366f1',
    borderRadius: 3,
  },
  wishCard: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  wishTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 10,
  },
  wishContent: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 15,
  },
  wishDate: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 5,
  },
  wishCategory: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '500',
  },
  section: {
    margin: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 15,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  statusButton: {
    flex: 1,
    minWidth: '45%',
    padding: 15,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  statusButtonSelected: {
    borderColor: '#6366f1',
    backgroundColor: '#f1f5f9',
  },
  statusButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '500',
  },
  statusButtonTextSelected: {
    color: '#6366f1',
    fontWeight: 'bold',
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emotionButton: {
    flex: 1,
    minWidth: '30%',
    padding: 12,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  emotionButtonSelected: {
    borderColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  emotionButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  emotionButtonTextSelected: {
    color: '#10b981',
    fontWeight: 'bold',
  },
  motivationContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#fef3c7',
    borderRadius: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  motivationText: {
    fontSize: 16,
    color: '#92400e',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 24,
  },
  submitButton: {
    margin: 20,
    padding: 18,
    backgroundColor: '#6366f1',
    borderRadius: 15,
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#cbd5e1',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    margin: 20,
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 10,
  },
  statsValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#6366f1',
    marginBottom: 5,
  },
  statsSubtitle: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 5,
  },
});

export default ReviewScreen;