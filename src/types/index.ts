// 基础类型定义

export interface Dream {
  id: string;
  title: string;
  content: string;
  date: string;
  mood?: string;
  tags?: string[];
}

export interface User {
  id: string;
  name: string;
  preferences?: {
    theme: 'light' | 'dark';
    language: 'zh' | 'en';
  };
}