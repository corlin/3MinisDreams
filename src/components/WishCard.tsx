import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { WishEntry } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { formatDate, getDaysUntilTarget, getCategoryDisplayName, getStatusDisplayName } from '../utils/wishUtils';
import Card from './Card';

interface WishCardProps {
  wish: WishEntry;
  onPress?: (wish: WishEntry) => void;
}

export default function WishCard({ wish, onPress }: WishCardProps) {
  const daysUntilTarget = getDaysUntilTarget(wish);
  const isOverdue = daysUntilTarget < 0;
  const isToday = daysUntilTarget === 0;

  const getStatusColor = () => {
    switch (wish.status) {
      case 'achieved':
        return COLORS.success;
      case 'partially_achieved':
        return '#f59e0b'; // amber
      case 'not_achieved':
        return COLORS.error;
      default:
        return COLORS.textSecondary;
    }
  };

  const getTargetDateColor = () => {
    if (isOverdue) return COLORS.error;
    if (isToday) return '#f59e0b'; // amber
    if (daysUntilTarget <= 2) return '#f97316'; // orange
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
    <TouchableOpacity onPress={() => onPress?.(wish)} activeOpacity={0.7}>
      <Card style={styles.card}>
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            <Text style={styles.title} numberOfLines={2}>
              {wish.title}
            </Text>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {getCategoryDisplayName(wish.category)}
              </Text>
            </View>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
            <Text style={styles.statusText}>
              {getStatusDisplayName(wish.status)}
            </Text>
          </View>
        </View>

        <Text style={styles.content} numberOfLines={3}>
          {wish.content}
        </Text>

        <View style={styles.footer}>
          <View style={styles.dateInfo}>
            <Text style={styles.dateLabel}>创建于</Text>
            <Text style={styles.dateText}>
              {formatDate(wish.createdAt)}
            </Text>
          </View>
          <View style={styles.targetInfo}>
            <Text style={[styles.targetText, { color: getTargetDateColor() }]}>
              {formatTargetDateText()}
            </Text>
          </View>
        </View>

        {wish.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            {wish.tags.slice(0, 3).map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </View>
            ))}
            {wish.tags.length > 3 && (
              <Text style={styles.moreTagsText}>+{wish.tags.length - 3}</Text>
            )}
          </View>
        )}

        {wish.likes > 0 && (
          <View style={styles.likesContainer}>
            <Text style={styles.likesText}>❤️ {wish.likes}</Text>
          </View>
        )}
      </Card>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: SPACING.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  titleContainer: {
    flex: 1,
    marginRight: SPACING.sm,
  },
  title: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  categoryText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '500',
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 12,
  },
  statusText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.surface,
    fontWeight: '500',
  },
  content: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: 22,
    marginBottom: SPACING.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  dateInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginRight: SPACING.xs,
  },
  dateText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.text,
    fontWeight: '500',
  },
  targetInfo: {
    alignItems: 'flex-end',
  },
  targetText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '500',
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  tag: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: 8,
    marginRight: SPACING.xs,
  },
  tagText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  moreTagsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  likesContainer: {
    alignSelf: 'flex-end',
  },
  likesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
});