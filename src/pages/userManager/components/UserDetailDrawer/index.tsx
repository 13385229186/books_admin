import { Drawer, Tag, message, Avatar, Descriptions } from 'antd';
import { getUserById, changeUserStatus } from '@/services/user/api';
import { useEffect, useRef, useState } from 'react';
import { User, userStatusConfig } from '../../data.d';
import { toCosUrl } from '@/utils/format';
import StatusTag from '@/components/StatusTag';

interface UserDetailDrawerProps {
  userId?: string;
  userData?: User;
  visible: boolean;
  onClose: () => void;
}

const UserDetailDrawer = ({ 
  userId, 
  userData: initialUserData, 
  visible, 
  onClose 
}: UserDetailDrawerProps) => {
  const [userData, setUserData] = useState<User | undefined>(initialUserData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      // 如果已有用户数据，直接使用
      if (initialUserData) {
        setUserData(initialUserData);
        return;
      }
      
      // 只有userId时，请求数据
      if (userId) {
        setLoading(true);
        getUserById({ userId: userId })
          .then(res => {
            if (res.status === 'success') {
              setUserData(res.data);
            } else {
              message.error(res.msg || '获取用户信息失败');
            }
          })
          .catch(error => {
            console.error('获取用户信息失败:', error);
            message.error('获取用户信息失败');
          })
          .finally(() => setLoading(false));
      }
    } else {
      // 关闭时重置状态
      setUserData(undefined);
    }
  }, [visible, userId, initialUserData]);

  return (
    <Drawer
      width={600}
      open={visible}
      onClose={onClose}
      title="用户详情"
      loading={loading}
      destroyOnClose
    >
      {userData ? (
        <Descriptions column={1} bordered>
          <Descriptions.Item label="头像">
            <Avatar src={userData.avatar ? toCosUrl(userData.avatar) : ''} size={64}>
              {userData.name?.charAt(0) || userData.username?.charAt(0)}
            </Avatar>
          </Descriptions.Item>
          <Descriptions.Item label="用户名">{userData.username || '-'}</Descriptions.Item>
          <Descriptions.Item label="姓名">{userData.name || '-'}</Descriptions.Item>
          <Descriptions.Item label="电话">{userData.phone || '-'}</Descriptions.Item>
          <Descriptions.Item label="角色">
            {userData.role ? (
              <Tag color="blue">{userData.role}</Tag>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="状态">
            {userData.status && userStatusConfig.find(c => c.value === userData.status) ? (
              <StatusTag
              status={userData.status}
              configs={userStatusConfig}
              onChange={async (newStatus: any) => {
                await changeUserStatus({ 
                  userId: userData.id, 
                  status: newStatus 
                }).then((res) => {
                  if(res.status === 'fail'){
                    throw Error('用户状态修改失败')
                  }
                });
                onClose();
              }}
            />
              // <Tag color={userStatusConfig.find(c => c.value === userData.status)?.color}>{userStatusConfig.find(c => c.value === userData.status)?.label}</Tag>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="信用分">
            {userData.creditScore !== undefined ? (
              <Tag color={
                userData.creditScore >= 80 ? 'green' : 
                userData.creditScore >= 50 ? 'orange' : 'red'
              }>
                {userData.creditScore}
              </Tag>
            ) : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="注册时间">
            {userData.createdAt ? new Date(userData.createdAt).toLocaleString() : '-'}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {userData.updatedAt ? new Date(userData.updatedAt).toLocaleString() : '-'}
          </Descriptions.Item>
        </Descriptions>
      ) : (
        <div>暂无用户数据</div>
      )}
    </Drawer>
  );
};

export default UserDetailDrawer;