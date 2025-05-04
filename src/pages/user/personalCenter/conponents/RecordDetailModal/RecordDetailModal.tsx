// src/pages/PersonalCenter/components/RecordDetailModal.tsx
import React from 'react';
import { Modal, Tag, Divider, Row, Col, Button, message } from 'antd';
import { formatDateTime } from '@/utils/format';
import { BorrowRecord, ViolationRecord, BorrowStatusText, ViolationTypeMap } from '../../data.d';
import styles from '../../style.less';

interface RecordDetailModalProps {
  visible: boolean;
  onCancel: () => void;
  record: BorrowRecord | ViolationRecord | null;
  recordType: 'borrow' | 'violation';
  relatedBorrowRecord?: BorrowRecord | null;
  onCancelReservation?: (recordId: string) => Promise<void>;
  cancelLoading?: boolean;
}

const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  visible,
  onCancel,
  record,
  recordType,
  relatedBorrowRecord,
  onCancelReservation,
  cancelLoading = false,
}) => {
  // 状态颜色映射
  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      APPLIED: 'blue',
      CANCELLED: 'gray',
      EXPIRED: 'orange',
      BORROWED: 'green',
      OVERDUE: 'red',
      RETURNED: 'cyan',
      LOST: 'magenta',
    };
    return colors[status] || 'gray';
  };

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
            ? (remainingDays > 0 ? `剩余${remainingDays}天` : '已超过还书期限') 
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
          message: `状态: ${BorrowStatusText[item.status as keyof typeof BorrowStatusText] || item.status}`
        };
    }
  };

  if (!record) return null;

  return (
    <Modal
      title={recordType === 'borrow' ? "借阅详情" : "违规详情"}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={600}
    >
      {recordType === 'borrow' ? (
        <div className={styles.detailContainer}>
          <div className={styles.detailHeader}>
            <h3>{(record as BorrowRecord).title}</h3>
            <Tag color={getStatusColor((record as BorrowRecord).status)}>
              {BorrowStatusText[(record as BorrowRecord).status as keyof typeof BorrowStatusText]}
            </Tag>
          </div>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>借阅ID：</span>
            <span>{record.id}</span>
          </div>
          <Divider />
          
          <Row gutter={16}>
            <Col span={12}>
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>申请时间：</span>
                <span>{formatDateTime(new Date(record.createdAt))}</span>
              </div>
              {(record as BorrowRecord).borrowTime && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>取书时间：</span>
                  <span>{formatDateTime(new Date((record as BorrowRecord).borrowTime))}</span>
                </div>
              )}
            </Col>
            <Col span={12}>
              {(record as BorrowRecord).dueTime && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>应还日期：</span>
                  <span>{formatDateTime(new Date((record as BorrowRecord).dueTime))}</span>
                </div>
              )}
              {(record as BorrowRecord).returnTime && (
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>归还时间：</span>
                  <span>{formatDateTime(new Date((record as BorrowRecord).returnTime))}</span>
                </div>
              )}
            </Col>
          </Row>
          
          <Divider />
          
          <div className={styles.statusInfo}>
            {getBorrowStatusInfo(record as BorrowRecord).message}
            {getBorrowStatusInfo(record as BorrowRecord).additionalInfo && (
              <div style={{ color: '#fa8c16', marginTop: 8 }}>
                {getBorrowStatusInfo(record as BorrowRecord).additionalInfo}
              </div>
            )}
          </div>

          {(record as BorrowRecord).status === 'APPLIED' && onCancelReservation && (
            <div style={{ marginTop: 24, textAlign: 'center' }}>
              <Button 
                type="primary" 
                danger
                loading={cancelLoading}
                onClick={() => onCancelReservation(record.id)}
              >
                取消预约
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.detailContainer}>
          <div className={styles.detailHeader}>
            <h3>违规记录 #{record.id}</h3>
            <Tag color="red">
              {ViolationTypeMap[(record as ViolationRecord).violationType as keyof typeof ViolationTypeMap]?.text}
            </Tag>
          </div>
          
          <Divider />
          
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>违规时间:</span>
            <span>{formatDateTime(new Date(record.createdAt))}</span>
          </div>
          
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>扣除分数:</span>
            <span>{ViolationTypeMap[(record as ViolationRecord).violationType as keyof typeof ViolationTypeMap]?.score} 分</span>
          </div>
          
          {relatedBorrowRecord && (
            <>
              <Divider>相关借阅记录</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>书名:</span>
                    <span>{relatedBorrowRecord.title}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>借阅ID:</span>
                    <span>{relatedBorrowRecord.id}</span>
                  </div>
                </Col>
                <Col span={12}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>申请时间：</span>
                    <span>{formatDateTime(new Date(relatedBorrowRecord.createdAt))}</span>
                  </div>
                  {relatedBorrowRecord.borrowTime && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>取书时间：</span>
                      <span>{formatDateTime(new Date(relatedBorrowRecord.borrowTime))}</span>
                    </div>
                  )}
                </Col>
                <Col span={12}>
                  {relatedBorrowRecord.dueTime && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>应还日期：</span>
                      <span>{formatDateTime(new Date(relatedBorrowRecord.dueTime))}</span>
                    </div>
                  )}
                  {relatedBorrowRecord.returnTime && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>归还时间：</span>
                      <span>{formatDateTime(new Date(relatedBorrowRecord.returnTime))}</span>
                    </div>
                  )}
                </Col>
              </Row>
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
  );
};

export default RecordDetailModal;