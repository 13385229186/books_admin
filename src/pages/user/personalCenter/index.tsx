import { PageContainer } from '@ant-design/pro-components';
import { Upload, Popover, Button, Spin, Avatar, Card, Col, Divider, List, Progress, Row, Space, Tag, Typography, message, Modal } from 'antd';
import React, { useEffect, useState } from 'react';
import {
  EditOutlined,
  KeyOutlined,
  BookOutlined,
  WarningOutlined,
  StarOutlined,
  MessageOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  UserOutlined,
  LoadingOutlined, 
  PlusOutlined
} from '@ant-design/icons';
import styles from './style.less';
import { history, useModel } from '@umijs/max';
import { updateInfo, getViolationListByUser, getBorrowListByUser, cancelBorrowBook, getBorrowDetailById } from '@/services/user/api';
import { pageListParamFormat, formatDateTime, toCosUrl } from '@/utils/format';
import { beforeCoverUpload } from '@/utils/beforeUpload';
import { User, BorrowRecord, ViolationRecord, PageParams, BorrowStatusText, ViolationTypeMap } from './data.d'
import RecordsModal from './conponents/RecordsModal/RecordsModal';
import RecordDetailModal from './conponents/RecordDetailModal/RecordDetailModal'
import EditProfileModal from './conponents/EditProfileModalProps/EditProfileModalProps';
import ChangePasswordModal from './conponents/ChangePasswordModal/ChangePasswordModal';

const { Text, Title } = Typography;

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
  const [recordsModalVisible, setRecordsModalVisible] = useState(false);
  const [currentRecordType, setCurrentRecordType] = useState<'borrow' | 'violation'>('borrow');
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [changePasswordVisible, setChangePasswordVisible] = useState(false);

  // 检查用户登录状态
  useEffect(() => {
    if (!currentUser) {
      message.warning('请先登录');
      history.push('/user/login');
      return;
    }

    // 获取用户数据
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
        message.error(res.msg)
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
        message.error(res.msg);
      }
      
      setBorrowList(res?.data?.data || []);
    } catch (error) {
      console.error('获取借阅记录失败:', error);
      message.error('获取借阅记录失败');
      throw error;
    }
  };

  // 状态颜色映射
  const getStatusColor = (status: keyof typeof BorrowStatusText): string => {
    const colors: Record<keyof typeof BorrowStatusText, string> = {
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

  // 状态样式类名
  const getStatusClassName = (status: keyof typeof BorrowStatusText): string => {
    const classMap: Partial<Record<keyof typeof BorrowStatusText, string>> = {
      OVERDUE: styles.overdue,
      EXPIRED: styles.expired,
      BORROWED: styles.borrowing
    };
    return classMap[status] || '';
  };

  // 获取状态相关信息
  const getBorrowStatusInfo = (item: BorrowRecord): { message: string; additionalInfo?: string } => {
    const now = new Date();
    const createdAt = new Date(item.createdAt);
    const dueTime = item.dueTime ? new Date(item.dueTime) : null;
    
    switch(item.status) {
      case 'APPLIED': {
        const expireTime = new Date(createdAt.getTime() + 24 * 60 * 60 * 1000);
        const remainingHours = Math.floor((expireTime.getTime() - now.getTime()) / (60 * 60 * 1000));
        
        return {
          message: `状态：已申请（${remainingHours > 0 ? `剩余${remainingHours}小时` : '已超时'}）`,
          additionalInfo: remainingHours > 0 
            ? `请于${formatDateTime(expireTime)}前到馆取书` 
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
          additionalInfo: '请尽快归还，超期将影响信用分'
        };
      }
        
      case 'RETURNED':
        return {
          message: `状态: 已归还 | 归还时间: ${item.returnTime ? formatDateTime(new Date(item.returnTime)) : '未知'}`
        };
        
      default:
        return {
          message: `状态: ${BorrowStatusText[item.status] || item.status}`
        };
    }
  };

  // 显示借阅详情弹窗
  const showRecordDetail = (record: BorrowRecord) => {
    setSelectedRecord(record);
    setModalVisible(true);
  };

  // 显示违规详情
  const showViolationDetail = async (violation: ViolationRecord) => {
    setSelectedViolation(violation);
    if (violation.borrowId) {
      await fetchBorrowDetail(violation.borrowId);
    }
    setViolationModalVisible(true);
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

  // 信誉分提示内容
  const creditScoreTip = (
    <div>
      <p>- 初始分数：100分</p>
      <p>- 申请过期：扣10分</p>
      <p>- 逾期未还：扣20分</p>
      <p>- 书籍丢失：扣40分</p>
      <p>- 若按时归还，则加5分，100分封顶</p>
      <p>- 80分以上可同时借阅3本书籍</p>
      <p>- 80分以下，50分以上可同时借阅1本书籍</p>
      <p>- 50分以下不可借阅，需联系管理员</p>
    </div>
  );

  // 如果用户未登录，直接返回null（已经跳转到登录页）
  if (!currentUser) {
    return null;
  }

  // 安全获取用户信息
  const safeUser: User = {
    id: currentUser.id,
    avatar: currentUser.avatar || null,
    username: currentUser.username,
    status: currentUser.status,
    creditScore: currentUser.creditScore,
    createdAt: currentUser.createdAt,
    favoritesCount: currentUser.favoritesCount || 0,
    reviewsCount: currentUser.reviewsCount || 0
  };

  // 取消预约函数
  const handleCancelReservation = async (recordId: string) => {
    try {
      setCancelLoading(true);
      // 调用取消预约的API
      const res = await cancelBorrowBook({ borrowId: recordId });
      if(res.status === 'fail'){
        message.error(res.msg);
        return ;
      }
      message.success('预约已取消');
      setModalVisible(false);
      // 刷新借阅列表
      await requestBorrowList({ pageSize: 5, current: 1 });
    } catch (error) {
      message.error('取消预约失败');
    } finally {
      setCancelLoading(false);
    }
  };

  const handleAvatarUpload = async ({ file }: { file: File }) => {
    try {
      setAvatarLoading(true);
      const res = await updateInfo({ avatarData: file });
      
      if (res?.status === 'fail') {
        throw new Error(res.msg || '上传失败');
      }
      
      message.success('头像更新成功');
      // 刷新页面获取最新数据
      window.location.reload();
    } catch (error) {
      console.error('上传失败:', error);
      message.error('头像更新失败');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <PageContainer title={false} className={styles.personalContainer}>
      <Spin spinning={loading}>
        {/* 用户信息区 */}
        <Card variant='borderless' className={styles.userCard}>
          <Row gutter={24} align="middle">
            <Col xs={24} sm={8} md={6} lg={4}>
              <div className={styles.avatarArea}>
                <Upload
                  name="avatar"
                  showUploadList={false}
                  beforeUpload={beforeCoverUpload}
                  customRequest={handleAvatarUpload}
                  accept="image/*"
                >
                  {safeUser.avatar ? (
                    <div className={styles.avatarWrapper}>
                      <Avatar
                        size={120}
                        src={avatarLoading ? undefined : safeUser.avatar}
                        icon={avatarLoading ? <LoadingOutlined /> : <UserOutlined />}
                      />
                      <div className={styles.uploadMask}>
                        {avatarLoading ? (
                          <LoadingOutlined />
                        ) : (
                          <>
                            <PlusOutlined />
                            <div className={styles.maskText}>点击修改</div>
                          </>
                        )}
                      </div>
                    </div>
                  ) : (
                    <Avatar
                      size={120}
                      icon={avatarLoading ? <LoadingOutlined /> : <UserOutlined />}
                    />
                  )}
                </Upload>
              </div>
            </Col>
            <Col xs={24} sm={16} md={18} lg={20}>
              <div className={styles.infoArea}>
                <Title level={3} className={styles.username}>
                  {safeUser.username}
                  <Tag color="blue" style={{ marginLeft: 12 }}>
                    信誉分：{safeUser.creditScore}
                  </Tag>
                  <Popover content={creditScoreTip} title="信誉分说明">
                    <Button type="text" icon={<QuestionCircleOutlined />} size="small" />
                  </Popover>
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
                  <a onClick={() => setEditProfileVisible(true)}><EditOutlined /> 编辑资料</a>
                  <a onClick={() => setChangePasswordVisible(true)}><KeyOutlined /> 修改密码</a>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 数据看板区 */}
        <Row gutter={16} className={styles.dataPanel}>
          <Col xs={24} md={12}>
            <Card 
              title={<><BookOutlined /> 当前借阅 </>}
              className={styles.recordCard}
            >
              <List
                // className={styles.recordList}
                // style={{
                //   paddingLeft: 16
                // }}
                dataSource={borrowList}
                renderItem={(item) => {
                  const statusInfo = getBorrowStatusInfo(item);
                  return (
                    <List.Item
                      className={`${getStatusClassName(item.status)} ${styles.recordItem}`}
                      onClick={() => showRecordDetail(item)}
                      style={{ cursor: 'pointer', paddingLeft: '16px' }}
                      actions={[
                        <Tag color={getStatusColor(item.status)}>
                          {BorrowStatusText[item.status]}
                        </Tag>
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <a className={styles.bookTitle}>
                            {item.title}
                          </a>
                        }
                        description={
                          <>
                            <div>{statusInfo.message}</div>
                            {statusInfo.additionalInfo && (
                              <div style={{ color: '#fa8c16' }}>{statusInfo.additionalInfo}</div>
                            )}
                          </>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
              <div className={styles.viewAll}>
                <a onClick={() => {
                  setCurrentRecordType('borrow');
                  setRecordsModalVisible(true);
                }}>查看全部借阅记录 →</a>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={12}>
            <Card 
              title={<><WarningOutlined /> 违规记录 </>}
              className={styles.recordCard}
            >
              <List
                dataSource={violationList}
                loading={violationLoading}
                renderItem={(item) => (
                  <List.Item
                    className={styles.recordItem}
                    onClick={() => showViolationDetail(item)}
                    style={{ cursor: 'pointer', paddingLeft: '16px' }}
                  >
                    <List.Item.Meta
                      title={`${item.title} ${ViolationTypeMap[item.violationType].text}`}
                      description={`扣除 ${ViolationTypeMap[item.violationType].score} 分 | 扣除时间: ${item.createdAt ? formatDateTime(new Date(item.createdAt)) : '未知'}`}
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
                <a onClick={() => {
                  setCurrentRecordType('violation');
                  setRecordsModalVisible(true);
                }}>查看全部违规记录 →</a>
              </div>
            </Card>
          </Col>
        </Row>

        {/* 功能导航区 */}
        <Card title="功能中心" variant='borderless' className={styles.functionCard}>
          <Row gutter={[16, 24]}>
            <Col xs={12} sm={8} md={6}>
              <a className={styles.functionItem} onClick={() => message.info('敬请期待')}>
                <div className={styles.functionIcon}><StarOutlined /></div>
                <div>我的收藏</div>
                <Tag className={styles.countTag}>{safeUser.favoritesCount}</Tag>
              </a>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <a className={styles.functionItem} onClick={() => message.info('敬请期待')}>
                <div className={styles.functionIcon}><MessageOutlined /></div>
                <div>我的评价</div>
                <Tag className={styles.countTag}>{safeUser.reviewsCount}</Tag>
              </a>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <a className={styles.functionItem} onClick={() => message.info('敬请期待')}>
                <div className={styles.functionIcon}><BookOutlined /></div>
                <div>阅读历史</div>
              </a>
            </Col>
            <Col xs={12} sm={8} md={6}>
              <a className={styles.functionItem} onClick={() => message.info('敬请期待')}>
                <div className={styles.functionIcon}><SettingOutlined /></div>
                <div>账户设置</div>
              </a>
            </Col>
          </Row>
        </Card>

        {/* 借阅详情弹窗 */}
        <RecordDetailModal
          visible={modalVisible}
          onCancel={() => setModalVisible(false)}
          record={selectedRecord}
          recordType="borrow"
          onCancelReservation={handleCancelReservation}
          cancelLoading={cancelLoading}
        />

        {/* 违规详情弹窗 */}
        <RecordDetailModal
          visible={violationModalVisible}
          onCancel={() => setViolationModalVisible(false)}
          record={selectedViolation}
          recordType="violation"
          relatedBorrowRecord={selectedRecord}
        />

        {currentUser && (
          <>
            <RecordsModal 
              visible={recordsModalVisible}
              onCancel={() => setRecordsModalVisible(false)}
              recordType={currentRecordType}
            />
            <EditProfileModal
              visible={editProfileVisible}
              onCancel={() => setEditProfileVisible(false)}
              userInfo={{
                username: currentUser.username,
                name: currentUser.name,
                phone: currentUser.phone,
              }}
              onSuccess={() => window.location.reload()}
            />
            
            <ChangePasswordModal
              visible={changePasswordVisible}
              onCancel={() => setChangePasswordVisible(false)}
              onSuccess={() => message.success('密码修改成功，请重新登录')}
            />
          </>
        )}
      </Spin>
    </PageContainer>
  );
};

export default PersonalCenter;