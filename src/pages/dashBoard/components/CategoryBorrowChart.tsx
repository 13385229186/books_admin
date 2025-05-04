import React, { useEffect, useState } from 'react';
import { Card, Table, Divider, message } from 'antd';
import { Column } from '@ant-design/charts';
import { getBorrowCountByCategory } from '@/services/overView/api'
import styles from './index.less';
import type { CategoryBorrowItem } from './data.d';

const CategoryBorrowChart: React.FC = () => {
  const [data, setData] = useState<CategoryBorrowItem[]>();
  const [loading, setLoading] = useState<boolean>(false);
  
  useEffect(() => {
    getBorrowCountByCategory().then((res)=>{
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
  
  // 过滤掉借阅量为0的分类（可选）
  const filteredData = React.useMemo(() => {
    if (!data) return [];
    return data.filter((item: any) => item.borrow_count > 0);
  }, [data]);

  const columnConfig = {
    data: data,
    xField: 'name',
    yField: 'borrow_count',
    height: 400,
    label: {
      // position: 'middle',
      style: {
        fill: '#FFFFFF',
      },
    },
    xAxis: {
      label: {
        autoRotate: true,
      },
    },
    meta: {
      name: { alias: '分类名称' },
      borrow_count: { alias: '借阅量' },
    },
    color: ({ name }: any) => {
      // 根据分类名称生成颜色
      const colors = [
        '#1890ff', '#52c41a', '#722ed1', '#13c2c2', 
        '#f5222d', '#fa8c16', '#eb2f96', '#a0d911'
      ];
      return colors[name.length % colors.length];
    },
  };

  const tableColumns = [
    {
      title: '分类名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '借阅量',
      dataIndex: 'borrow_count',
      key: 'borrow_count',
      sorter: (a: any, b: any) => a.borrow_count - b.borrow_count,
    },
  ];

  return (
    <Card 
      title="分类借阅排行榜" 
      loading={loading}
      className={styles.chartCard}
    >
      <Column {...columnConfig} />
      <Divider />
      <Table
        dataSource={data}
        columns={tableColumns}
        pagination={false}
        size="small"
        rowKey="name"
      />
    </Card>
  );
};

export default CategoryBorrowChart;