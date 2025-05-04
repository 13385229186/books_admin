import { api, multipartRequest } from '@/utils/api';
import { UserStatus } from '@/pages/userManager/data.d'

/** 登录 */ 
export async function login(params?: Record<string, any>) {
  return api('/api/user/login', params);
}

/** 注册 */ 
export async function register(params?: Record<string, any>) {
  return api('/api/user/register', params);
}

/** 获取当前的用户 */
export async function currentUser(data: JSON) {
  return api('/api/user/getCurrentUser', data);
}

/** 获取当前的用户 */
export async function getUserById(params: {
  userId: string
}) {
  const formData = new FormData();
  formData.append('userId', params.userId);
  return api('/api/admin/getUserById', formData);
}

/** 退出登录接口 POST /api/login/outLogin */
export async function outLogin() {
  return api('/api/user/outLogin', null);
}

/** 获取用户相关的借阅记录 */
export async function getBorrowListByUser(params?: Record<string, any>) {
  return api('/api/user/borrowListByUser', params);
}

/** 获取用户相关的违规记录 */
export async function getViolationListByUser(params?: Record<string, any>) {
  return api('/api/user/violationListByUser', params);
}

/** 用户取消预约 */
export async function cancelBorrowBook(params: {
  borrowId: string
}) {
  const formData = new FormData();
  formData.append('borrowId', params.borrowId);
  return api('/api/user/cancelBorrowBook', formData);
}

/** 获取用户相关的借阅记录详情 */
export async function getBorrowDetailById(params: {
  id: string
}) {
  return api('/api/user/borrowListByUser', params);
}

/** 更新用户信息 */ 
export async function updateInfo(params: {
  avatarData?: File,
  updateData?: Record<string, any>
}) {
  return multipartRequest(
    '/api/user/updateInfo',
    {}, // 普通字段
    { avatarData: params.avatarData }, // 文件字段
    { data: params.updateData, fieldName: 'updateData'} // JSON数据
  );
}

/** 获取用户列表 */
export async function getUserList(params?: Record<string, any>) {
  return api('/api/admin/userList', params);
}

/** 添加用户 */
export async function addUser(params?: Record<string, any>) {
  return api('/api/admin/addUser', params);
}

/** 修改用户状态 */
export async function changeUserStatus(params: {
  userId: string,
  status: UserStatus
}) {
  const formData = new FormData();
  formData.append('userId', params.userId);
  formData.append('status', params.status);
  return api('/api/admin/changeStatus', formData);
}
