import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  RefreshControl, 
  TouchableOpacity,
  Alert,
  ActivityIndicator
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WishEntry, WishCategory, WishStatus } from '../types';
import { COLORS, SPACING, FONT_SIZES } from '../constants';
import { StorageService } from '../services/storageService';
import { WishCard } from '../components';
import { getCategoryDisplayName, getStatusDisplayName } from '../utils/wishUtils';

type SortOption = 'date_desc' | 'date_asc' | 'category' | 'status';
type FilterOption = 'all' | WishCategory | WishStatus;

export default function WishListScreen() {
  const [wishes, setWishes] = useState<WishEntry[]>([]);
  const [filteredWishes, setFilteredWishes] = useState<WishEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');

  // 加载愿望列表
  const loadWishes = async () => {
    try {
      setLoading(true);
      const allWishes = await StorageService.getAllWishes();
      setWishes(allWishes);
    } catch (error) {
      console.error('Error loading wishes:', error);
      Alert.alert('错误', '加载愿望列表失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  // 下拉刷新
  const onRefresh = async () => {
    setRefreshing(true);
    await loadWishes();
    setRefreshing(false);
  };

  // 排序和筛选愿望
  const sortAndFilterWishes = useCallback(() => {
    let result = [...wishes];

    // 筛选
    if (filterBy !== 'all') {
      if (['personal_growth', 'career', 'health', 'relationships', 'learning', 'creativity'].includes(filterBy)) {
        result = result.filter(wish => wish.category === filterBy);
      } else if (['pending', 'achieved', 'partially_achieved', 'not_achieved'].includes(filterBy)) {
        result = result.filter(wish => wish.status === filterBy);
      }
    }

    // 排序
    switch (sortBy) {
      case 'date_desc':
        result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
        break;
      case 'date_asc':
        result.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        break;
      case 'category':
        result.sort((a, b) => a.category.localeCompare(b.category));
        break;
      case 'status':
        result.sort((a, b) => a.status.localeCompare(b.status));
        break;
    }

    setFilteredWishes(result);
  }, [wishes, sortBy, filterBy]);

  // 处理愿望卡片点击
  const handleWishPress = (wish: WishEntry) => {
    Alert.alert(
      wish.title,
      wish.content,
      [
        { text: '关闭', style: 'cancel' },
        { text: '查看详情', onPress: () => {
          // TODO: 导航到愿望详情页面
          console.log('Navigate to wish detail:', wish.id);
        }}
      ]
    );
  };

  // 获取排序选项显示名称
  const getSortDisplayName = (sort: SortOption): string => {
    const sortNames: Record<SortOption, string> = {
      date_desc: '最新创建',
      date_asc: '最早创建',
      category: '按分类',
      status: '按状态',
    };
    return sortNames[sort];
  };

  // 获取筛选选项显示名称
  const getFilterDisplayName = (filter: FilterOption): string => {
    if (filter === 'all') return '全部';
    if (['personal_growth', 'career', 'health', 'relationships', 'learning', 'creativity'].includes(filter)) {
      return getCategoryDisplayName(filter as WishCategory);
    }
    if (['pending', 'achieved', 'partially_achieved', 'not_achieved'].includes(filter)) {
      return getStatusDisplayName(filter as WishStatus);
    }
    return filter;
  };

  // 渲染愿望卡片
  const renderWishCard = ({ item }: { item: WishEntry }) => (
    <WishCard wish={item} onPress={handleWishPress} />
  );

  // 渲染空状态
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>✨</Text>
      <Text style={styles.emptyTitle}>还没有愿望记录</Text>
      <Text style={styles.emptySubtitle}>
        去"记录愿望"页面创建你的第一个愿望吧！
      </Text>
    </View>
  );

  // 渲染筛选和排序控制栏
  const renderControls = () => (
    <View style={styles.controlsContainer}>
      <View style={styles.controlRow}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => {
            // 循环切换排序方式
            const sortOptions: SortOption[] = ['date_desc', 'date_asc', 'category', 'status'];
            const currentIndex = sortOptions.indexOf(sortBy);
            const nextIndex = (currentIndex + 1) % sortOptions.length;
            setSortBy(sortOptions[nextIndex]);
          }}
        >
          <Text style={styles.controlButtonText}>
            排序: {getSortDisplayName(sortBy)}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.controlButton}
          onPress={() => {
            // 循环切换筛选方式
            const filterOptions: FilterOption[] = [
              'all', 'pending', 'achieved', 'partially_achieved', 'not_achieved',
              'personal_growth', 'career', 'health', 'relationships', 'learning', 'creativity'
            ];
            const currentIndex = filterOptions.indexOf(filterBy);
            const nextIndex = (currentIndex + 1) % filterOptions.length;
            setFilterBy(filterOptions[nextIndex]);
          }}
        >
          <Text style={styles.controlButtonText}>
            筛选: {getFilterDisplayName(filterBy)}
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          共 {filteredWishes.length} 个愿望
        </Text>
      </View>
    </View>
  );

  // 页面聚焦时重新加载数据
  useFocusEffect(
    useCallback(() => {
      loadWishes();
    }, [])
  );

  // 当愿望列表、排序或筛选条件变化时重新处理数据
  useEffect(() => {
    sortAndFilterWishes();
  }, [sortAndFilterWishes]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>加载中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderControls()}
      <FlatList
        data={filteredWishes}
        renderItem={renderWishCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  controlsContainer: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  controlButton: {
    backgroundColor: COLORS.primary + '20',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    flex: 0.48,
  },
  controlButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '500',
    textAlign: 'center',
  },
  statsContainer: {
    alignItems: 'center',
  },
  statsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  listContainer: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
});