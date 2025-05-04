import { api, multipartRequest } from '@/utils/api';
import { UploadBookParams, UpdateBookParams } from './data';

/** 获取书籍列表，支持分页、条件筛选 */ 
export async function getBookList(params?: Record<string, any>) {
  return api('/api/user/bookList', params);
}

/** 上传书籍 */ 
export async function bookUpload(params: UploadBookParams) {
  return multipartRequest(
    '/api/admin/bookUpload',
    {}, // 普通字段
    { file: params.file, cover: params.cover }, // 文件字段
    { data: params.bookData, fieldName: 'bookData' } // JSON数据
  );
}

/** 根据id修改书籍信息 */
export async function updateBook(params: UpdateBookParams) {
  return multipartRequest(
    '/api/admin/updateBook',
    { bookId: params.bookId }, // 普通字段
    { file: params.file, cover: params.cover }, // 文件字段
    { data: params.bookData, fieldName: 'bookData' } // JSON数据
  );
}

/** 根据id删除书籍 */
export async function deleteBook(params: Record<string, any>) {
  const formData = new FormData();
  formData.append('bookId', params.bookId);
  return api('/api/admin/deleteBook', formData);
}

/** 根据书籍id获取书籍详细信息 */
export async function getBookById(params: Record<string, any>) {
  const formData = new FormData();
  formData.append('bookId', params.bookId);
  return api('/api/user/getBookById', formData);
}

/** 根据id获取实体书籍数量 */
export async function getBookNumberById(params: Record<string, any>) {
  const formData = new FormData();
  formData.append('bookId', params.bookId);
  return api('/api/user/getBookNumberById', formData);
}

/** 根据id修改实体书籍数量 */
export async function setBookNumber(params: Record<string, any>) {
  const formData = new FormData();
  formData.append('bookId', params.bookId);
  formData.append('bookNumber', params.bookNumber);
  return api('/api/admin/setBookNumber', params);
}

/** 根据书籍id获取书籍详细信息 */
export async function addCategory(params: {
  CategoryName: string
}) {
  const formData = new FormData();
  formData.append('CategoryName', params.CategoryName);
  return api('/api/admin/addCategory', formData);
}