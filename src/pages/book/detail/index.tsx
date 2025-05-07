import { PageContainer } from '@ant-design/pro-components';
import { Form, InputNumber, Button, Modal, Card, Col, Divider, Image, Row, Space, Spin, Typography, message } from 'antd';
import React, { useEffect, useState } from 'react';
import { useParams, history } from 'umi';
import { getBookById } from '@/services/book/api';
import { getCategoryList } from '@/services/category/api';
import { borrowBook } from '@/services/borrow/api';
import { recordREADONLINE, recordDOWNLOAD, recordBORROW } from '@/services/recommend/api';
import { toCosUrl } from '@/utils/format';
import { DownloadOutlined } from '@ant-design/icons';
import styles from './style.less';
import { bookStatus, categoryListConfig, BookDataConfig, FileState } from '../../bookManager/data.d'
import PdfReader from './components/PdfReader';

const { Title, Text, Paragraph } = Typography;

const BookDetail: React.FC = () => {
  const { id } = useParams();
  const [book, setBook] = useState<BookDataConfig>();
  const [loading, setLoading] = useState(true);
  const [categoryList, setCategoryList] = useState<categoryListConfig[]>([]);
  const [isReading, setIsReading] = useState(false);
  const [borrowModalVisible, setBorrowModalVisible] = useState(false);
  const [borrowForm] = Form.useForm();
  const [borrowing, setBorrowing] = useState(false);
  
  const handleReadOnline = () => {
    if(id){
      // 记录下在线阅读行为
      recordREADONLINE(id)
    }
    setIsReading(true);
  };
  
  useEffect(() => {
    // 获取书籍类别
    getCategoryList().then((res) => {
      if(res.status === 'success'){
          setCategoryList(res.data.map((item: any) => ({
          label: item.name,
          value: item.id,
        })));
      }else{
        message.error(res.msg)
      }
      
    })
    const fetchBookDetail = async () => {
      try {
        setLoading(true);
        const response = await getBookById({bookId: id});
        if (response.status === 'success') {
          setBook(response.data);
        } else {
          message.error(response.msg);
          history.push('/book/list');
        }
      } catch (error) {
        message.error('获取书籍详情失败');
        history.push('/book/list');
      } finally {
        setLoading(false);
      }
    };

    fetchBookDetail();
  }, [id]);

  if (!book) {
    return (
      <PageContainer>
        <Spin spinning={loading} />
      </PageContainer>
    );
  }

  return (
    <PageContainer title={false} className={styles.bookDetailContainer}>
      <Card variant='borderless' loading={loading}>
        <Row gutter={[40, 40]}>
          {/* 封面大图区域 */}
          <Col xs={24} sm={24} md={10} lg={8} xl={6}>
            <div className={styles.coverContainer}>
              {book.cover ? (
                <Image
                  src={toCosUrl(book.cover)}
                  alt={book.title}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '300px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  backgroundColor: 'rgb(0.5, 0.5, 0.5, 0.2)'
                }}>
                  暂无封面
                </div>
              )}
            </div>
          </Col>

          {/* 书籍信息区域 */}
          <Col xs={24} sm={24} md={14} lg={16} xl={18}>
            <div className={styles.bookInfo}>
              <Title level={2} className={styles.bookTitle}>
                {book.title}
              </Title>

              <div className={styles.metaInfo}>
                <Row gutter={[16, 16]}>
                  {/* 第一列 */}
                  <Col span={12}>
                    <Space direction="vertical" size={8}>
                      <div>
                        <Text type="secondary">作者: </Text>
                        <Text strong>{book.author || '未知'}</Text>
                      </div>
                      <div>
                        <Text type="secondary">出版社: </Text>
                        <Text strong>{book.press || '未知'}</Text>
                      </div>
                      <div>
                        <Text type="secondary">ISBN: </Text>
                        <Text strong>{book.isbn || '未知'}</Text>
                      </div>
                    </Space>
                  </Col>
                  
                  {/* 第二列 */}
                  <Col span={12}>
                    <Space direction="vertical" size={8}>
                      <div>
                        <Text type="secondary">类别: </Text>
                        <Text strong>{categoryList.find(c => c.value === book.categoryId)?.label || '未知'}</Text>
                      </div>
                      <div>
                        <Text type="secondary">可借状态: </Text>
                        <Text strong>
                          {bookStatus.find(c => c.value === book.status)?.label || '未知'}
                        </Text>
                      </div>
                    </Space>
                  </Col>
                </Row>
              </div>

              <Divider />

              {/* 操作按钮区域 */}
              <div className={styles.actionButtons}>
                <Space size="large">
                  <Button 
                    type="primary" 
                    size="large"
                    onClick={handleReadOnline}
                    disabled={!book.ebook}
                  >
                    在线阅读
                  </Button>
                  <Button 
                    type="default" 
                    size="large"
                    icon={<DownloadOutlined />}
                    disabled={!book.ebook}
                    onClick={() => {
                      if (book.ebook && id) {
                        // 记录下载电子书行为
                        recordDOWNLOAD(id)
                        window.open(toCosUrl(book.ebook));
                      }
                    }}
                  >
                    下载电子书
                  </Button>
                  <Button 
                    type="primary" 
                    size="large"
                    disabled={book.status !== 'AVAILABLE'}
                    onClick={() => setBorrowModalVisible(true)}
                  >
                    借阅实体书
                  </Button>
                </Space>
              </div>
                    
            </div>
          </Col>

          {/* 书籍简介区域 */}
          <Col span={24}>
            <div className={styles.bookDescription}>
              <Title level={4}>书籍简介</Title>
              <Paragraph ellipsis={{ rows: 10, expandable: true }}>
                {book.intro || '暂无简介'}
              </Paragraph>
            </div>
          </Col>
        </Row>
      </Card>

      {/* PDF阅读模态框 */}
      <Modal
        title={`${book?.title} - 在线阅读`}
        open={isReading}
        onCancel={() => setIsReading(false)}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        styles={{
          body: { 
            height: '80vh',
            padding: 0 
          }
        }}
        destroyOnClose
      >
        {isReading && book?.ebook && (
          <PdfReader 
            pdfUrl={toCosUrl(book.ebook)} 
            bookId={book.id}
          />
        )}
      </Modal>

      {/* 借阅表单模态框 */}
      <Modal
        title={`借阅《${book?.title}》实体书`}
        open={borrowModalVisible}
        onCancel={() => {
          setBorrowModalVisible(false);
          borrowForm.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => setBorrowModalVisible(false)}>
            取消
          </Button>,
          <Button 
            key="submit" 
            type="primary" 
            loading={borrowing}
            onClick={() => borrowForm.submit()}
          >
            确认借阅
          </Button>,
        ]}
        destroyOnClose
      >
        <Form
          form={borrowForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              setBorrowing(true);
              const response = await borrowBook({
                bookId: book.id,
                borrowDays: values.borrowDays
              });
              
              if (response.status === 'success' && id) {
                // 记录借阅书籍行为
                recordBORROW(id)
                message.success('借阅成功');
                Modal.info({
                  title: '借阅成功',
                  content: (
                    <div>
                      <p>实体书将为您保留24小时，超时后预约将自动取消</p>
                      <p>请及时前往图书馆取书，地址：XX市XX区XX路XX号</p>
                      <p>超时未取书将扣除5点信誉积分</p>
                    </div>
                  ),
                  okText: '我知道了',
                });
                // 刷新书籍状态
                const bookResponse = await getBookById({bookId: id});
                setBook(bookResponse.data);
              } else {
                message.error(response.msg);
              }
            } catch (error) {
              message.error('借阅失败');
            } finally {
              setBorrowing(false);
              setBorrowModalVisible(false);
            }
          }}
        >
          <Form.Item
            label="借阅天数"
            name="borrowDays"
            rules={[
              { required: true, message: '请输入借阅天数' },
              { type: 'number', min: 1, max: 30, message: '借阅天数1-30天' }
            ]}
          >
            <InputNumber 
              style={{ width: '100%' }}
              min={1}
              max={30}
              placeholder="请输入1-30天的借阅天数"
            />
          </Form.Item>
          <div style={{ color: 'rgba(0,0,0,0.45)' }}>
            <p>提示：每次借阅最长30天</p>
          </div>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default BookDetail;