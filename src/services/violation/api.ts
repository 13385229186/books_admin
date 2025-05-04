import { api, multipartRequest } from '@/utils/api';


/** 获取借阅记录 */
export async function getViolationList(params?: Record<string, any>) {
  return api('/api/admin/violationList', params);
}