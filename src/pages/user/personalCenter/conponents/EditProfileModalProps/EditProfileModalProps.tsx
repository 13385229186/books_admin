import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { updateInfo } from '@/services/user/api';

interface EditProfileModalProps {
  visible: boolean;
  onCancel: () => void;
  userInfo: {
    username: string;
    name?: string;
    phone?: string;
  };
  onSuccess?: () => void;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onCancel,
  userInfo,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const res = await updateInfo({
        updateData: {
          username: values.username,
          name: values.name,
          phone: values.phone,
        }
      });

      if (res?.status === 'fail') {
        throw new Error(res.msg || '更新失败');
      }

      message.success('资料更新成功');
      onSuccess?.();
      onCancel();
    } catch (error: any) {
      console.error('更新失败:', error);
      message.error(error.message || '资料更新失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="编辑资料"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          username: userInfo.username,
          name: userInfo.name || '',
          phone: userInfo.phone || '',
        }}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[
            // { required: true, message: '请输入用户名' },
            { min: 2, max: 16, message: '用户名长度为2-16个字符' },
          ]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item
          name="name"
          label="姓名"
          rules={[
            { max: 16, message: '姓名长度不能超过16个字符' },
          ]}
        >
          <Input placeholder="请输入姓名" />
        </Form.Item>

        <Form.Item
          name="phone"
          label="手机号"
          rules={[
            {
              pattern: /^1[3-9]\d{9}$/,
              message: '请输入正确的手机号格式',
            },
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditProfileModal;