import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { WishEntry } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { StorageService } from '../services/storageService';
import { formatDate, getDaysUntilTarget, getCategoryDisplayName, getStatusDisplayName } from '../utils/wishUtils';
import Card from '../components/Card';

type WishDetailRouteProp = RouteProp<{ WishDetail: { wishId: string } }, 'WishDetail'>;

export default function WishDetailScreen() {
  const route = useRoute<WishDetailRouteProp>();
  const navigation = useNavigation();
  const { wishId } = route.params;

  const [wish, setWish] = useState<WishEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  // 加载愿望详情
  const loadWishDetail = async () => {
    try {
      setLoading(true);
      const wishData = await StorageService.getWishById(wishId);
      if (wishData) {
        setWish(wishData);
      } else {
        Alert.alert('错误', '愿望不存在', [
          { text: '确定', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      console.error('Error loading wish detail:', error);
      Alert.alert('错误', '加载愿望详情失败');
    } finally {
      setLoading(false);
    }
  };

  // 处理点赞
  const handleLike = async () => {
    if (!wish || liking) return;

    try {
      setLiking(true);
      const updatedWish = {
        ...wish,
        likes: wish.isLiked ? wish.likes - 1 : wish.likes + 1,
        isLiked: !wish.isLiked,
        updatedAt: new Date(),
      };

      await StorageService.saveWishEntry(updatedWish);
      setWish(updatedWish);

      // 显示激励性反馈
      if (!wish.isLiked) {
        const encouragements = [
          '为自己点赞！你值得被鼓励 ❤️',
          '相信自己，你一定可以实现这个愿望！✨',
          '每一个点赞都是对自己的肯定 👏',
          '你的努力值得被看见和认可！🌟',
          '给自己一些正能量，继续加油！💪',
        ];
        const randomEncouragement = encouragements[Math.floor(Math.random() * encouragements.length)];
        
        Alert.alert('自我激励', randomEncouragement, [
          { text: '继续努力！', style: 'default' }
        ]);
      }
    } catch (error) {
      console.error('Error updating like:', error);
      Alert.alert('错误', '点赞失败，请重试');
    } finally {
      setLiking(false);
    }
  };

  useEffect(() => {
    loadWishDetail();
  }, [wishId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  if (!wish) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>愿望不存在</Text>
      </View>
    );
  }

  const daysUntilTarget = getDaysUntilTarget(wish);
  const isOverdue = daysUntilTarget < 0;
  const isToday = daysUntilTarget === 0;

  const getStatusColor = () => {
    switch (wish.status) {
      case 'achieved':
        return COLORS.success;
      case 'partially_achieved':
        return '#f59e0b';
      case 'not_achieved':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getTargetDateColor = () => {
    if (isOverdue) return COLORS.error;
    if (isToday) return '#f59e0b';
    if (daysUntilTarget <= 2) return '#f97316';
    return COLORS.textSecondary;
  };

  const formatTargetDateText = () => {
    if (isOverdue) {
      return `已过期 ${Math.abs(daysUntilTarget)} 天`;
    }
    if (isToday) {
      return '今天到期';
    }
    if (daysUntilTarget === 1) {
      return '明天到期';
    }
    return `还有 ${daysUntilTarget} 天`;
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 标题和状态 */}
      <Card style={styles.headerCard}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{wish.title}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>
              {getStatusDisplayName(wish.status)}
            </Text>
          </View>
        </View>
        
        <View style={styles.categoryContainer}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {getCategoryDisplayName(wish.category)}
            </Text>
          </View>
        </View>
      </Card>

      {/* 愿望内容 */}
      <Card style={styles.contentCard}>
        <Text style={styles.sectionTitle}>愿望描述</Text>
        <Text style={styles.content}>{wish.content}</Text>
      </Card>

      {/* 成功标准 */}
      {wish.successCriteria && (
        <Card style={styles.contentCard}>
          <Text style={styles.sectionTitle}>成功标准</Text>
          <Text style={styles.content}>{wish.successCriteria}</Text>
        </Card>
      )}

      {/* 具体行动步骤 */}
      {wish.specificActions.length > 0 && (
        <Card style={styles.contentCard}>
          <Text style={styles.sectionTitle}>行动步骤</Text>
          {wish.specificActions.map((action, index) => (
            <View key={index} style={styles.actionItem}>
              <Text style={styles.actionNumber}>{index + 1}.</Text>
              <Text style={styles.actionText}>{action}</Text>
            </View>
          ))}
        </Card>
      )}

      {/* 标签 */}
      {wish.tags.length > 0 && (
        <Card style={styles.contentCard}>
          <Text style={styles.sectionTitle}>标签</Text>
          <View style={styles.tagsContainer}>
            {wish.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* 时间信息 */}
      <Card style={styles.contentCard}>
        <Text style={styles.sectionTitle}>时间信息</Text>
        <View style={styles.timeInfo}>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>创建时间：</Text>
            <Text style={styles.timeValue}>{formatDate(wish.createdAt)}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>目标日期：</Text>
            <Text style={styles.timeValue}>{formatDate(wish.targetDate)}</Text>
          </View>
          <View style={styles.timeRow}>
            <Text style={styles.timeLabel}>剩余时间：</Text>
            <Text style={[styles.timeValue, { color: getTargetDateColor() }]}>
              {formatTargetDateText()}
            </Text>
          </View>
        </View>
      </Card>

      {/* 动机和专注信息 */}
      <Card style={styles.contentCard}>
        <Text style={styles.sectionTitle}>记录信息</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>动机强度</Text>
            <Text style={styles.infoValue}>{wish.motivationLevel}/10</Text>
          </View>
          {wish.focusTime && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>专注时间</Text>
              <Text style={styles.infoValue}>{Math.round(wish.focusTime / 60)}分钟</Text>
            </View>
          )}
        </View>
      </Card>

      {/* 自我激励点赞 */}
      <Card style={styles.likeCard}>
        <View style={styles.likeContainer}>
          <View style={styles.likeInfo}>
            <Text style={styles.likeTitle}>自我激励</Text>
            <Text style={styles.likeSubtitle}>为自己的愿望点赞，给自己正能量！</Text>
            {wish.likes > 0 && (
              <Text style={styles.likeCount}>已获得 {wish.likes} 个赞</Text>
            )}
          </View>
          <TouchableOpacity
            style={[styles.likeButton, wish.isLiked && styles.likeButtonActive]}
            onPress={handleLike}
            disabled={liking}
          >
            {liking ? (
              <ActivityIndicator size="small" color={COLORS.surface} />
            ) : (
              <>
                <Text style={[styles.likeButtonIcon, wish.isLiked && styles.likeButtonIconActive]}>
                  {wish.isLiked ? '❤️' : '🤍'}
                </Text>
                <Text style={[styles.likeButtonText, wish.isLiked && styles.likeButtonTextActive]}>
                  {wish.isLiked ? '已点赞' : '点赞'}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  errorText: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.error,
  },
  headerCard: {
    marginBottom: SPACING.md,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  title: {
    flex: 1,
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginRight: SPACING.sm,
  },
  statusBadge: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
  },
  statusText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.surface,
    fontWeight: '600',
  },
  categoryContainer: {
    alignItems: 'flex-start',
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 16,
  },
  categoryText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  contentCard: {
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  content: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 24,
  },
  actionItem: {
    flexDirection: 'row',
    marginBottom: SPACING.sm,
  },
  actionNumber: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: 'bold',
    marginRight: SPACING.sm,
    minWidth: 20,
  },
  actionText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 12,
    marginRight: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tagText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  timeInfo: {
    gap: SPACING.sm,
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  timeValue: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  infoValue: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.text,
    fontWeight: 'bold',
  },
  likeCard: {
    backgroundColor: COLORS.primary + '10',
    borderWidth: 1,
    borderColor: COLORS.primary + '30',
  },
  likeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  likeInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  likeTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  likeSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  likeCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
  },
  likeButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 24,
    borderWidth: 2,
    borderColor: COLORS.primary,
    alignItems: 'center',
    minWidth: 80,
  },
  likeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  likeButtonIcon: {
    fontSize: 20,
    marginBottom: SPACING.xs / 2,
  },
  likeButtonIconActive: {
    // 已点赞状态的图标样式
  },
  likeButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  likeButtonTextActive: {
    color: COLORS.surface,
  },
});