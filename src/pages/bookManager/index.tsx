import { getBookList, bookUpload, updateBook, getBookNumberById, addCategory } from '@/services/book/api';
import { getCategoryList } from '@/services/category/api';
import { pageListParamFormat, toCosUrl, getFileNameFromUrl } from '@/utils/format';
import { beforeCoverUpload, beforePdfUpload } from '@/utils/beforeUpload';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import type { ActionType } from '@ant-design/pro-components';
import {
  ModalForm,
  PageContainer,
  ProDescriptions,
  ProFormText,
  ProFormTextArea,
  ProFormSelect,
  ProTable,
} from '@ant-design/pro-components';
import { Drawer, Row, Col, Button, Input, Upload, notification, Modal, Badge, DatePicker, message, Spin, Form, Select } from 'antd';
import React, { useEffect, useRef, useState } from 'react';
import {
  ExclamationCircleOutlined ,
} from '@ant-design/icons';
import { bookStatus, categoryListConfig, BookDataConfig, FileState } from './data.d'
import { isEqual } from 'lodash';
import { UploadBookParams, UpdateBookParams } from '@/services/book/data.d';


const { TextArea } = Input;

const ActivityMemberManager: React.FC = () => {
  const [form] = Form.useForm();
  const [addCategoryForm] = Form.useForm();
  const actionRef = useRef<ActionType>();

  const [currentRow, setCurrentRow] = useState<BookDataConfig>(); // 当前操作数据行
  const [dataList, setDataList] = useState([]) // 数据源，书籍列表
  const [isModalOpen, setIsModalOpen] = useState(false); // 操作二次确认提示modal打开标识
  const [tableLoading, setTableLoading] = useState(false); // 表格loading标识
  const [operate, setOperate] = useState('添加'); // 当前操作
  const [createModalOpen, setCreateModalOpen] = useState<boolean>(false);  // 添加/修改modal打开标识
  const [formLoading, setFormLoading] = useState(false); // 添加/修改表单loading标识
  const [coverState, setCoverState] = useState<FileState>({ current: [], original: []  }); // 封面文件
  const [ebookState, setEbookState] = useState<FileState>({ current: [], original: [] }); // 电子书文件
  const [categoryList, setCategoryList] = useState<categoryListConfig[]>([])  // 书籍类别列表
  const [drawerVisible, setDrawerVisible] = useState(false);  // 抽屉详情打开表示
  const [drawLoading, setDrawLoading] = useState(false);  // 抽屉详情loading标识
  const [addCategoryModalOpen, setAddCategoryModalOpen] = useState<boolean>(false);  // 添加类别modal打开标识
  const [addCategoryFormLoading, setAddCategoryFormLoading] = useState<boolean>(false);  // 添加类别表单loading标识
  
  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      ellipsis: true,
      width: 50,
    },
    {
      title: '书名',
      dataIndex: 'title',
      ellipsis: true,
      render: (_: any, record: BookDataConfig) => (
        <a 
          onClick={() => {
            setDrawerVisible(true);
            setDrawLoading(true);
            getBookNumberById({bookId: record.id}).then((res)=>{
              setDrawLoading(false);
              record.bookNumber = res.data
              setCurrentRow(record);
            })
          }}
        >
          {record.title}
        </a>
      ),
    },
    {
      title: '作者',
      dataIndex: 'author',
      ellipsis: true,
    },
    {
      title: '类别',
      dataIndex: 'categoryId',
      ellipsis: true,
      valueType: 'select',
      fieldProps: {
        options: categoryList,
      },
      render: (_: any, record: BookDataConfig) => {
        const config = categoryList.find(c => c.value === record.categoryId);
        return config ? config.label : '未知类别'
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: bookStatus,
      },
      ellipsis: true,
      render: (_: any, record: BookDataConfig) => {
        const config = bookStatus.find(c => c.value === record.status);
        return config ? (
          <Badge status={config.badgeStatus} text={config.label} />
        ) : (
          `未知状态: ${record.status}`
        );
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      valueType: 'dateTime',
      search: false,
      ellipsis: true,
    },
    {
      title: '操作',
      dataIndex: 'option',
      valueType: 'option',
      width: 100,
      render: (_: any, record: BookDataConfig) => [
        <a
          key={`edit-${record.id}`}
          onClick={() => {
            getBookNumberById({bookId: record.id}).then((res)=>{
              record.bookNumber = res.data
              setCurrentRow(record); // 设置当前行数据
              setCreateModalOpen(true); // 打开添加/修改表单
              setOperate('编辑');
              fillFormWithData(record);
            })
          }}
        >
          编辑
        </a>,
        // <a
        //   key={`delete-${record.id}`}
        //   onClick={() => {
        //     setCurrentRow(record); // 设置当前行数据
        //     setIsModalOpen(true);
        //     setOperate('删除');
        //     // //console.log(currentRow);
        //   }}
        //   style={{color: 'red'}}
        // >
        //   删除
        // </a>
      ]
    }
  ]

  /**
   * 获取书籍列表
   */
  const requestListInfo = async (params:any)=>{
    params = pageListParamFormat(params)
    // //console.log(params)
    setTableLoading(true)
    const bookListRes:any = await getBookList(params);
    if(bookListRes.status === 'fail'){
      message.error(bookListRes.msg)
      setTableLoading(false)
      return ;
    }

    setTableLoading(false)
    setDataList(bookListRes.data.data.map((item:any)=>{
      return {
        'id':item.id,
        'title':item.title,
        'author':item.author,
        'categoryId':item.categoryId, 
        'status':item.status,
        'createdAt':item.createdAt,

        'cover': item.cover ? toCosUrl(item.cover) : item.cover,
        'ebook': item.ebook ? toCosUrl(item.ebook) : item.ebook,
        'intro': item.intro,
        'press':item.press,
        'isbn':item.isbn,
        'updatedAt':item.updatedAt, 
      }
    }))
    // //console.log(bookListRes.data)
    return bookListRes.data
  }

  const handleOk = () => {
    //console.log("handleOk")
  }

  const handleCancel = () => {
    setIsModalOpen(false);
  };


  // const uploadButton = (
  //   <button style={{ border: 0, background: 'none' }} type="button">
  //     {uploadLoading ? <LoadingOutlined /> : operate==='添加'?<PlusOutlined />:<UploadOutlined />}
  //     <div style={{ marginTop: 8 }}>{operate==='添加'?'Upload':'修改'}</div>
  //   </button>
  // );

  /**
   * 打开添加表单前，清除表单所有数据
   */
  const resetForm = () => {
    // //console.log('重置表单')
    // 重置表单字段
    form.resetFields();

    // 清空上传文件状态
    setEbookState({ current: [], original: []  });
    setCoverState({ current: [], original: []  }); 
  }

  /**
   * 打卡编辑表单前，根据currentRow填充表单
   */
  const fillFormWithData = (record: BookDataConfig) => {
    console.log(record)
    if (!record) return; // 安全校验

    // 填充基础表单字段
    form.setFieldsValue({
      title: record.title,
      isbn: record.isbn,
      author: record.author,
      press: record.press,
      categoryId: record.categoryId,
      status: record.status,
      intro: record.intro,
      bookNumber: record.bookNumber
    });

    // 封面文件
    if (record.cover) {
      const originalCover = {
        uid: '-cover',
        name: getFileNameFromUrl(record.cover),
        status: 'done',
        url: record.cover
      };
      setCoverState({ 
        current: [originalCover],
        original: [originalCover]
      });
    }

    // 电子书文件
    if (record.ebook) {
      const originalEbook = {
        uid: '-ebook',
        name: getFileNameFromUrl(record.ebook),
        status: 'done',
        url: record.ebook
      };
      setEbookState({ 
        current: [originalEbook],
        original: [originalEbook]
      });
    }

  }

  useEffect(()=>{
    // 获取书籍类别
    getCategoryList().then((res) => {
      //console.log(res.data)

      setCategoryList(res.data.map((item: any) => ({
        label: item.name,
        value: item.id,
      })));
    })
  }, [])

  const onFinish = async (values: any) => {
    if(operate === '添加'){
      let params: UploadBookParams = {
        bookData: values,
      }
      // 是否添加封面
      if(coverState.current[0]){
        params['cover'] = coverState.current[0].originFileObj
      }
      // 是否添加电子书
      if(ebookState.current[0]){
        params['file'] = ebookState.current[0].originFileObj
      }
      //console.log(params)
      setFormLoading(true)
      bookUpload(params).then((res) => {
        setFormLoading(false)
        if(res.status === 'success'){
          notification.destroy();
          notification.success({
            message: res.msg,
          });
          if (actionRef.current) {
            actionRef.current.reload();
          }
          setCreateModalOpen(false);
          resetForm();
        }else{
          notification.destroy();
          notification.error({
            message: res.msg,
          });
        }
      })
    }else if(operate === '编辑'){
      if(!currentRow){
        message.error('当前操作记录不详，请重试');
        return ;
      }
      setFormLoading(true)
      let params: UpdateBookParams = {
        bookId: currentRow.id,
        bookData: values
      }

      // 是否修改封面
      const isCoverModified = coverState.original != null && !isEqual(coverState.current, coverState.original);
      //console.log(isCoverModified)
      if(isCoverModified){
        params['cover'] = coverState.current[0].originFileObj
      }
      // 是否修改电子书
      const isEbookModified = ebookState.original != null && !isEqual(ebookState.current, ebookState.original);
      //console.log(isEbookModified)
      
      if(isEbookModified){
        params['file'] = ebookState.current[0].originFileObj
      }
      //console.log(params)
      updateBook(params).then((res) => {
        setFormLoading(false)
        if(res.status === 'success'){
          notification.destroy();
          notification.success({
            message: res.msg,
          });
          if (actionRef.current) {
            actionRef.current.reload();
          }
          setCreateModalOpen(false);
          resetForm();
        }else{
          notification.destroy();
          notification.error({
            message: res.msg,
          });
        }
      })
    }
  };

  return (
    <PageContainer
      title="书籍管理"
    >
      <ProTable
        headerTitle='书籍列表'
        actionRef={actionRef}
        rowKey="id"
        pagination={{
          pageSize: 5,
        }}
        loading={tableLoading}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              setOperate('添加')
              setCreateModalOpen(true);
            }}
          >
            <PlusOutlined /> 添加书籍
          </Button>,
          <Button
          type="primary"
          key="primary"
          onClick={() => {
            setAddCategoryModalOpen(true)
          }}
        >
          <PlusOutlined /> 添加类别
        </Button>,
        ]}
        request={requestListInfo}
        columns={columns}
        dataSource={dataList}
      />

      <ModalForm
        title="添加书籍类别"
        width="400px"
        form={addCategoryForm}
        open={addCategoryModalOpen}
        onOpenChange={(choice)=>{
          setAddCategoryModalOpen(choice)
          if(!choice){
            setAddCategoryFormLoading(false)
          }
        }}
        onFinish = {async (values) => {
          setAddCategoryFormLoading(true)
          try{
            addCategory({CategoryName: values.categoryName}).then((res)=>{
              if(res.status === 'fail'){
                message.error(res.msg)
              }else{
                setAddCategoryModalOpen(false)
                addCategoryForm.resetFields();
                message.success("类别添加成功：" + values.categoryName)
              }
            })
          } catch {
            message.error("类别添加失败")
          } finally {
            setAddCategoryFormLoading(false)
          }
        }}
      >
        <Spin spinning={addCategoryFormLoading} tip = "添加中...">
          <ProFormText
            label='类别名称'
            rules={[{ required: true, message: "类别名称必填！" }]}
            name="categoryName"
            placeholder='请输入类别名称'
          />
        </Spin>
      </ModalForm>


      {/* 添加or修改书籍表单 */}
      <ModalForm
        title={operate+"书籍"}
        width="800px"
        form={form}
        open={createModalOpen}
        onOpenChange={(choice)=>{
          setCreateModalOpen(choice)
          if(!choice){
            resetForm()
            setFormLoading(false)
          }
        }}
        onFinish = {onFinish}
      >
        <Spin spinning={formLoading} tip = "上传中...">
          {/* 第一行：书名 + ISBN */}
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                label='书名'
                rules={[{ required: true, message: "书名必填！" }]}
                name="title"
                placeholder='请输入书名'
              />
            </Col>
            <Col span={12}>
              <ProFormText
                label='ISBN'
                rules={[{ required: true, message: "ISBN必填！" }]}
                name="isbn"
                placeholder='请输入ISBN'
              />
            </Col>
          </Row>

          {/* 第二行：作者 + 出版社 */}
          <Row gutter={16}>
            <Col span={12}>
              <ProFormText
                label='作者'
                rules={[{ required: true, message: "作者必填！" }]}
                name="author"
                placeholder='请输入作者'
              />
            </Col>
            <Col span={12}>
              <ProFormText
                label='出版社'
                rules={[{ required: true, message: "出版社必填！" }]}
                name="press"
                placeholder='请输入出版社'
              />
            </Col>
          </Row>

          {/* 第三行：类别 + 状态 + 库存 */}
          <Row gutter={16}>
            <Col span={8}>
              <ProFormSelect
                label="类别"
                name="categoryId"
                rules={[{ required: true, message: '类别必选！' }]}
                options={categoryList}
                placeholder="请选择类别"
              />
            </Col>
            <Col span={8}>
              <ProFormSelect
                label="状态"
                name="status"
                rules={[{ required: true, message: '状态必选！' }]}
                initialValue="MAINTENANCE"
                options={bookStatus}
                placeholder="请选择状态"
                fieldProps={{
                  onChange: (value) => {
                    // 当状态BORROWED时自动设置状态为库存为0
                    if (value === 'BORROWED') {
                      form.setFieldsValue({
                        bookNumber: 0
                      });
                    }
                  }
                }}
              />
            </Col>
            <Col span={8}>
              <ProFormText
                label='库存'
                rules={[{ required: true, message: "库存数量必填！" }]}
                initialValue={0}
                name="bookNumber"
                placeholder='请输入库存数量'
                fieldProps={{
                  type: 'number',
                  min: 0,
                  onChange: (e) => {
                    const value = e.target.value;
                    // 当库存为0时自动设置状态为MAINTENANCE
                    if (value === '0') {
                      form.setFieldsValue({
                        status: 'MAINTENANCE'
                      });
                      // message.info('已自动修改状态为“暂停借阅”')
                    }
                  }
                }}
              />
            </Col>
          </Row>
          <Form.Item 
            label="书籍简介"
            name="intro"
          >
            <TextArea rows={4} placeholder='请输入书籍简介'/>
          </Form.Item>
          <Form.Item label="书籍封面">
            <Upload
              fileList={coverState.current}
              beforeUpload={(cover: any) => {
                if(beforeCoverUpload(cover)){
                  const newFile = {
                    uid: cover.uid,
                    name: cover.name,
                    status: 'done',
                    originFileObj: cover
                  };
                  setCoverState(prev => ({ ...prev, current: [newFile] }));
                }
                return false; // 手动控制上传
              }}
              onRemove={() => {
                setCoverState(prev => ({ ...prev, current: [] }));
              }}
            >
              {!coverState.current?.length && (<Button icon={<UploadOutlined />}>上传封面</Button>)}
            </Upload>
          </Form.Item>
          <Form.Item label="电子书">
            <Upload
              fileList={ebookState.current}
              beforeUpload={(file: any) => {
                if(beforePdfUpload(file)){
                  const newFile = {
                    uid: file.uid,
                    name: file.name,
                    status: 'done',
                    originFileObj: file
                  };
                  setEbookState(prev => ({ ...prev, current: [newFile] }));
                }
                return false; // 手动控制上传
              }}
              onRemove={() => {
                setEbookState(prev => ({ ...prev, current: [] }));
              }}
            >
              {!ebookState.current?.length && (<Button icon={<UploadOutlined />}>上传电子书</Button>)}
            </Upload>
          </Form.Item>
        </Spin>
      </ModalForm>

      <Drawer
        title="书籍详情"
        width={500}
        open={drawerVisible}
        loading={drawLoading}
        onClose={() => setDrawerVisible(false)}
        extra={[
          <Button 
            key="edit" 
            type="primary" 
            onClick={() => {
              setOperate('编辑');
              setDrawerVisible(false);
              setCreateModalOpen(true);
              if(currentRow) fillFormWithData(currentRow);
            }}
          >
            编辑
          </Button>
        ]}
      >
        {currentRow && (
          <>
            <ProDescriptions<BookDataConfig>
              column={1}
              dataSource={currentRow}
              columns={[
                {
                  title: '封面',
                  dataIndex: 'cover',
                  render: (_, record) => (
                    record.cover ? (
                      <img 
                        src={record.cover} 
                        alt="封面" 
                        style={{ maxWidth: '100%', maxHeight: 200 }}
                      />
                    ) : '无封面'
                  ),
                },
                {
                  title: 'ID',
                  dataIndex: 'id',
                },
                {
                  title: '书名',
                  dataIndex: 'title',
                },
                {
                  title: 'ISBN',
                  dataIndex: 'isbn',
                },
                {
                  title: '作者',
                  dataIndex: 'author',
                },
                {
                  title: '出版社',
                  dataIndex: 'press',
                },
                {
                  title: '类别',
                  dataIndex: 'categoryId',
                  render: (_, record) => {
                    const config = categoryList.find(c => c.value === record.categoryId);
                    return config ? config.label : '未知类别';
                  },
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  render: (_, record) => {
                    const config = bookStatus.find(c => c.value === record.status);
                    return config ? (
                      <Badge status={config.badgeStatus} text={config.label} />
                    ) : (
                      `未知状态: ${record.status}`
                    );
                  },
                },
                {
                  title: '库存',
                  dataIndex: 'bookNumber',
                },
                {
                  title: '简介',
                  dataIndex: 'intro',
                  render: (text) => text || '暂无简介',
                },
                {
                  title: '电子书',
                  dataIndex: 'ebook',
                  render: (_, record) => (
                    record.ebook ? (
                      <a href={record.ebook} >{getFileNameFromUrl(record.ebook)}</a>
                    ) : '无电子书'
                  ),
                },
                {
                  title: '创建时间',
                  dataIndex: 'createdAt',
                  valueType: 'dateTime',
                },
                {
                  title: '更新时间',
                  dataIndex: 'updatedAt',
                  valueType: 'dateTime',
                },
              ]}
            />
          </>
        )}
      </Drawer>

      <Modal title={<><ExclamationCircleOutlined />  确认{operate}？</>} open={isModalOpen}
       onOk={handleOk} 
       onCancel={handleCancel}
      >
        {currentRow && <>
          <p>书名：{currentRow.title}</p>
          <p>作者：{currentRow.author}</p>
        </>}
      </Modal>
    </PageContainer>
  );
};

export default ActivityMemberManager;
