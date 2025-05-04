// src/components/ChangePasswordModal/index.tsx
import React, { useState } from 'react';
import { Modal, Form, Input, message } from 'antd';
import { updateInfo } from '@/services/user/api';
import Password from 'antd/es/input/Password';

interface ChangePasswordModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess?: () => void;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (values.newPassword !== values.confirmPassword) {
        throw new Error('两次输入的新密码不一致');
      }

      setLoading(true);
      
      const res = await updateInfo({
        updateData: {
          oldPassword: values.oldPassword,
          password: values.newPassword,
        }
      });

      if (res?.status === 'fail') {
        throw new Error(res.msg || '密码修改失败');
      }

      message.success('密码修改成功');
      form.resetFields();
      onSuccess?.();
      onCancel();
    } catch (error: any) {
      console.error('密码修改失败:', error);
      message.error(error.message || '密码修改失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title="修改密码"
      open={visible}
      onCancel={onCancel}
      onOk={handleSubmit}
      confirmLoading={loading}
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="oldPassword"
          label="原密码"
          rules={[
            { required: true, message: '请输入原密码' },
            { min: 6, max: 20, message: '密码长度为6-20个字符' },
          ]}
        >
          <Input.Password placeholder="请输入原密码" />
        </Form.Item>

        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, max: 20, message: '密码长度为6-20个字符' },
          ]}
        >
          <Input.Password placeholder="请输入新密码" />
        </Form.Item>

        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          rules={[
            { required: true, message: '请再次输入新密码' },
          ]}
        >
          <Input.Password placeholder="请再次输入新密码" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;