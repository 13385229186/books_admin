import { PageContainer, ProTable, ProDescriptions, type ActionType } from '@ant-design/pro-components';
import { Tag, message, Form, Popconfirm, Button, Drawer } from 'antd';
import { getBorrowList, setBorrowStatus } from '@/services/borrow/api';
import { useState, useRef } from 'react';
import { QuestionCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { formatDateTime, pageListParamFormat } from '@/utils/format';
import UserDetailDrawer from '@/pages/userManager/components/UserDetailDrawer';
import type { User } from '@/pages/userManager/data.d';
import { borrowStatus, BorrowRecord } from './data.d';
import type { ProColumns } from '@ant-design/pro-components';
import BorrowDetailModal from './components/BorrowDetailModal'

const BorrowManagement: React.FC = () => {
  const [form] = Form.useForm();
  const actionRef = useRef<ActionType>();
  const [currentRecord, setCurrentRecord] = useState<BorrowRecord | null>(null);
  const [currentUser, setCurrentUser] = useState<{id?: string; data?: User} | null>(null);
  const [userDetailVisible, setUserDetailVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);

  // 显示用户详情
  const showUserDetail = (userId: string, userData?: User) => {
    setCurrentUser({ id: userId, data: userData });
    setUserDetailVisible(true);
  };

  // 显示借阅详情
  const showDetail = (record: BorrowRecord) => {
    setCurrentRecord(record);
    setDetailVisible(true);
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      setLoading(true);
      const res = await setBorrowStatus({ id, status });
      
      if (res.status === 'success') {
        message.success('状态更新成功');
        actionRef.current?.reload();
      } else {
        message.error(res.msg || '操作失败');
      }
    } catch (error) {
      console.error('操作失败:', error);
      message.error('操作失败');
    } finally {
      setLoading(false);
    }
  };

  const columns: ProColumns<BorrowRecord>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: '用户',
      dataIndex: 'name',
      width: 150,
      render: (_: any, record: BorrowRecord) => (
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
      title: '书名',
      dataIndex: 'title',
      ellipsis: true
    },
    {
      title: '借阅时间',
      dataIndex: 'borrowTime',
      valueType: 'date',
      hideInSearch: false,
      fieldProps: {
        format: 'YYYY-MM-DD',
      },
      render: (_, record) => record.borrowTime ? formatDateTime(new Date(record.borrowTime)) : '-'
    },
    {
      title: '应还时间',
      dataIndex: 'dueTime',
      valueType: 'date',
      hideInSearch: false,
      fieldProps: {
        format: 'YYYY-MM-DD',
      },
      render: (_, record) => record.dueTime ? formatDateTime(new Date(record.dueTime)) : '-'
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: borrowStatus,
      },
      render: (_: any, record: BorrowRecord) => {
        const config = borrowStatus.find(c => c.value === record.status);
        return config ? (
          <Tag color={config.color}>
            {config.label || record.status}
          </Tag>
        )  : (
          `未知状态: ${record.status}`
        );       
      }
    },
    {
      title: '操作',
      valueType: 'option',
      width: 70,
      render: (_: any, record: BorrowRecord) => (
        <a 
          type="link" 
          key="detail" 
          onClick={() => showDetail(record)}
        >
          详情
        </a>
      )
    }
  ];

  const requestListInfo = async (params: any) => {
    params = pageListParamFormat(params);
    setTableLoading(true);
    try {
      const borrowRes = await getBorrowList(params);
      if (borrowRes.status === 'fail') {
        message.error(borrowRes.msg);
        return { data: [], success: false };
      }
      
      return {
        data: borrowRes.data.data.map((item: any): BorrowRecord => ({
          id: item.id,
          name: item.name,
          phone: item.phone,
          title: item.title,
          status: item.status,
          borrowTime: item.borrowTime,
          dueTime: item.dueTime,
          userId: item.userId,
          bookId: item.bookId,
          borrowDays: item.borrowDays,
          createdAt: item.createdAt,
          returnTime: item.returnTime,
        })),
        total: borrowRes.data.total,
        success: true
      };
    } catch (error) {
      console.error('获取借阅列表失败:', error);
      message.error('获取借阅列表失败');
      return { data: [], success: false };
    } finally {
      setTableLoading(false);
    }
  };

  return (
    <PageContainer>
      <ProTable<BorrowRecord>
        headerTitle='借阅列表'
        actionRef={actionRef}
        columns={columns}
        loading={tableLoading}
        request={requestListInfo}
        rowKey="id"
        search={{
          labelWidth: 'auto',
          defaultCollapsed: false,
        }}
        pagination={{
          pageSize: 5
        }}
        dateFormatter="string"
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
        visible={detailVisible}
        onCancel={() => setDetailVisible(false)}
        record={currentRecord}
        handleStatusChange={handleStatusChange}
      />
    </PageContainer>
  );
};

export default BorrowManagement;