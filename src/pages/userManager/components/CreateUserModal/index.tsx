import React from 'react';
import { Modal, Form, message } from 'antd';
import { ProForm, ProFormText, ProFormSelect } from '@ant-design/pro-components';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import { addUser } from '@/services/user/api';
import { UserStatus, userStatusConfig }from '../../data.d';

interface CreateUserModalProps {
  visible: boolean;
  onCancel: () => void;
  onSuccess: () => void;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  visible,
  onCancel,
  onSuccess,
}) => {
  const [form] = Form.useForm();

  // 密码确认校验
  const checkConfirm = (_, value) => {
    const password = form.getFieldValue('password');
    if (value && value !== password) {
      return Promise.reject(new Error('两次输入的密码不一致!'));
    }
    return Promise.resolve();
  };

  // 提交表单
  const handleSubmit = async (values: any) => {
    try {
      const response = await addUser(values);
      if (response.status === 'success') {
        message.success('用户创建成功');
        form.resetFields();
        onSuccess();
        onCancel();
      } else {
        message.error(response.msg || '用户创建失败');
      }
    } catch (error) {
      console.error('创建用户失败:', error);
      message.error('创建用户失败');
    }
  };

  return (
    <Modal
      title="新建用户"
      open={visible}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      footer={null}
      destroyOnClose
      width={500}
    >
      <ProForm
        form={form}
        onFinish={handleSubmit}
        submitter={{
          searchConfig: {
            submitText: '创建',
            resetText: '重置',
          },
          resetButtonProps: {
            onClick: () => form.resetFields(),
          },
        }}
      >
        <ProFormText
          name="username"
          label="用户名"
          fieldProps={{
            size: 'large',
            prefix: <UserOutlined />,
          }}
          placeholder="请输入用户名"
          rules={[
            {
              required: true,
              message: '请输入用户名!',
            },
          ]}
        />

        <ProFormText.Password
          name="password"
          label="密码"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />,
          }}
          placeholder="请输入密码"
          rules={[
            {
              required: true,
              message: '请输入密码!',
            },
          ]}
        />

        <ProFormText.Password
          name="passwordAgain"
          label="确认密码"
          fieldProps={{
            size: 'large',
            prefix: <LockOutlined />,
          }}
          placeholder="请再次输入密码"
          rules={[
            {
              required: true,
              message: '请确认密码!',
            },
            {
              validator: checkConfirm,
            },
          ]}
        />

        <ProFormText
          name="name"
          label="姓名"
          fieldProps={{
            size: 'large',
          }}
          placeholder="请输入用户姓名"
        />

        <ProFormText
          name="phone"
          label="手机号"
          fieldProps={{
            size: 'large',
            prefix: <PhoneOutlined />,
          }}
          placeholder="请输入手机号"
          rules={[
            {
              pattern: /^1[3-9]\d{9}$/,
              message: '请输入正确的手机号格式',
            },
          ]}
        />

        <ProFormSelect
          name="role"
          label="用户角色"
          width="md"
          initialValue='USER'
          options={[
            { label: '普通用户', value: 'USER' },
            { label: '管理员', value: 'ADMIN' },
          ]}
          rules={[{ required: true, message: '请选择用户角色' }]}
        />

        <ProFormSelect
          name="status"
          label="用户状态"
          width="md"
          initialValue={UserStatus.ACTIVE}
          options={userStatusConfig
            .filter(item => item.value !== UserStatus.DELETED) // 新建用户通常不直接设置为注销
            .map(item => ({
              label: item.label,
              value: item.value,
            }))
          }
          rules={[{ required: true, message: '请选择用户状态' }]}
        />
      </ProForm>
    </Modal>
  );
};

export default CreateUserModal;