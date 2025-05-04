import React, { useRef, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Tag, Space, Button, Table, message } from 'antd';
import { getUserList, changeUserStatus } from '@/services/user/api';
import type { User, UserRole, UserSearchParams, } from './data.d';
import { userRoleConfig, userStatusConfig }from './data.d';
import { UserAddOutlined } from '@ant-design/icons';
import UserDetailDrawer from './components/UserDetailDrawer'
import CreateUserModal from './components/CreateUserModal';
import { pageListParamFormat, toCosUrl, getFileNameFromUrl } from '@/utils/format';
import StatusTag from '@/components/StatusTag';

const UserManagement: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [userDetailVisible, setUserDetailVisible] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id?: string; data?: User} | null>(null);
  const [tableLoading, setTableLoading] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);

  // 显示用户详情
  const showUserDetail = (userId: string, userData?: User) => {
    setCurrentUser({ id: userId, data: userData });
    setUserDetailVisible(true);
  };

  // 用户创建成功后刷新表格
  const handleCreateSuccess = () => {
    actionRef.current?.reload();
  };

  // 用户角色映射
  const roleMap: Record<UserRole, { text: string; color: string }> = {
    ADMIN: { text: '管理员', color: 'red' },
    USER: { text: '普通用户', color: 'blue' },
  };

  // 表格列定义
  const columns: ProColumns<User>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      ellipsis: true,
      render: (_, record) => (
        <a 
          onClick={() => showUserDetail(record.id, record)}
        >
          {record.username}
        </a>
      )
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text || '-',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        userRoleConfig.map(item => [item.value, { text: item.label }])
      ),
      render: (_, record) => {
        const config = userRoleConfig.find(c => c.value === record.role);
        return config ? (
          <Tag color={config.color}>{config.label}</Tag>
        ) : (
          `未知角色: ${record.role}`
        );
      },
    },
    {
      title: '信誉分',
      dataIndex: 'creditScore',
      key: 'creditScore',
      render: (text) => (
        <Tag color={
          Number(text) >= 80 ? 'green' : 
          Number(text) >= 50 ? 'orange' : 'red'
        }>
          {Number(text)}
        </Tag>
      ),
    },
    {
      title: '状态操作',
      dataIndex: 'status',
      key: 'status',
      valueType: 'select',
      valueEnum: Object.fromEntries(
        userStatusConfig.map(item => [item.value, { text: item.label }])
      ),
      render: (_, record) => (
        <StatusTag
          status={record.status}
          configs={userStatusConfig}
          onChange={async (newStatus: any) => {
            await changeUserStatus({ 
              userId: record.id, 
              status: newStatus 
            }).then((res) => {
              if(res.status === 'fail'){
                throw Error('用户状态修改失败')
              }
            });
            actionRef.current?.reload();
          }}
        />
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'dateTime',
      hideInTable: true,
      hideInSearch: true,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      valueType: 'dateTime',
      hideInTable: true,
      hideInSearch: true,
    },
    
  ];

  const requestListInfo = async (params:UserSearchParams)=>{
    params = pageListParamFormat(params)
    setTableLoading(true)
    const userListRes = await getUserList(params);
    if(userListRes.status === 'fail'){
      setTableLoading(false)  
      message.error(userListRes.msg)
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
    setTableLoading(false)
    return userListRes.data;
  }

  return (
    <PageContainer>
      <ProTable<User>
        headerTitle='用户列表'
        loading={tableLoading}
        actionRef={actionRef}
        columns={columns}
        request={requestListInfo}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        pagination={{
          pageSize: 5,
          // showSizeChanger: true,
        }}
        toolBarRender={() => [
          <Button 
            key="add" 
            type="primary" 
            icon={<UserAddOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建用户
          </Button>,
        ]}
      />

      {/* 用户详情抽屉 */}
      <UserDetailDrawer 
        userId={currentUser?.id}
        userData={currentUser?.data}
        visible={userDetailVisible}
        onClose={() => setUserDetailVisible(false)}
      />

      {/* 新建用户弹窗 */}
      <CreateUserModal
        visible={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onSuccess={handleCreateSuccess}
      />
    </PageContainer>

    
  );
};

export default UserManagement;