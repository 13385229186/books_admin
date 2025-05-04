import React, { useEffect, useState } from 'react';
import { Card, Statistic, Row, Col, message } from 'antd';
import { BookOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { getBookOverview } from '@/services/overView/api'
import styles from './index.less';
import type { BookOverviewType } from './data.d';

const BookOverview: React.FC = () => {
  const [data, setData] = useState<BookOverviewType>();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    getBookOverview().then((res)=>{
      setLoading(true)
      try {
        if(res.status === 'fail'){
          message.error(res.msg);
          return;
        }
        //console.log(res.data)
        setData(res.data)
      } finally {
        setLoading(false)
      }
    })
  }, [])
  
  return (
    <Card 
      title="书籍概览" 
      loading={loading}
      className={styles.overviewCard}
    >
      <Row gutter={16}>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Statistic
            title="总藏书量"
            value={data?.total || 0}
            prefix={<BookOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Statistic
            title="电子书占比"
            value={data?.ebookStats?.percentage || 0}
            suffix="%"
            precision={2}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Statistic
            title="纸质书可借占比"
            value={data?.physicalStats?.percentage || 0}
            suffix="%"
            precision={2}
          />
        </Col>
        <Col xs={24} sm={12} md={6} lg={6} xl={6}>
          <Statistic
            title="逾期未还"
            value={data?.overdue || 0}
            prefix={<ClockCircleOutlined />}
          />
        </Col>
      </Row>
    </Card>
  );
};

export default BookOverview;