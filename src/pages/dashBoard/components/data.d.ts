/** 书籍概览数据 */
export interface BookOverviewType {
  ebookStats: {
    percentage: number;
    count: number;
  };
  physicalStats: {
    percentage: number;
    count: number;
  };
  total: number;
  overdue: number;
  todayBorrows: number;
}

/** 注册趋势数据项 */
export interface RegistrationItem {
  date: string;
  count: number;
}

/** 信用分布数据 */
export interface CreditDistributionItem {
  [key: string]: number; // 优秀/良好/待提升
}

export interface CreditDistributionType {
  优秀?: number;
  良好?: number;
  待提升?: number;
}

/** 分类借阅数据项 */
export interface CategoryBorrowItem {
  name: string;
  borrow_count: number;
}