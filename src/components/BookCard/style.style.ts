import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => {
  return {
    card: {
      position: 'relative', // 添加这个关键样式
      borderRadius: '8px',
      transition: 'all 0.3s ease',
      overflow: 'hidden', // 防止内容溢出
      
      '.ant-card-cover': {
        position: 'relative' // 确保封面容器是定位上下文
      },
      '.ant-card-meta-title': {
        marginBottom: '4px',
        '& > a': {
          display: 'inline-block',
          maxWidth: '100%',
          color: token.colorTextHeading,
        },
      },
      '.ant-card-meta-description': {
        height: '44px',
        overflow: 'hidden',
        lineHeight: '22px',
      },
      '&:hover': {
        '.ant-card-meta-title > a': {
          color: token.colorPrimary,
        },
      },
    },
    cardItemContent: {
      display: 'flex',
      height: '20px',
      marginTop: '16px',
      marginBottom: '-4px',
      lineHeight: '20px',
      '& > span': {
        flex: '1',
        color: token.colorTextSecondary,
        fontSize: '12px',
      },
    },
  }
});

export default useStyles;
