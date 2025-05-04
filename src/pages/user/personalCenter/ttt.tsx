import { PageContainer } from '@ant-design/pro-components';
import { Button, Spin, Avatar, Card, Col, Divider, List, Progress, Row, Space, Tag, Typography, message, Modal, Popover } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  EditOutlined,
  KeyOutlined,
  BookOutlined,
  WarningOutlined,
  StarOutlined,
  MessageOutlined,
  SettingOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';
import styles from './style.less';
import { history, useModel } from '@umijs/max';
import { getViolationListByUser, getBorrowListByUser, cancelBorrowBook, getBorrowDetailById } from '@/services/user/api';
import { pageListParamFormat } from '@/utils/format';
import { User, BorrowRecord, ViolationRecord, PageParams, BorrowStatusText } from './data.d'

const { Text, Title } = Typography;

// 违规类型映射
const ViolationTypeMap = {
  OVERDUE: { text: '逾期未还', score: 20 },
  LOST: { text: '书籍丢失', score: 40 },
  EXPIRED: { text: '申请过期', score: 10 }
};

const PersonalCenter: React.FC = () => {
  const { initialState } = useModel('@@initialState');
  const currentUser = initialState?.currentUser as User | undefined;
  const [violationList, setViolationList] = useState<ViolationRecord[]>([]);
  const [borrowList, setBorrowList] = useState<BorrowRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedRecord, setSelectedRecord] = useState<BorrowRecord | null>(null);
  const [selectedViolation, setSelectedViolation] = useState<ViolationRecord | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [violationModalVisible, setViolationModalVisible] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [violationLoading, setViolationLoading] = useState(false);

  // 检查用户登录状态
  useEffect(() => {
    if (!currentUser) {
      message.warning('请先登录');
      history.push('/user/login');
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        await Promise.all([
          requestViolationList({ pageSize: 5, current: 1 }),
          requestBorrowList({ pageSize: 5, current: 1 })
        ]);
      } catch (error) {
        console.error('获取数据失败:', error);
        message.error('数据加载失败');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]);

  /** 获取违规列表 */
  const requestViolationList = async (params: PageParams): Promise<void> => {
    try {
      const formattedParams = pageListParamFormat(params);
      const res = await getViolationListByUser(formattedParams);
      
      if (res?.status === 'fail') {
        throw new Error(res.msg || '获取违规记录失败');
      }
      
      setViolationList(res?.data?.data || []);
    } catch (error) {
      console.error('获取违规记录失败:', error);
      message.error('获取违规记录失败');
      throw error;
    }
  };

  /** 获取借阅列表 */
  const requestBorrowList = async (params: PageParams): Promise<void> => {
    try {
      const formattedParams = pageListParamFormat(params);
      const res = await getBorrowListByUser(formattedParams);
      
      if (res?.status === 'fail') {
        throw new Error(res.msg || '获取借阅记录失败');
      }
      
      setBorrowList(res?.data?.data || []);
    } catch (error) {
      console.error('获取借阅记录失败:', error);
      message.error('获取借阅记录失败');
      throw error;
    }
  };

  // 获取借阅详情
  const fetchBorrowDetail = async (borrowId: string) => {
    try {
      setViolationLoading(true);
      const res = await getBorrowDetailById({ id: borrowId });
      if (res?.status === 'fail') {
        throw new Error(res.msg || '获取借阅详情失败');
      }
      setSelectedRecord(res.data.data[0]);
    } catch (error) {
      console.error('获取借阅详情失败:', error);
      message.error('获取借阅详情失败');
    } finally {
      setViolationLoading(false);
    }
  };

  // 显示违规详情
  const showViolationDetail = async (violation: ViolationRecord) => {
    setSelectedViolation(violation);
    if (violation.borrowId) {
      await fetchBorrowDetail(violation.borrowId);
    }
    setViolationModalVisible(true);
  };

  // 取消预约函数
  const handleCancelReservation = async (recordId: string) => {
    try {
      setCancelLoading(true);
      const res = await cancelBorrowBook({ borrowId: recordId });
      if(res.status === 'fail'){
        message.error('取消预约失败');
        return ;
      }
      message.success('预约已取消');
      setModalVisible(false);
      await requestBorrowList({ pageSize: 5, current: 1 });
    } catch (error) {
      message.error('取消预约失败');
    } finally {
      setCancelLoading(false);
    }
  };

  // 日期格式化函数
  const formatDateTime = (date: Date): string => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '-';
    return date.toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return null;
  }

  const safeUser: User = {
    id: currentUser.id,
    avatar: currentUser.avatar || null,
    username: currentUser.username,
    creditScore: currentUser.creditScore,
    createdAt: currentUser.createdAt,
    favoritesCount: currentUser.favoritesCount || 0,
    reviewsCount: currentUser.reviewsCount || 0
  };

  // 信誉分提示内容
  const creditScoreTip = (
    <div>
      <p>- 初始分数：100分</p>
      <p>- 申请过期：扣10分</p>
      <p>- 逾期未还：扣20分</p>
      <p>- 书籍丢失：扣40分</p>
      <p>- 80分以上可同时借阅3本书籍</p>
      <p>- 80分以下，50分以上可同时借阅1本书籍</p>
      <p>- 50分以下不可借阅，需联系管理员</p>
    </div>
  );

  return (
    <PageContainer title={false} className={styles.personalContainer}>
      <Spin spinning={loading}>
        {/* 用户信息区 */}
        <Card variant='borderless' className={styles.userCard}>
          <Row gutter={24} align="middle">
            <Col xs={24} sm={8} md={6} lg={4}>
              <div className={styles.avatarArea}>
                <Avatar 
                  size={120} 
                  src={safeUser.avatar || 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png'} 
                />
                <div className={styles.uploadBtn}>更换头像</div>
              </div>
            </Col>
            <Col xs={24} sm={16} md={18} lg={20}>
              <div className={styles.infoArea}>
                <Title level={3} className={styles.username}>
                  {safeUser.username}
                  <Space>
                    <Tag color="blue" style={{ marginLeft: 12 }}>信誉分：{safeUser.creditScore}</Tag>
                    <Popover content={creditScoreTip} title="信誉分说明">
                      <Button type="text" icon={<QuestionCircleOutlined />} size="small" />
                    </Popover>
                  </Space>
                </Title>
                
                <Progress 
                  percent={safeUser.creditScore} 
                  status={
                    safeUser.creditScore < 60 ? 'exception' : 
                    safeUser.creditScore < 80 ? 'normal' : 'success'
                  }
                  showInfo={false}
                  strokeWidth={8}
                  className={styles.creditBar}
                />

                <Space size="large" className={styles.metaInfo}>
                  <Text type="secondary">注册时间：{formatDateTime(new Date(safeUser.createdAt))}</Text>
                </Space>

                <Space size="middle" className={styles.actionButtons}>
                  <a><EditOutlined /> 编辑资料</a>
                  <a><KeyOutlined /> 修改密码</a>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 数据看板区 */}
        <Row gutter={16} className={styles.dataPanel}>
          <Col xs={24} md={12}>
            <Card 
              title={<><BookOutlined /> 当前借阅 ({borrowList.length})</>}
              className={styles.recordCard}
            >
              <List
                dataSource={borrowList}
                renderItem={(item) => (
                  <List.Item
                    className={`${styles.recordItem}`}
                    onClick={() => {
                      setSelectedRecord(item);
                      setModalVisible(true);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <List.Item.Meta
                      title={<span className={styles.bookTitle}>{item.title}</span>}
                      description={`状态: ${BorrowStatusText[item.status]}`}
                    />
                  </List.Item>
                )}
              />
              <div className={styles.viewAll}>
                <a onClick={() => history.push('/user/borrow-records')}>查看全部借阅记录 →</a>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card 
              title={<><WarningOutlined /> 违规记录 ({violationList.length})</>}
              className={styles.recordCard}
            >
              <List
                dataSource={violationList}
                renderItem={(item) => (
                  <List.Item
                    onClick={() => showViolationDetail(item)}
                    style={{ cursor: 'pointer' }}
                  >
                    <List.Item.Meta
                      title={`${formatDateTime(new Date(item.createdAt))} ${ViolationTypeMap[item.violationType].text}`}
                      description={`扣除 ${ViolationTypeMap[item.violationType].score} 分`}
                    />
                    <Button 
                      type="link" 
                      onClick={(e) => {
                        e.stopPropagation();
                        message.info('申诉功能敬请期待');
                      }}
                    >
                      申诉
                    </Button>
                  </List.Item>
                )}
              />
              <div className={styles.viewAll}>
                <a onClick={() => history.push('/user/violation-records')}>查看全部违规记录 →</a>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 功能导航区 */}
        <Card title="功能中心" variant='borderless' className={styles.functionCard}>
          <Row gutter={[16, 24]}>
            <Col xs={12} sm={8} md={6}>
              <a className={styles.functionItem} onClick={() => history.push('/user/favorites')}>
                <div className={styles.functionIcon}><StarOutlined /></div>
                <div>我的收藏</div>
                <Tag className={styles.countTag}>{safeUser.favoritesCount}</Tag>
              </a>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <a className={styles.functionItem} onClick={() => history.push('/user/reviews')}>
                <div className={styles.functionIcon}><MessageOutlined /></div>
                <div>我的评价</div>
                <Tag className={styles.countTag}>{safeUser.reviewsCount}</Tag>
              </a>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <a className={styles.functionItem} onClick={() => history.push('/user/reading-history')}>
                <div className={styles.functionIcon}><BookOutlined /></div>
                <div>阅读历史</div>
              </a>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <a className={styles.functionItem} onClick={() => history.push('/user/settings')}>
                <div className={styles.functionIcon}><SettingOutlined /></div>
                <div>账户设置</div>
              </a>
            </Col>
          </Row>
        </Card>

        {/* 借阅详情弹窗 */}
        <Modal
          title="借阅详情"
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedRecord && (
            <div className={styles.detailContainer}>
              <div className={styles.detailHeader}>
                <h3>{selectedRecord.title}</h3>
                <Tag color={selectedRecord.status === 'OVERDUE' ? 'red' : 'blue'}>
                  {BorrowStatusText[selectedRecord.status]}
                </Tag>
              </div>
              
              <Divider />
              
              <Row gutter={16}>
                <Col span={12}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>借阅ID:</span>
                    <span>{selectedRecord.id}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>申请时间:</span>
                    <span>{formatDateTime(new Date(selectedRecord.createdAt))}</span>
                  </div>
                </Col>
                <Col span={12}>
                  {selectedRecord.dueTime && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>应还日期:</span>
                      <span>{formatDateTime(new Date(selectedRecord.dueTime))}</span>
                    </div>
                  )}
                </Col>
              </Row>
              
              {selectedRecord.status === 'APPLIED' && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                  <Button 
                    type="primary" 
                    danger
                    loading={cancelLoading}
                    onClick={() => handleCancelReservation(selectedRecord.id)}
                  >
                    取消预约
                  </Button>
                </div>
              )}
            </div>
          )}
        </Modal>

        {/* 违规详情弹窗 */}
        <Modal
          title="违规详情"
          open={violationModalVisible}
          onCancel={() => setViolationModalVisible(false)}
          footer={null}
          width={600}
        >
          {selectedViolation && (
            <div className={styles.detailContainer}>
              <div className={styles.detailHeader}>
                <h3>违规记录 #{selectedViolation.id}</h3>
                <Tag color="red">
                  {ViolationTypeMap[selectedViolation.violationType].text}
                </Tag>
              </div>
              
              <Divider />
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>违规时间:</span>
                <span>{formatDateTime(new Date(selectedViolation.createdAt))}</span>
              </div>
              
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>扣除分数:</span>
                <span>{ViolationTypeMap[selectedViolation.violationType].score} 分</span>
              </div>
              
              {selectedRecord && (
                <>
                  <Divider>相关借阅记录</Divider>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>书名:</span>
                    <span>{selectedRecord.title}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>借阅ID:</span>
                    <span>{selectedRecord.id}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>申请时间:</span>
                    <span>{formatDateTime(new Date(selectedRecord.createdAt))}</span>
                  </div>
                </>
              )}
              
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <Button 
                  type="primary"
                  onClick={() => message.info('申诉功能敬请期待')}
                >
                  我要申诉
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </Spin>
    </PageContainer>
  );
};

export default PersonalCenter;