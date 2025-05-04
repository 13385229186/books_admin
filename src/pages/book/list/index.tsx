import { Card, Col, Form, List, Row, Radio, Typography, message, Button, Spin } from 'antd';
import { getCategoryList } from '@/services/category/api';
import { getBookList } from '@/services/book/api';
import { pageListParamFormat } from '@/utils/format';
import type { FC } from 'react';
import StandardFormRow from './components/StandardFormRow';
import type { ListItemDataType } from './data.d';
import useStyles from './style.style';
import React, { useEffect, useRef, useState, useCallback  } from 'react';
import { bookStatus, categoryListConfig } from '../../bookManager/data.d'
import { ProFormText } from '@ant-design/pro-components';
import BookCard from '@/components/BookCard'
import { history } from 'umi';

const FormItem = Form.Item;
const { Paragraph } = Typography;

// 防抖函数
const debounce = (fn: Function, delay: number) => {
  let timer: NodeJS.Timeout;
  return function(...args: any[]) {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
};

const Book: FC = () => {
  const PAGESIZE = 8;
  const { styles } = useStyles();
  const [dataList, setDataList] = useState<ListItemDataType[]>([]);
  const [categoryList, setCategoryList] = useState<categoryListConfig[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [form] = Form.useForm();
  const [searchParams, setSearchParams] = useState({});
  const loadingRef = useRef(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: PAGESIZE,
    total: 0,
    hasMore: true,
  });
  const spinRef = useRef(null);
  const listRef = useRef(null);

  // 使用ref存储最新pagination状态
  const paginationRef = useRef(pagination);
  
  // 同步pagination状态到ref
  useEffect(() => {
    paginationRef.current = pagination;
  }, [pagination]);

    // 使用useCallback优化请求函数
    const requestBookListInfo = useCallback(async (params: any, loadMore = false) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      
      try {
        const isLoadMore = loadMore && !listLoading;
        if (isLoadMore) {
          setLoadingMore(true);
        } else {
          setListLoading(true);
        }
  
        // 使用ref获取最新页码
        const nextPage = loadMore ? paginationRef.current.current + 1 : 1;
        
        const mergedParams = {
          ...searchParams,
          ...params,
          current: nextPage,
          pageSize: PAGESIZE,
        };
  
        const bookListRes: any = await getBookList(pageListParamFormat(mergedParams));
        
        if (bookListRes.status === 'fail') {
          message.error(bookListRes.msg);
          return;
        }
  
        const { data, total } = bookListRes.data;
        const newData = data.map((item: any) => ({
          id: item.id,
          title: item.title,
          author: item.author,
          categoryId: item.categoryId,
          status: item.status,
          createdAt: item.createdAt,
          cover: item.cover,
          ebook: item.ebook,
          intro: item.intro,
          press: item.press,
          isbn: item.isbn,
          updatedAt: item.updatedAt,
        }));
  
        setDataList(prev => loadMore ? [...prev, ...newData] : newData);
        
        // 更新pagination状态
        const newPagination = {
          current: nextPage,
          pageSize: PAGESIZE,
          total,
          hasMore: nextPage * PAGESIZE < total,
        };
        
        setPagination(newPagination);
      } catch (error) {
        console.error('获取书籍列表失败:', error);
        message.error('获取书籍列表失败');
      } finally {
        loadingRef.current = false;
        setListLoading(false);
        setLoadingMore(false);
      }
    }, [searchParams, listLoading]);

  useEffect(() => {
    // 获取书籍类别
    getCategoryList().then((res) => {
      setCategoryList(res.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      })));
    });

    requestBookListInfo({ current: 1, pageSize: PAGESIZE });
  }, []);

  useEffect(() => {
    // 滚动处理函数
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      const clientHeight = document.documentElement.clientHeight;
      
      // 使用ref获取最新hasMore状态
      if (
        !loadingRef.current &&
        paginationRef.current.hasMore &&
        scrollHeight - scrollTop <= clientHeight + 200
      ) {
        requestBookListInfo({}, true);
      }
    };

    // 添加防抖的滚动事件监听
    const debouncedScroll = debounce(handleScroll, 200);
    window.addEventListener('scroll', debouncedScroll);
    
    return () => {
      window.removeEventListener('scroll', debouncedScroll);
    };
  }, [searchParams, requestBookListInfo]);

  const handleImmediateChange = (changedValues: any) => {
    if ('categoryId' in changedValues || 'status' in changedValues) {
      const values = form.getFieldsValue();
      requestBookListInfo({ ...searchParams, ...values });
    }
  };

  const handleSubmit = (values: any) => {
    setSearchParams(values);
    requestBookListInfo(values);
  };

  return (
    <div className={styles.coverCardList}>
      <Card variant='borderless'>
        <Form
          form={form}
          layout="inline"
          onValuesChange={handleImmediateChange}
          onFinish={handleSubmit}
          initialValues={{ 
            categoryId: null,
            status: null
          }}
        >
          <div onBlur={() => handleImmediateChange({})} style={{width: '100%'}}>
            <StandardFormRow
              title="所属类目"
              block
              style={{ paddingBottom: 11 }}
            >
              <FormItem name="categoryId">
                <Radio.Group 
                  block 
                  optionType="button" 
                  buttonStyle="solid" 
                  style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px'
                  }}
                >
                  {[
                    { label: '全部', value: null },
                    ...categoryList
                  ].map((category) => (
                    <Radio.Button 
                      value={category.value!} 
                      key={category.value}
                      style={{ 
                        whiteSpace: 'nowrap',
                        margin: 0
                      }}
                    >
                      {category.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </FormItem>
            </StandardFormRow>
            <StandardFormRow
              title="可借状态"
              block
              style={{ paddingBottom: 11 }}
            >
              <FormItem name="status">
                <Radio.Group block optionType="button" buttonStyle="solid">
                  {[
                    { label: '全部', value: null },
                    ...bookStatus
                  ].map((status) => (
                    <Radio.Button value={status.value!} key={status.value}>
                      {status.label}
                    </Radio.Button>
                  ))}
                </Radio.Group>
              </FormItem>
            </StandardFormRow>
          </div>
          <StandardFormRow title="其它选项" grid last>
            <Row gutter={[16, 16]} style={{ marginBottom: -16 }}>
              <Col xl={7} lg={8} md={12} sm={12} xs={24} style={{ paddingBottom: 16 }}>
                <ProFormText label="书名" name="title" placeholder="请输入书名" />
              </Col>
              <Col xl={7} lg={8} md={12} sm={12} xs={24} style={{ paddingBottom: 16 }}>
                <ProFormText label="作者" name="author" placeholder="请输入作者" />
              </Col>
              <Col xl={7} lg={8} md={12} sm={12} xs={24} style={{ paddingBottom: 16 }}>
                <ProFormText label="出版社" name="press" placeholder="请输入出版社" />
              </Col>
              <Col xl={3} lg={8} md={12} sm={12} xs={24} style={{ paddingBottom: 16 }}>
                <Button 
                  type="primary" 
                  htmlType="submit"
                  loading={listLoading}
                  style={{ float: 'right' }}
                >
                  搜索
                </Button>
              </Col>
            </Row>
          </StandardFormRow>
        </Form>
      </Card>
      <div className={styles.cardList} ref={listRef}>
        <List<ListItemDataType>
          rowKey="id"
          loading={listLoading}
          grid={{
            gutter: 16,
            xs: 1,
            sm: 2,
            md: 3,
            lg: 3,
            xl: 4,
            xxl: 4,
          }}
          dataSource={dataList}
          renderItem={(item) => (
            <List.Item>
              <BookCard 
                data={item}
              />
            </List.Item>
          )}
        />
        <div ref={spinRef}>
          {loadingMore && (
            <div style={{ textAlign: 'center', padding: '16px 0' }}>
              <Spin size="small" />
              <span style={{ marginLeft: 8 }}>加载更多...</span>
            </div>
          )}
          {!pagination.hasMore && dataList.length > 0 && (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#999' }}>
              没有更多数据了
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Book;