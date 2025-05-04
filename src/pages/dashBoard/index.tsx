import React from 'react';
import { Row, Col } from 'antd';
import BookOverview from './components/BookOverview';
import RegistrationTrend from './components/RegistrationTrend';
import CreditDistribution from './components/CreditDistribution';
import CategoryBorrowChart from './components/CategoryBorrowChart';

const Dashboard: React.FC = () => {
  return (
    <div className="dashboard-container">
      <Row gutter={[16, 16]}>
        {/* 顶部概览卡片 */}
        <Col xs={24} sm={24} md={24} lg={24} xl={24}>
          <BookOverview />
        </Col>
        
        {/* 中间两列 */}
        <Col xs={24} sm={24} md={16} lg={16} xl={16}>
          <RegistrationTrend />
        </Col>
        
        <Col xs={24} sm={24} md={8} lg={8} xl={8}>
          <CreditDistribution />
        </Col>
        
        {/* 底部全宽图表 */}
        <Col span={24}>
          <CategoryBorrowChart />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;