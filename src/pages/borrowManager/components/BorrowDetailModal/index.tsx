import React, { useEffect, useState } from 'react';
import { Modal, Tag, Divider, Row, Col, Button, message, Descriptions, Badge, Space, Alert, Spin } from 'antd';
import { formatDateTime } from '@/utils/format';
import { BorrowRecord, borrowStatus } from '../../data.d';
import styles from './style.less';
import { User } from '@/pages/userManager/data.d';
import { getUserById } from '@/services/user/api';
import { getBookById, getBookNumberById } from '@/services/book/api';
import { getBorrowRecordById } from '@/services/borrow/api';
import { BookDataConfig } from '@/pages/bookManager/data.d'
import { bookStatus } from '@/pages/bookManager/data.d'
import {
  HistoryOutlined,
  CheckOutlined,
  BookOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  SettingOutlined,
  NotificationOutlined,
  UserOutlined,
} from '@ant-design/icons';

interface BorrowDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  // 两种数据传入方式：要么传完整的record，要么传borrowId
  record?: BorrowRecord | null;
  borrowId?: string;
  handleStatusChange?: (recordId: string, status: string) => Promise<void>;
  loading?: boolean;
  // 是否显示操作按钮
  showActions?: boolean;
}

const BorrowDetailModal: React.FC<BorrowDetailModalProps> = ({
  visible,
  onCancel,
  record: propRecord,
  borrowId,
  handleStatusChange,
  loading = false,
  showActions = true,
}) => {
  const [record, setRecord] = useState<BorrowRecord | null>(null);
  const [userData, setUserData] = useState<User>();
  const [bookData, setBookData] = useState<BookDataConfig>();
  const [modalLoading, setModalLoading] = useState(false);

  // 获取借阅记录详情
  const fetchBorrowRecord = async (id: string) => {
    try {
      const res = await getBorrowRecordById({ id });
      if (res.status === 'success') {
        return res.data.data[0];
      }
      message.error(res.msg || '获取借阅记录失败');
      return null;
    } catch (error) {
      console.error('获取借阅记录失败:', error);
      message.error('获取借阅记录失败');
      return null;
    }
  };

  // 获取相关数据
  const fetchRelatedData = async (record: BorrowRecord) => {
    try {
      setModalLoading(true);
      
      // 获取用户信息
      if (record.userId) {
        const userRes = await getUserById({ userId: record.userId });
        if (userRes.status === 'success') {
          setUserData(userRes.data);
        } else {
          message.error(userRes.msg || '获取用户信息失败');
        }
      }

      // 获取书籍信息
      if (record.bookId) {
        const bookRes = await getBookById({ bookId: record.bookId });
        if (bookRes.status === 'success') {
          // 获取书籍库存
          const numberRes = await getBookNumberById({ bookId: record.bookId });
          if (numberRes.status === 'success') {
            // 合并书籍信息和库存数据
            setBookData({
              ...bookRes.data,
              bookNumber: numberRes.data
            });
          } else {
            message.error(numberRes.msg || '获取书籍库存失败');
          }
        } else {
          message.error(bookRes.msg || '获取书籍信息失败');
        }
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      message.error('获取数据失败');
    } finally {
      setModalLoading(false);
    }
  };

  // 初始化数据
  useEffect(() => {
    const initData = async () => {
      if (visible) {
        let currentRecord = propRecord;
        
        // 如果传的是borrowId，需要先获取记录
        if (!currentRecord && borrowId) {
          currentRecord = await fetchBorrowRecord(borrowId);
        }
        
        if (currentRecord) {
          setRecord(currentRecord);
          fetchRelatedData(currentRecord);
        } else {
          setRecord(null);
        }
      }
    };

    initData();
  }, [visible, propRecord, borrowId]);

  // 获取借阅状态信息
  const getBorrowStatusInfo = (item: BorrowRecord) => {
    const now = new Date();
    const createdAt = new Date(item.createdAt);
    const dueTime = item.dueTime ? new Date(item.dueTime) : null;
    
    switch(item.status) {
      case 'APPLIED': {
        const expireTime = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
        const remainingHours = Math.floor((expireTime.getTime() - now.getTime()) / (60 * 60 * 1000));
        
        return {
          message: `状态：已申请 | 取书时间：${expireTime ? formatDateTime(expireTime)+'前' : '未设置'}`,
          additionalInfo: remainingHours > 0 
            ? `${remainingHours > 0 ? `剩余${remainingHours}小时` : '已超时'}` 
            : '超过取书期限，预约已失效'
        };
      }
        
      case 'BORROWED': {
        const remainingDays = dueTime 
          ? Math.floor((dueTime.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)) 
          : null;
        
        return {
          message: `状态: 借阅中 | 应还日期: ${dueTime ? formatDateTime(dueTime) : '未设置'}`,
          additionalInfo: remainingDays !== null 
            ? (remainingDays > -1 ? `剩余${remainingDays}天` : '已超过还书期限') 
            : ''
        };
      }
        
      case 'OVERDUE': {
        const overdueDays = dueTime 
          ? Math.floor((now.getTime() - dueTime.getTime()) / (24 * 60 * 60 * 1000)) 
          : 0;
        
        return {
          message: `状态: 已逾期 | 超期${overdueDays}天`,
          additionalInfo: '请联系用户尽快归还'
        };
      }
        
      case 'RETURNED':
        return {
          message: `状态: 已归还 | 归还时间: ${item.returnTime ? formatDateTime(new Date(item.returnTime)) : '未知'}`
        };
        
      default:
        return {
          message: `状态: ${ borrowStatus.find(c => c.value === item.status)?.label|| item.status }`
        };
    }
  };

  // 获取警告类型
  const getAlertType = (status: string): 'info' | 'warning' | 'error' | 'success' => {
    switch(status) {
      case 'APPLIED': return 'info';
      case 'BORROWED': return 'info';
      case 'CANCELLED': return 'info';
      case 'OVERDUE': return 'warning';
      case 'RETURNED': return 'success';
      case 'LOST': return 'error';
      default: return 'info';
    }
  };

  const changeStatus = async (borrowId: string, status: string) => {
    try {
      if (handleStatusChange) {
        await handleStatusChange(borrowId, status);
        onCancel(); // 操作成功后关闭 Modal
      }
    } catch (error) {
      console.error('状态变更失败:', error);
    }
  }

  if (!record) {
    return (
      <Modal
        title="借阅记录详情"
        open={visible}
        onCancel={onCancel}
        footer={null}
        width={800}
      >
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <Spin size="large" />
          <p>正在加载借阅记录...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title="借阅记录详情"
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={800}
      style={{ padding: '24px' }}
    >
      <Spin spinning={modalLoading}>
        <div className={styles.detailContainer}>
          {/* 用户信息区块 */}
          <div className={styles.sectionContainer}>
            <Divider orientation="left" className={styles.actionDivider}>
              <UserOutlined /> 用户信息
            </Divider>
            <Row gutter={24} align="middle" className={styles.sectionContent}>
              <Col span={12}>
                <Descriptions column={1} className={styles.detailDescriptions}>
                  <Descriptions.Item label="用户ID">{record.userId}</Descriptions.Item>
                  <Descriptions.Item label="信誉分">
                    <span className={userData?.creditScore < 60 ? styles.lowCredit : ''}>
                      {userData?.creditScore || '未知'}
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions column={1} className={styles.detailDescriptions}>
                  <Descriptions.Item label="姓名">{userData?.name || '未知'}</Descriptions.Item>
                  <Descriptions.Item label="电话">{userData?.phone || '未提供'}</Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>

          {/* 书籍信息区块 */}
          <div className={styles.sectionContainer}>
            <Divider orientation="left" className={styles.actionDivider}>
              <BookOutlined /> 书籍信息
            </Divider>
            <Row gutter={24} className={styles.sectionContent}>
              <Col span={12}>
                <Descriptions column={1} className={styles.detailDescriptions}>
                  <Descriptions.Item label="书籍ID">{bookData?.id}</Descriptions.Item>
                  <Descriptions.Item label="书籍状态">
                    <Badge 
                      status={bookStatus.find(b => b.value === bookData?.status)?.badgeStatus} 
                      text={bookStatus.find(b => b.value === bookData?.status)?.label || '未知'} 
                    />
                  </Descriptions.Item>
                </Descriptions>
              </Col>
              <Col span={12}>
                <Descriptions column={1} className={styles.detailDescriptions}>
                  <Descriptions.Item label="书名">
                    <span className={styles.bookTitle}>{bookData?.title || '未知'}</span>
                  </Descriptions.Item>
                  <Descriptions.Item label="库存">
                    <span className={bookData?.bookNumber <= 0 ? styles.lowStock : ''}>
                      {bookData?.bookNumber}
                    </span>
                  </Descriptions.Item>
                </Descriptions>
              </Col>
            </Row>
          </div>
          
          {/* 借阅详情区块 */}
          <div className={styles.sectionContainer}>
            <Divider orientation="left" className={styles.actionDivider}>
              <HistoryOutlined /> 借阅详情
            </Divider>
            <div className={styles.sectionContent}>
              <Descriptions bordered column={2} className={styles.detailDescriptions}>
                <Descriptions.Item label="借阅ID">{record.id}</Descriptions.Item>
                <Descriptions.Item label="当前状态">
                  <Tag color={borrowStatus.find(b => b.value === record.status)?.color}>
                    {borrowStatus.find(b => b.value === record.status)?.label}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="申请时间">
                  {formatDateTime(new Date(record.createdAt))}
                </Descriptions.Item>
                {record.borrowTime && (
                  <Descriptions.Item label="取书时间">
                    {formatDateTime(new Date(record.borrowTime))}
                  </Descriptions.Item>
                )}
                {record.dueTime && (
                  <Descriptions.Item label="应还日期">
                    {formatDateTime(new Date(record.dueTime))}
                  </Descriptions.Item>
                )}
                {record.returnTime && (
                  <Descriptions.Item label="归还时间">
                    {formatDateTime(new Date(record.returnTime))}
                  </Descriptions.Item>
                )}
              </Descriptions>
            </div>
          </div>
          
          {/* 状态信息区块 */}
          <div className={styles.statusContainer}>
            <Alert
              message={getBorrowStatusInfo(record).message}
              description={getBorrowStatusInfo(record).additionalInfo}
              type={getAlertType(record.status)}
              showIcon
              className={styles.statusAlert}
            />
          </div>
          
          {/* 管理员操作区块 */}
          {showActions && handleStatusChange && (
            <div className={styles.actionContainer}>
              <Divider orientation="left" className={styles.actionDivider}>
                <SettingOutlined /> 管理员操作
              </Divider>
              <Space size="large" className={styles.actionButtons}>
                {record.status === 'APPLIED' && (
                  <Button 
                    type="primary" 
                    icon={<CheckOutlined />}
                    loading={loading}
                    onClick={() => changeStatus(record.id, 'BORROWED')}
                    className={styles.actionButton}
                  >
                    批准借阅
                  </Button>
                )}
                
                {record.status === 'BORROWED' && (
                  <>
                    <Button 
                      type="primary" 
                      icon={<CheckCircleOutlined />}
                      loading={loading}
                      onClick={() => changeStatus(record.id, 'RETURNED')}
                      className={styles.actionButton}
                    >
                      标记归还
                    </Button>
                    <Button 
                      danger
                      icon={<WarningOutlined />}
                      loading={loading}
                      onClick={() => changeStatus(record.id, 'LOST')}
                      className={styles.actionButton}
                    >
                      标记丢失
                    </Button>
                  </>
                )}
                
                {record.status === 'OVERDUE' && (
                  <>
                    <Button 
                      type="primary" 
                      icon={<CheckCircleOutlined />}
                      loading={loading}
                      onClick={() => changeStatus(record.id, 'RETURNED')}
                      className={styles.actionButton}
                    >
                      标记归还
                    </Button>
                    <Button 
                      icon={<NotificationOutlined />}
                      loading={loading}
                      onClick={() => message.warning('请先联系用户确认书籍状态')}
                      className={styles.actionButton}
                    >
                      发送催还
                    </Button>
                  </>
                )}
              </Space>
            </div>
          )}
        </div>
      </Spin>
    </Modal>
  );
};

export default BorrowDetailModal;