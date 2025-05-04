type BadgeStatusType = "success" | "error" | "default" | "warning" | "processing";
type BookStatusType = 'AVAILABLE' | 'BORROWED' | 'MAINTENANCE'; 

interface BookStatusConfig {
  label: string;
  value: string;
  badgeStatus: BadgeStatusType;
}

export interface categoryListConfig {
  label: string;
  value: string;
}

export const bookStatus: BookStatusConfig[] = [
  {
    value: 'AVAILABLE',
    label: '可借阅',
    badgeStatus: 'success',
  },
  {
    value: 'BORROWED',
    label: '已借完',
    badgeStatus: 'error',
  },
  {
    value: 'MAINTENANCE',
    label: '暂停借阅',
    badgeStatus: 'default',
  }
]

export interface BookDataConfig {
  id: string;
  title: string;
  author: string;
  categoryId: string;
  cover: string | null;      // 封面URL（若无则为null）
  createdAt: string;        // ISO 8601格式日期时间
  ebook: string | null;      // 电子书文件URL（若无则为null）
  intro: string;
  isbn: string;             // ISBN编号（带分隔符格式）
  press: string;            // 出版社名称
  status: BookStatusType;       // 书籍状态
  updatedAt: string;        // ISO 8601格式日期时间
  bookNumber?: number;
}

export interface FileState {
  current: UploadFile[];     // 当前显示的文件
  original?: UploadFile[];   // 原始文件（用于比较是否修改）
}