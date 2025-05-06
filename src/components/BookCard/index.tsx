import { Card, Typography, Tooltip, Tag, Image } from 'antd';
import { history } from 'umi';
import type { ListItemDataType } from '@/pages/book/list/data.d';
import useStyles from './style.style';
import { recordVIEW } from '@/services/recommend/api';
import { toCosUrl } from '@/utils/format';

const { Paragraph } = Typography;

interface BookCardProps {
  data: ListItemDataType;
  showRecommendBadge?: boolean; // 是否显示推荐标识
  rank?: number; // 推荐排名（1-3显示特殊样式）
}

const BookCard: React.FC<BookCardProps> = ({ 
  data, 
  showRecommendBadge = false,
  rank 
}) => {
  const { styles } = useStyles();

  // 推荐标识渲染
  const renderRecommendBadge = () => {
    if (!showRecommendBadge || !rank || rank > 3) return null;
    
    const badgeConfig = [
      { emoji: '👍', color: '#ffcc00' }, // 第一名
      { emoji: '👍', color: '#c0c0c0' }, // 第二名
      { emoji: '👍', color: '#cd7f32' }  // 第三名
    ];

    return (
      <Tooltip title={`推荐指数第${rank}名`}>
        <div 
          style={{
            position: 'absolute',
            cursor: 'pointer',
            top: 10,
            right: 20,
            fontSize: 24,
            // transform: `rotate(${(3 - rank) * 15}deg)`,
            zIndex: 10, // 提高层级
            textShadow: `0 0 8px ${badgeConfig[rank - 1]?.color || '#999'}`,
            lineHeight: 1
          }}
        >
          {badgeConfig[rank - 1]?.emoji || '⭐'}
        </div>
      </Tooltip>
    );
  };


  return (
    <>
      {renderRecommendBadge()}
      <Card
        className={styles.card}
        hoverable
        onClick={() => {
          // 记录查看书籍详情行为
          recordVIEW(data.id)
          history.push(`/book/detail/${data.id}`)
        }}
        cover={
          data.cover ? (
            <div style={{ position: 'relative' }}>
              {/* <img 
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                  borderTopLeftRadius: '10px',
                  borderTopRightRadius: '10px',
                }} 
                alt={data.title} 
                src={toCosUrl(data.cover)} 
              /> */}
              <Image
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                  borderTopLeftRadius: '10px',
                  borderTopRightRadius: '10px',
                }} 
                preview={false}
                src={toCosUrl(data.cover)}
                alt={data.title}
              />
            </div>
          ) : (
            <div style={{
              width: '100%',
              height: '200px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgb(0.5, 0.5, 0.5, 0.2)'
            }}>
              暂无封面
            </div>
          )
        }
      >
        <Card.Meta
          title={<a>{data.title}</a>}
          description={
            <Paragraph ellipsis={{ rows: 2 }}>
              {data.intro || '暂无简介'}
            </Paragraph>
          }
        />
        <div className={styles.cardItemContent}>
          <span>{data.author}</span>
        </div>
      </Card>
    </>
  
  );
};

export default BookCard;