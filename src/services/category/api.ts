import { api, multipartRequest } from '@/utils/api';

/** 获取书籍列表，支持分页、条件筛选 */ 
export async function getCategoryList() {
  return api('/api/user/categoryList', {});
}

