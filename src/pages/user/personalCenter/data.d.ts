export interface User {
  id: string;
  avatar?: string | null;
  name?: string;
  phone?: string;
  username: string;
  creditScore: number;
  status: string;
  createdAt: string;
  favoritesCount?: number;
  reviewsCount?: number;
  currentBorrows?: BorrowRecord[];
  violations?: ViolationRecord[];
}

export interface BorrowRecord {
  id: string;
  title: string;
  status: keyof typeof BorrowStatusText;
  createdAt: string;
  dueTime?: string | null;
  returnTime?: string | null;
  borrowTime?: string | null;
}

// 违规类型枚举
export enum ViolationType {
  OVERDUE = 'OVERDUE',  // 逾期未还
  LOST = 'LOST',        // 书籍丢失
  EXPIRED = 'EXPIRED'   // 申请过期
}

// 违规记录类型
export interface ViolationRecord {
  id: string;                   // 违规记录ID
  userId: string;               // 关联用户ID
  borrowId: string;              // 关联借阅记录ID
  bookId: string;               // 关联书籍ID
  title: string;                // 书籍标题
  violationType: ViolationType; // 违规类型
  createdAt: string;           // 创建时间（ISO格式字符串）
  phone: string;               // 用户手机号
  name: string;                // 用户姓名
}

export interface PageParams {
  current?: number;
  pageSize?: number;
}

// 状态显示文本
export const BorrowStatusText = {
  APPLIED: '已申请',
  CANCELLED: '已取消',
  EXPIRED: '已过期',
  BORROWED: '借阅中',
  OVERDUE: '已逾期',
  RETURNED: '已归还',
  LOST: '已丢失'
} as const;

export const ViolationTypeMap = {
  OVERDUE: { text: '逾期未还', score: 20 },
  LOST: { text: '书籍丢失', score: 40 },
  EXPIRED: { text: '申请过期', score: 10 }
};
