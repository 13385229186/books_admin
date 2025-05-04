import { api, multipartRequest } from '@/utils/api';
import { BehaviorType } from './data.d'

/** 获取推荐书籍列表 */
export async function getRecommendBooks(params?: Record<string, any>) {
  return api('/api/user/recommendations', params);
}

/** 获取热门书籍列表 */
export async function getHotBooks(params?: Record<string, any>) {
  return api('/api/user/hotBookList', params);
}

/** 记录用户行为 */
async function recordBehavior(params?: Record<string, any>) {
  return api('/api/user/recordBehavior', params);
}

/** 记录查看书籍详情 */
export async function recordVIEW(bookId: string) {
  const params = {
    bookId,
    behaviorType: BehaviorType.VIEW
  }
  return recordBehavior(params);
}

/** 记录在线阅读 */
export async function recordREADONLINE(bookId: string) {
  const params = {
    bookId,
    behaviorType: BehaviorType.READ_ONLINE
  }
  return recordBehavior(params);
}

/** 记录下载电子书 */
export async function recordDOWNLOAD(bookId: string) {
  const params = {
    bookId,
    behaviorType: BehaviorType.DOWNLOAD
  }
  return recordBehavior(params);
}

/** 记录借阅实体书 */
export async function recordBORROW(bookId: string) {
  const params = {
    bookId,
    behaviorType: BehaviorType.BORROW
  }
  return recordBehavior(params);
}