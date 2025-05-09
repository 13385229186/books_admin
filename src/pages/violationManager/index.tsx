import React, { useRef, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Tag, Space, Button, message } from 'antd';
import { getViolationList } from '@/services/violation/api';
import type { ViolationRecord, ViolationType } from './data.d';
import { violationTypeConfig } from './data.d';
import { formatDateTime, pageListParamFormat } from '@/utils/format';
import type { User } from '@/pages/userManager/data.d';
import UserDetailDrawer from '@/pages/userManager/components/UserDetailDrawer';
import BorrowDetailModal from '@/pages/borrowManager/components/BorrowDetailModal'

const ViolationManagement: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [tableLoading, setTableLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<{id?: string; data?: User} | null>(null);
  const [userDetailVisible, setUserDetailVisible] = useState(false);
  const [currentRecord, setCurrentRecord] = useState<ViolationRecord | null>(null);
  const [borrowDetailVisible, setBorrowDetailVisible] = useState(false);
  
  // 显示用户详情
  const showUserDetail = (userId: string, userData?: User) => {
    setCurrentUser({ id: userId, data: userData });
    setUserDetailVisible(true);
  };

  // 显示借阅详情
  const showDetail = (record: ViolationRecord) => {
    setCurrentRecord(record);
    setBorrowDetailVisible(true);
  };

  // 表格列定义
  const columns: ProColumns<ViolationRecord>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
      hideInSearch: true
    },
    {
      title: '用户',
      dataIndex: 'name',
      key: 'name',
      width: 150,
      render: (_, record) => (
        <Button 
          type="link" 
          onClick={() => showUserDetail(record.userId)}
          style={{ padding: 0, textAlign: 'left' }}
        >
          <div>
            <div>{record.name}</div>
            <div style={{ color: '#888' }}>{record.phone}</div>
          </div>
        </Button>
      )
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      hideInTable: true
    },
    {
      title: '书籍',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
      render: (text) => <span style={{ fontWeight: 500 }}>{text}</span>
    },
    {
      title: '违规类型',
      dataIndex: 'violationType',
      key: 'violationType',
      valueType: 'select',
      fieldProps: {
        options: violationTypeConfig,
      },
      render: (_, record) => {
        const config = violationTypeConfig.find(c => c.value === record.violationType);
        return config ? (
          <Tag 
            color={config.color}
            // icon={<ExclamationCircleOutlined />}
            // style={{ borderRadius: 12, padding: '0 8px' }}
          >
            {config.label}
          </Tag>
        ) : (
          `未知类型: ${record.violationType}`
        );
      },
    },
    {
      title: '关联借阅ID',
      dataIndex: 'borrowId',
      key: 'borrowId',
      hideInSearch: true,
      render: (text, record) => <a onClick={() => showDetail(record)}>#{text}</a>
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      valueType: 'date',
      fieldProps: {
        format: 'YYYY-MM-DD',
      },
      render: (_, record) => record.createdAt ? formatDateTime(new Date(record.createdAt)) : '-'
    },
    // {
    //   title: '操作',
    //   key: 'action',
    //   width: 70,
    //   search: false,
    //   render: (_, record) => (
    //     <Space size="small">
    //       <a>详情</a>
    //     </Space>
    //   ),
    // }
  ];

  const requestListInfo = async (params: any) => {
    params = pageListParamFormat(params);
    setTableLoading(true)
    try{
      const violationRes = await getViolationList(params);
      if (violationRes.status === 'fail') {
        message.error(violationRes.msg);
        return { data: [], success: false };
      }
      return violationRes.data;
    } catch (error) {
      console.error('获取违规列表失败:', error);
      message.error('获取违规列表失败');
      return { data: [], success: false };
    } finally {
      setTableLoading(false);
    }
  }

  return (
    <PageContainer>
      <ProTable<ViolationRecord>
        headerTitle="违规记录列表"
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
          pageSize:5,
          // showSizeChanger: true,
        }}
        toolBarRender={() => [
          // <Button 
          //   key="export" 
          //   type="primary" 
          //   ghost
          // >
          //   导出Excel
          // </Button>,
        ]}
      />

      {/* 用户详情抽屉 */}
      <UserDetailDrawer 
        userId={currentUser?.id}
        userData={currentUser?.data}
        visible={userDetailVisible}
        onClose={() => setUserDetailVisible(false)}
      />

      {/* 借阅详情弹窗 */}
      <BorrowDetailModal
        visible={borrowDetailVisible}
        onCancel={() => setBorrowDetailVisible(false)}
        borrowId={currentRecord?.borrowId}
        // handleStatusChange={handleStatusChange}
      />

    </PageContainer>
  );
};

export default ViolationManagement;