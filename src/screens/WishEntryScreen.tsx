import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { WishCategory, Priority } from '../types';
import { StorageService } from '../services/storageService';
import { createWishEntry, validateWishEntry, getCategoryDisplayName, generateUserId } from '../utils/wishUtils';
import Button from '../components/Button';
import Card from '../components/Card';
import Timer from '../components/Timer';
import { COLORS, SPACING, FONT_SIZES } from '../constants';

const WISH_CATEGORIES: WishCategory[] = [
  'personal_growth',
  'career', 
  'health',
  'relationships',
  'learning',
  'creativity'
];

const PRIORITIES: Priority[] = ['low', 'medium', 'high'];

export default function WishEntryScreen() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<WishCategory>('personal_growth');
  const [priority, setPriority] = useState<Priority>('medium');
  const [motivationLevel, setMotivationLevel] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [showTimer, setShowTimer] = useState(true);

  const handleSaveWish = async () => {
    // 表单验证
    const wishData = { title, content, motivationLevel };
    const errors = validateWishEntry(wishData);
    
    if (errors.length > 0) {
      Alert.alert('输入错误', errors.join('\n'));
      return;
    }

    setIsLoading(true);
    
    try {
      // 创建愿望条目
      const userId = generateUserId(); // 临时用户ID，后续会被认证系统替换
      const newWish = createWishEntry(
        title,
        content,
        category,
        priority,
        userId,
        motivationLevel,
        [], // tags
        [], // specificActions
        '', // successCriteria
        focusTime
      );

      // 保存到本地存储
      await StorageService.saveWishEntry(newWish);

      // 显示成功提示
      const focusTimeText = focusTime > 0 ? `\n\n专注时间：${Math.floor(focusTime / 60)}分${focusTime % 60}秒` : '';
      Alert.alert(
        '愿望已记录 ✨',
        `你的愿望"${title}"已成功记录！${focusTimeText}\n\n一周后（${newWish.targetDate.toLocaleDateString()}）记得回来查看实现情况哦！`,
        [
          {
            text: '继续记录',
            onPress: () => {
              // 清空表单
              setTitle('');
              setContent('');
              setCategory('personal_growth');
              setPriority('medium');
              setMotivationLevel(5);
              setFocusTime(0);
              setShowTimer(true);
            }
          }
        ]
      );
    } catch (error) {
      console.error('保存愿望失败:', error);
      Alert.alert('保存失败', '愿望保存失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  const renderCategorySelector = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>愿望分类</Text>
      <View style={styles.categoryGrid}>
        {WISH_CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              category === cat && styles.categoryButtonActive
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[
              styles.categoryButtonText,
              category === cat && styles.categoryButtonTextActive
            ]}>
              {getCategoryDisplayName(cat)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </Card>
  );

  const renderMotivationSlider = () => (
    <Card style={styles.sectionCard}>
      <Text style={styles.sectionTitle}>动机强度 ({motivationLevel}/10)</Text>
      <View style={styles.motivationContainer}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
          <TouchableOpacity
            key={level}
            style={[
              styles.motivationButton,
              motivationLevel >= level && styles.motivationButtonActive
            ]}
            onPress={() => setMotivationLevel(level)}
          >
            <Text style={[
              styles.motivationButtonText,
              motivationLevel >= level && styles.motivationButtonTextActive
            ]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      <Text style={styles.motivationHint}>
        {motivationLevel <= 3 && '轻松目标，慢慢来'}
        {motivationLevel > 3 && motivationLevel <= 7 && '适中目标，稳步前进'}
        {motivationLevel > 7 && '挑战目标，全力以赴！'}
      </Text>
    </Card>
  );

  const handleTimerComplete = (completedFocusTime: number) => {
    setFocusTime(completedFocusTime);
    setShowTimer(false);
  };

  const handleTimerUpdate = (remainingTime: number, currentFocusTime: number) => {
    setFocusTime(currentFocusTime);
  };

  const renderTimer = () => {
    if (!showTimer && focusTime > 0) {
      return (
        <Card style={styles.sectionCard}>
          <View style={styles.timerCompletedContainer}>
            <Text style={styles.timerCompletedTitle}>✅ 专注时间已完成</Text>
            <Text style={styles.timerCompletedText}>
              专注时长：{Math.floor(focusTime / 60)}分{focusTime % 60}秒
            </Text>
            <TouchableOpacity 
              style={styles.restartTimerButton}
              onPress={() => {
                setShowTimer(true);
                setFocusTime(0);
              }}
            >
              <Text style={styles.restartTimerButtonText}>重新开始计时</Text>
            </TouchableOpacity>
          </View>
        </Card>
      );
    }

    if (showTimer) {
      return (
        <Card style={styles.sectionCard}>
          <Timer
            duration={180} // 3分钟
            onComplete={handleTimerComplete}
            onTimeUpdate={handleTimerUpdate}
          />
        </Card>
      );
    }

    return null;
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>记录你的愿望</Text>
        <Text style={styles.headerSubtitle}>
          花3分钟时间，写下一周后想要实现的小目标
        </Text>
      </View>

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>愿望标题</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="简短描述你的愿望..."
          value={title}
          onChangeText={setTitle}
          maxLength={100}
          multiline={false}
        />
        <Text style={styles.charCount}>{title.length}/100</Text>
      </Card>

      <Card style={styles.formCard}>
        <Text style={styles.sectionTitle}>详细描述</Text>
        <TextInput
          style={styles.contentInput}
          placeholder="详细描述你想要实现的目标，越具体越好..."
          value={content}
          onChangeText={setContent}
          maxLength={1000}
          multiline={true}
          numberOfLines={4}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{content.length}/1000</Text>
      </Card>

      {renderCategorySelector()}
      {renderMotivationSlider()}
      {renderTimer()}

      <View style={styles.actionContainer}>
        <Button
          title={isLoading ? "保存中..." : "保存愿望 ✨"}
          onPress={handleSaveWish}
          disabled={isLoading || !title.trim() || !content.trim()}
          style={styles.saveButton}
        />
      </View>

      <View style={styles.encouragementContainer}>
        <Text style={styles.encouragementText}>
          💡 小贴士：具体的目标更容易实现哦！
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  formCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionCard: {
    margin: SPACING.md,
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    minHeight: 100,
  },
  charCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.sm,
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    minWidth: 80,
    alignItems: 'center',
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  categoryButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  motivationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  motivationButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  motivationButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  motivationButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
  },
  motivationButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  motivationHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  actionContainer: {
    padding: SPACING.lg,
  },
  saveButton: {
    paddingVertical: SPACING.lg,
  },
  encouragementContainer: {
    padding: SPACING.lg,
    paddingTop: 0,
    alignItems: 'center',
  },
  encouragementText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  timerCompletedContainer: {
    alignItems: 'center',
    padding: SPACING.md,
  },
  timerCompletedTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  timerCompletedText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  restartTimerButton: {
    backgroundColor: COLORS.textSecondary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
  },
  restartTimerButtonText: {
    color: '#ffffff',
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
});