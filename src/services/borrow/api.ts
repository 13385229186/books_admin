import { api, multipartRequest } from '@/utils/api';
import { pageListParamFormat } from '@/utils/format';

// import { UploadBookParams, UpdateBookParams } from './data';

export async function borrowBook(params: {
  bookId: string;
  borrowDays: number;
}) {
  const formData = new FormData();
  formData.append('bookId', params.bookId);
  formData.append('borrowDays', params.borrowDays.toString());
  return api('/api/user/borrowBook', formData);
}

/** 获取借阅记录 */
export async function getBorrowList(params?: Record<string, any>) {
  return api('/api/admin/borrowList', params);
}

/** 修改借阅状态 */
export async function setBorrowStatus(params: {
  id: string,
  status: string
}) {
  return api('/api/admin/setBorrowStatus', params);
}

/** 根据id获取借阅记录 */
export async function getBorrowRecordById(params?: {
  id: string;
}) {
  return api('/api/admin/borrowList', pageListParamFormat(params));
}



