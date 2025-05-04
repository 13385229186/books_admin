// src/components/RecordsModal/index.tsx
import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, DatePicker, Button, Table, Space, message, Tag } from 'antd';
import { 
  getBorrowListByUser, 
  getViolationListByUser,
  getBorrowDetailById
} from '@/services/user/api';
import { pageListParamFormat } from '@/utils/format';
import { 
  BorrowRecord, 
  ViolationRecord, 
  BorrowStatusText, 
  ViolationTypeMap 
} from '@/pages/user/personalCenter/data.d'
import { formatDateTime } from '@/utils/format';
import styles from './style.less';
import RecordDetailModal from '../RecordDetailModal/RecordDetailModal'

const { RangePicker } = DatePicker;
const { Option } = Select;

interface RecordsModalProps {
  visible: boolean;
  onCancel: () => void;
  recordType: 'borrow' | 'violation';
}

const RecordsModal: React.FC<RecordsModalProps> = ({ 
  visible, 
  onCancel, 
  recordType 
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<(BorrowRecord | ViolationRecord)[]>([]);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0,
  });
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<ViolationRecord | null>(null);
  const [relatedBorrowRecord, setRelatedBorrowRecord] = useState<BorrowRecord | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // 获取记录数据
  const fetchRecords = async (params: any = {}) => {
    try {
      setLoading(true);
      const queryParams = {
        ...params,
        pageSize: pagination.pageSize,
        current: pagination.current,
      };

      const res = recordType === 'borrow' 
        ? await getBorrowListByUser(pageListParamFormat(queryParams))
        : await getViolationListByUser(pageListParamFormat(queryParams));
      
      if (res?.status === 'fail') {
        throw new Error(res.msg || `获取${getTitle()}失败`);
      }

      setData(res?.data?.data || []);
      setPagination({
        ...pagination,
        total: res?.data?.total || 0,
      });
    } catch (error) {
      console.error(`获取${getTitle()}失败:`, error);
      message.error(`获取${getTitle()}失败`);
    } finally {
      setLoading(false);
    }
  };

  // 获取借阅详情
  const fetchBorrowDetail = async (borrowId: string) => {
    try {
      setDetailLoading(true);
      const res = await getBorrowDetailById({ id: borrowId });
      if (res?.status === 'fail') {
        throw new Error(res.msg || '获取借阅详情失败');
      }
      setRelatedBorrowRecord(res.data.data[0]);
    } catch (error) {
      console.error('获取借阅详情失败:', error);
      message.error('获取借阅详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  // 获取模态框标题
  const getTitle = () => {
    return recordType === 'borrow' ? '借阅记录' : '违规记录';
  };

  // 处理表单提交
  const handleSearch = (values: any) => {
    const params: any = {};
    
    if (values.title) {
      params.title = values.title;
    }
    
    if (recordType === 'borrow' && values.status) {
      params.status = values.status;
    }
    
    if (recordType === 'violation' && values.violationType) {
      params.violationType = values.violationType;
    }
    
    if (values.createdAt) {
      params.createdAt = values.createdAt.format('YYYY-MM-DD');
    }

    // 重置到第一页
    setPagination({
      ...pagination,
      current: 1,
    });
    
    fetchRecords(params);
  };

  // 重置表单
  const handleReset = () => {
    form.resetFields();
    fetchRecords();
  };

  // 状态颜色映射
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      APPLIED: 'blue',
      CANCELLED: 'gray',
      EXPIRED: 'orange',
      BORROWED: 'green',
      OVERDUE: 'red',
      RETURNED: 'cyan',
      LOST: 'magenta'
    };
    return colors[status] || 'gray';
  };

  // 获取表格列配置
  const getColumns = () => {
    if (recordType === 'borrow') {
      return [
        {
          title: '书名',
          dataIndex: 'title',
          key: 'title',
          render: (text: string) => <a className={styles.bookTitle}>{text}</a>,
        },
        {
          title: '状态',
          dataIndex: 'status',
          key: 'status',
          render: (status: keyof typeof BorrowStatusText) => (
            <Tag color={getStatusColor(status)}>
              {BorrowStatusText[status]}
            </Tag>
          ),
        },
        {
          title: '申请时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          render: (text: string) => formatDateTime(new Date(text)),
        },
        {
          title: '操作',
          key: 'action',
          render: (_: any, record: BorrowRecord) => (
            <Space size="middle">
              <a onClick={() => {
                setSelectedRecord(record as BorrowRecord);
                setDetailModalVisible(true);
              }}>详情</a>
            </Space>
          ),
        },
      ];
    } else {
      return [
        {
          title: '书名',
          dataIndex: 'title',
          key: 'title',
          render: (text: string) => <a className={styles.bookTitle}>{text}</a>,
        },
        {
          title: '违规类型',
          dataIndex: 'violationType',
          key: 'violationType',
          render: (type: keyof typeof ViolationTypeMap) => {
            if (!type || !ViolationTypeMap[type as keyof typeof ViolationTypeMap]) {
              return <Tag>-</Tag>;
            }
            return (
              <Tag color={getStatusColor(type)}>
                {ViolationTypeMap[type].text}
              </Tag>
            )
          },
        },
        {
          title: '扣除分数',
          dataIndex: 'violationType',
          key: 'score',
          render: (type: keyof typeof ViolationTypeMap) => {
            if (!type || !ViolationTypeMap[type as keyof typeof ViolationTypeMap]) {
              return <Tag>-</Tag>;
            }
            return (
              <span>{ViolationTypeMap[type].score} 分</span>
            )
          },
        },
        {
          title: '违规时间',
          dataIndex: 'createdAt',
          key: 'createdAt',
          render: (text: string) => formatDateTime(new Date(text)),
        },
        {
          title: '操作',
          key: 'action',
          render: (_: any, record: ViolationRecord) => (<Space size="middle">
            <a onClick={() => {
              setSelectedViolation(record as ViolationRecord);
              setDetailModalVisible(true);
            }}>详情</a>
            <a onClick={() => message.info('申诉功能敬请期待')}>申诉</a>
          </Space>)
        },
      ];
    }
  };

  // 获取筛选表单
  const getFilterForm = () => {
    return (
      <Form
        form={form}
        layout="inline"
        onFinish={handleSearch}
        className={styles.searchForm}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          flexWrap: 'wrap'
        }}
      >
        {/* 左侧表单项容器 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px 0' }}>
          {/* 书名搜索 */}
          <Form.Item 
            name="title" 
            label="书名"
            style={{ width: 200, marginRight: 16 }}
          >
            <Input placeholder="输入书名" allowClear />
          </Form.Item>
          
          {/* 状态/违规类型选择 */}
          {recordType === 'borrow' ? (
            <Form.Item 
              name="status" 
              label="状态"
              style={{ width: 180, marginRight: 16 }}
            >
              <Select placeholder="选择状态" allowClear>
                {Object.entries(BorrowStatusText).map(([value, text]) => (
                  <Option key={value} value={value}>{text}</Option>
                ))}
              </Select>
            </Form.Item>
          ) : (
            <Form.Item 
              name="violationType" 
              label="违规类型"
              style={{ width: 180, marginRight: 16 }}
            >
              <Select placeholder="选择类型" allowClear>
                {Object.entries(ViolationTypeMap).map(([value, { text }]) => (
                  <Option key={value} value={text}>{text}</Option>
                ))}
              </Select>
            </Form.Item>
          )}
          
          {/* 日期选择 */}
          <Form.Item 
            name="createdAt" 
            label={recordType === 'borrow' ? '申请时间' : '违规时间'}
            style={{ width: 200 }}
          >
            <DatePicker 
              style={{ width: '100%' }}
              format="YYYY-MM-DD"
              placeholder="选择日期"
              showTime={false}
              allowClear
            />
          </Form.Item>
        </div>

        {/* 右侧操作按钮 */}
        <Form.Item style={{ marginLeft: 'auto' }}>
          <Space>
            <Button 
              type="primary" 
              htmlType="submit"
              style={{ width: 80 }}
            >
              搜索
            </Button>
            <Button 
              onClick={handleReset}
              style={{ width: 80 }}
            >
              重置
            </Button>
          </Space>
        </Form.Item>
      </Form>
    );
  };

  // 初始加载
  useEffect(() => {
    if (visible) {
      fetchRecords();
    }
  }, [visible, pagination.current]);

  // 对 selectedViolation 进行监听
  useEffect(() => {
    if (selectedViolation && selectedViolation.borrowId) {
      fetchBorrowDetail(selectedViolation.borrowId);
    }
  }, [selectedViolation]);

  return (
    <Modal
      title={`全部${getTitle()}`}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      destroyOnClose
    >
      {/* 筛选表单 */}
      {getFilterForm()}

      {/* 记录表格 */}
      <Table
        columns={getColumns()}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          ...pagination,
          showSizeChanger: false,
          onChange: (page) => {
            setPagination({
              ...pagination,
              current: page,
            });
          },
        }}
        className={styles.recordTable}
      />

      <RecordDetailModal
        visible={detailModalVisible}
        onCancel={() => {
          setDetailModalVisible(false);
          setSelectedRecord(null);
          setSelectedViolation(null);
          setRelatedBorrowRecord(null);
        }}
        record={selectedRecord || selectedViolation}
        recordType={recordType}
        relatedBorrowRecord={relatedBorrowRecord}
      />
    </Modal>
  );
};

export default RecordsModal;