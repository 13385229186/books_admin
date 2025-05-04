import { api, multipartRequest } from '@/utils/api';

/** 获取书籍看板数据 */ 
export async function getBookOverview() {
  return api('/api/admin/getBookOverview', {});
}

/** 近7天注册用户统计 */ 
export async function getRecentRegistrations() {
  return api('/api/admin/getRecentRegistrations', {});
}

/** 用户信用分布（三个区间） */ 
export async function getCreditDistribution() {
  return api('/api/admin/getCreditDistribution', {});
}

/** 分类借阅量统计 */ 
export async function getBorrowCountByCategory() {
  return api('/api/admin/getBorrowCountByCategory', {});
}