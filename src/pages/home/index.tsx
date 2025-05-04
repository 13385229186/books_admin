import { Card, Row, Col, Typography, Button, List, message, Space, Tag, Spin } from 'antd';
import { useModel, history } from 'umi';
import BookCard from '@/components/BookCard';
import { getRecommendBooks, getHotBooks, recordVIEW } from '@/services/recommend/api';
import { useEffect, useState } from 'react';
import styles from './style.less';
import type { ListItemDataType } from '@/pages/book/list/data.d';
import type { HotBookWithHeatScore } from './data.d'
import { pageListParamFormat, toCosUrl } from '@/utils/format';

const { Title, Text } = Typography;
const getTimeGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour < 5) return '夜深了';
  if (hour < 9) return '早安';
  if (hour < 12) return '上午好';
  if (hour < 14) return '午安';
  if (hour < 18) return '下午好';
  if (hour < 24) return '晚上好';
  return '你好';
};

export default () => {
  const { initialState } = useModel('@@initialState');
  const [recommendBooks, setRecommendBooks] = useState<ListItemDataType[]>([]);
  const [hotBooks, setHotBooks] = useState<HotBookWithHeatScore[]>([]);
  const [loading, setLoading] = useState(false);
  const [recommendationLoading, setRecommendationLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 8,
    total: 0,
  });

  // 获取推荐书籍数据
  const fetchRecommendBooks = async (current: number, pageSize: number) => {
    setRecommendationLoading(true)
    try {
      const res = await getRecommendBooks({ current, pageSize });
      if (res.status === 'success') {
        setRecommendBooks(res.data.data);
        setPagination(prev => ({
          ...prev,
          total: res.data.total,
          current,
        }));
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      message.error('获取推荐书籍失败');
    } finally {
    setRecommendationLoading(false)
  }
  };

  // 获取热门书籍数据
  const fetchHotBooks = async () => {
    try {
      const res = await getHotBooks(pageListParamFormat({pageSize: 10, current: 1}));
      if (res.status === 'success') {
        setHotBooks(res.data.data);
      } else {
        message.error(res.msg);
      }
    } catch (error) {
      message.error('获取热门书籍失败');
    }
  };

  // 初始化数据
  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchRecommendBooks(1, pagination.pageSize),
      fetchHotBooks()
    ]);
    setLoading(false);
  };

  // 换一批推荐书籍
  const handleRefreshRecommend = () => {
    const nextPage = pagination.current + 1;
    const maxPage = Math.ceil(pagination.total / pagination.pageSize);
    
    // 如果已经是最后一页，回到第一页
    const newPage = nextPage > maxPage ? 1 : nextPage;
    fetchRecommendBooks(newPage, pagination.pageSize);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className={styles.container}>
      {/* 问候区 */}
      <Card className={styles.welcomeCard} variant='borderless'>
        <Row align="middle" justify="space-between">
          <Col>
          <Title level={3} style={{ marginBottom: 0 }}>
            {getTimeGreeting()}，{initialState?.currentUser?.username || '读者'}！
          </Title>
            <Text type="secondary">今日为你推荐了{recommendBooks.length}本好书</Text>
          </Col>
          <Col>
            <Button 
              type="primary" 
              size="large"
              onClick={() => history.push('/book/list')}
            >
              去找书 →
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 内容区 */}
      <Row gutter={24} className={styles.contentRow}>
        {/* 推荐书籍 */}
        <Col span={16}>
          <Card 
            title="为你推荐" 
            loading={loading}
            className={styles.recommendCard}
            extra={
              <Button 
                onClick={handleRefreshRecommend}
                loading={loading}
              >
                换一批
              </Button>
            }
          >
            <Spin spinning={recommendationLoading}>
              <Row gutter={[16, 24]}>
                {recommendBooks.map((book, index) => (
                  <Col key={book.id} xs={24} sm={12} md={8} lg={6}>
                    <BookCard 
                      data={book}
                      showRecommendBadge={index < 3}
                      rank={index + 1 as 1 | 2 | 3}
                    />
                  </Col>
                ))}
              </Row>
            </Spin>
          </Card>
        </Col>

        {/* 热门书籍 */}
        <Col span={8}>
          <Card
            title="热门书籍"
            loading={loading}
            className={styles.hotCard}
          >
            <List
              itemLayout="horizontal"
              dataSource={hotBooks}
              renderItem={(item, index) => (
                <List.Item 
                  className={styles.hotListItem}
                  actions={[
                    <Tag key="heat" color="volcano" className={styles.heatTag}>
                      {item.heatScore?.toFixed(2) || '0.00'} 热度
                    </Tag>
                  ]}
                  onClick={() => {
                    // 记录查看书籍详情行为
                    recordVIEW(item.id)
                    history.push(`/book/detail/${item.id}`);
                  }}
                >
                  <List.Item.Meta
                    title={
                      <a 
                        className={styles.bookLink}
                      >
                        <span className={styles.rankBadge}>{index + 1}. </span>
                        {item.title}
                      </a>
                    }
                    description={
                      <Text type="secondary" ellipsis>
                        {item.author}
                      </Text>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};