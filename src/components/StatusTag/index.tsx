import React, { useState } from 'react';
import { Tag, Popover, message, Modal  } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import type { StatusConfig } from '@/pages/userManager/data.d';

interface StatusTagProps {
  status: string;
  configs: StatusConfig[];
  onChange?: (newStatus: string) => Promise<void>;
  disabled?: boolean;
}

const StatusTag: React.FC<StatusTagProps> = ({ 
  status, 
  configs, 
  onChange, 
  disabled = false 
}) => {
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);
  const [popoverVisible, setPopoverVisible] = useState(false);
  
  const currentConfig = configs.find(c => c.value === status);
  
  const handleStatusChange = async (newStatus: string) => {
    if (!onChange) return;
    
    try {
      // 二次确认
      const defaultMessage = `确定要将状态修改为"${configs.find(c => c.value === newStatus)?.label}"吗?`;
      
      Modal.confirm({
        title: '操作确认',
        icon: <QuestionCircleOutlined />,
        content: defaultMessage,
        okText: '确认',
        cancelText: '取消',
        onOk: async () => {
          setLoading(true);
          await onChange(newStatus);
          setPopoverVisible(false);
          message.success('状态更新成功');
          setLoading(false);
        }
      })
    } catch (error) {
      console.error('状态更新失败:', error);
      message.error('状态更新失败');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div style={{ padding: 8 }}>
      {configs.map(config => (
        <Tag
          key={config.value}
          color={config.color}
          style={{ 
            cursor: 'pointer', 
            marginBottom: 4,
            opacity: config.value === status ? 0.5 : 1
          }}
          onClick={() => handleStatusChange(config.value)}
        >
          {config.label}
        </Tag>
      ))}
    </div>
  );

  return (
    <Popover 
      content={content} 
      trigger="click"
      open={!disabled && visible}
      onOpenChange={setVisible}
      placement="bottom"
    >
      <Tag
        color={currentConfig?.color || 'default'}
        style={{ 
          cursor: disabled ? 'default' : 'pointer',
          borderStyle: disabled ? 'solid' : 'dashed',
          opacity: loading ? 0.7 : 1
        }}
      >
        {loading ? '处理中...' : currentConfig?.label || status}
      </Tag>
    </Popover>
  );
};

export default StatusTag;