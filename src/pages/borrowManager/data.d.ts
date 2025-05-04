type BorrowStatusColorType = 'orange'|'blue'|'green'|'red'|'gray'

interface BorrowStatusConfig {
  label: string;
  value: string;
  color: BorrowStatusColorType;
}

export const borrowStatus: BorrowStatusConfig[] = [
  {
    value: 'APPLIED',
    label: '已申请',
    color: 'blue',
  },
  {
    value: 'BORROWED',
    label: '借阅中',
    color: 'green',
  },
  {
    value: 'RETURNED',
    label: '已归还',
    color: 'cyan',
  },
  {
    value: 'OVERDUE',
    label: '已逾期',
    color: 'red',
  },
  {
    value: 'LOST',
    label: '已丢失',
    color: 'magenta',
  },
  {
    value: 'CANCELLED',
    label: '已取消',
    color: 'gray',
  },
  {
    value: 'EXPIRED',
    label: '已过期',
    color: 'orange',
  }
]

export interface BorrowRecord {
  id: string;
  userId: string;
  name: string;
  phone: string;
  title: string;
  status: string;
  borrowTime?: string;
  dueTime?: string;
  bookId: string;
  borrowDays?: number;
  createdAt: string;
  returnTime?: string;
}