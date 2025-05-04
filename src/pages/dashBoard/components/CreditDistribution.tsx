import React, { useEffect, useState } from 'react';
import { Card, message } from 'antd';
import { Pie } from '@ant-design/charts';
import { getCreditDistribution } from '@/services/overView/api'
import styles from './index.less';
import type { CreditDistributionItem } from './data.d';
import { CreditDistributionType } from './data.d';

const CreditDistribution: React.FC = () => {
  const [data, setData] = useState<CreditDistributionItem>();
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    getCreditDistribution().then((res)=>{
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
  
  // 定义三个信用区间
  const creditLevels = [
    { name: '优秀', des: '80分以上' },
    { name: '良好', des: '80到50分' },
    { name: '待提升', des: '50分以下' }
  ];
  
  // 处理数据，确保三个区间都有值
  const chartData = React.useMemo(() => {
    if (!data) return creditLevels.map(l => ({ ...l, value: 0 }));
    
    return creditLevels.map(level => ({
      name: level.name,
      value: data[level.name as keyof CreditDistributionType] || 0,
    }));
  }, [data]);

  const config = {
    data: chartData,
    angleField: 'value',
    colorField: 'name',
    label: {
      text: (d: any) => `${d.name}\n ${d.value}`,
      position: 'outside',
    },
    legend: {
      color: {
        title: false,
        position: 'right',
        rowPadding: 5,
      },
    },
    height: 300,
    interaction: {
      tooltip: {
        series: true
      }
    },
    tooltip: {
      title: (d: any) => {
        return d.name + '：' + creditLevels.find(l => l.name === d.name)?.des
      },
      items: [
        "value"
      ]
    }
  };

  return (
    <Card 
      title="用户信用分布" 
      loading={loading}
      className={styles.chartCard}
    >
      <Pie {...config} />
    </Card>
  );
};

export default CreditDistribution;