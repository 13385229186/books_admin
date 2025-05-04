import { createStyles } from 'antd-style';

const useStyles = createStyles(({ token }) => {
  return {
    avatarList: {
      flex: '0 1 auto',
    },
    cardList: {
      marginTop: '24px',
    },
    coverCardList: {
      '.ant-list .ant-list-item-content-single': { maxWidth: '100%' },
    },
    listContainer: {
      height: 'calc(100vh - 300px)',
      overflowY: 'auto',
      padding: '0 16px',
      '&::-webkit-scrollbar': {
        width: '6px',
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: token.colorPrimary,
        borderRadius: '3px',
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: token.colorBgContainer,
      },
    },
    loadingMore: {
      textAlign: 'center',
      padding: '16px 0',
      color: token.colorTextSecondary,
    },
  };
});

export default useStyles;
