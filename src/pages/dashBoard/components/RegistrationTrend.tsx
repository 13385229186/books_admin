import React, { useEffect, useState } from 'react';
import { Card, message } from 'antd';
import { Line } from '@ant-design/charts';
import { getRecentRegistrations } from '@/services/overView/api'
import styles from './index.less';
import type { RegistrationItem } from './data.d';

const RegistrationTrend: React.FC = () => {
  const [data, setData] = useState<RegistrationItem[]>();
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    getRecentRegistrations().then((res)=>{
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
  
  // 补全7天数据
  const completeData = React.useMemo(() => {
    if (!data) return [];
    
    const resultMap = new Map<string, number>();
    data.forEach(item => {
      resultMap.set(item.date, item.count);
    });
    
    // 生成最近7天日期
    const dateRange = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (5 - i));
      return date.toISOString().split('T')[0];
    });
    
    return dateRange.map(date => ({
      date,
      count: resultMap.get(date) || 0
    }));
  }, [data]);

  const config = {
    data: completeData,
    xField: 'date',
    yField: 'count',
    height: 300,
    point: {
      size: 4,
      shape: 'circle',
    },
    interaction: {
      tooltip: {
        marker: false,
      },
    },
    style: {
      lineWidth: 2,
    },
  };

  return (
    <Card 
      title="近7天用户注册趋势" 
      loading={loading}
      className={styles.chartCard}
    >
      <Line {...config} />
    </Card>
  );
};

export default RegistrationTrend;