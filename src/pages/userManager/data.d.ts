// 用户角色枚举
export type UserRole = 'ADMIN' | 'USER';

// 用户角色配置
export const userRoleConfig: StatusConfig[] = [
  {
    value: 'ADMIN',
    label: '管理员',
    color: 'red'
  },
  {
    value: 'USER',
    label: '普通用户',
    color: 'blue'
  }
];

// 用户状态枚举
export enum UserStatus {
  ACTIVE = 'ACTIVE',
  DISABLED = 'DISABLED',
  LOCKED = 'LOCKED',
  DELETED = 'DELETED'
}

// 用户状态配置接口
export interface StatusConfig {
  value: string;
  label: string;
  color: string;
}

// 用户状态配置
export const userStatusConfig: StatusConfig[] = [
  {
    value: UserStatus.ACTIVE,
    label: '正常',
    color: 'green'
  },
  {
    value: UserStatus.DISABLED,
    label: '封控',
    color: 'orange'
  },
  {
    value: UserStatus.LOCKED,
    label: '锁定',
    color: 'red'
  },
  {
    value: UserStatus.DELETED,
    label: '注销',
    color: 'gray'
  }
];

// 用户数据接口
export interface User {
  id: string;
  avatar?: string | null;
  username: string;
  status: UserStatus;
  name?: string | null;
  phone?: string | null;
  role: UserRole;
  creditScore: number;
  createdAt: string;
  updatedAt: string;
}

// 用户列表响应数据
export interface UserListResponse {
  code: number;
  msg: string;
  status: string;
  data: {
    data: User[];
    success: boolean;
    total: number;
    pages: number;
    current: number;
  };
}

// 用户搜索参数
export interface UserSearchParams {
  id?: number;
  username?: string;
  name?: string;
  phone?: string;
  role?: UserRole;
  creditScore?: number;
  pageSize?: number;
  current?: number;
}