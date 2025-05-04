// 违规类型枚举
export enum ViolationType {
  LOST = 'LOST',       // 书籍丢失
  OVERDUE = 'OVERDUE', // 逾期未还
  EXPIRED = 'EXPIRED'  // 预约过期
}

// 违规类型配置
export const violationTypeConfig = [
  {
    value: ViolationType.LOST,
    label: '书籍丢失',
    color: 'red'
  },
  {
    value: ViolationType.OVERDUE,
    label: '逾期未还',
    color: 'orange'
  },
  {
    value: ViolationType.EXPIRED,
    label: '预约过期',
    color: 'blue'
  }
];

// 违规记录接口
export interface ViolationRecord {
  id: string;
  userId: string;
  bookId: string;
  borrowId: string;
  name: string;
  phone: string;
  title: string;
  violationType: ViolationType;
  createdAt: string;
}

// 违规搜索参数
export interface ViolationSearchParams {
  name?: string;
  phone?: string;
  title?: string;
  violationType?: ViolationType;
  pageSize?: number;
  current?: number;
}