import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Typography, Divider, Alert } from 'antd';
import { PlusOutlined, CopyOutlined, EyeOutlined, EyeInvisibleOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import dayjs from 'dayjs';

const { Title, Paragraph, Text } = Typography;

export default function ApiKeys() {
  const translate = useLanguage();
  const [apiKeys, setApiKeys] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isKeyVisible, setIsKeyVisible] = useState({});
  const [newKeyData, setNewKeyData] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Fetch API keys on component mount
  useEffect(() => {
    // Simulated API keys data - in a real app, this would come from an API
    const mockApiKeys = [
      {
        id: 'key_1',
        name: 'Production API Key',
        key: 'pk_live_51NxYz2CJh8aK7rTlDJhV9L5T8Tz7Yk2Jh8aK7rTlD',
        secret: '••••••••••••••••••••••••••••••',
        permissions: ['read', 'write'],
        status: 'active',
        created: '2023-06-15T10:30:00Z',
        expires: null,
        lastUsed: '2023-10-20T14:45:00Z',
      },
      {
        id: 'key_2',
        name: 'Test API Key',
        key: 'pk_test_51NxYz2CJh8aK7rTlDJhV9L5T8Tz7Yk2Jh8aK7rTlD',
        secret: '••••••••••••••••••••••••••••••',
        permissions: ['read'],
        status: 'active',
        created: '2023-07-22T08:15:00Z',
        expires: '2024-07-22T08:15:00Z',
        lastUsed: null,
      },
    ];
    
    setApiKeys(mockApiKeys);
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
    setNewKeyData(null);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    setLoading(true);
    
    // Simulate API call to create a new API key
    setTimeout(() => {
      // Generate mock API key and secret
      const apiKey = `pk_${values.type}_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
      const apiSecret = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      const newKey = {
        id: `key_${apiKeys.length + 1}`,
        name: values.name,
        key: apiKey,
        secret: apiSecret,
        permissions: values.permissions,
        status: 'active',
        created: new Date().toISOString(),
        expires: values.neverExpires ? null : dayjs().add(1, 'year').toISOString(),
        lastUsed: null,
      };
      
      setApiKeys([...apiKeys, { ...newKey, secret: '••••••••••••••••••••••••••••••' }]);
      setNewKeyData(newKey);
      setLoading(false);
    }, 1000);
  };

  const handleDelete = (keyId) => {
    Modal.confirm({
      title: translate('Revoke API Key'),
      content: translate('Are you sure you want to revoke this API key? This action cannot be undone.'),
      okText: translate('Revoke'),
      okType: 'danger',
      cancelText: translate('Cancel'),
      onOk() {
        // Simulate API call to delete the key
        const updatedKeys = apiKeys.filter(key => key.id !== keyId);
        setApiKeys(updatedKeys);
        message.success(translate('API key revoked successfully'));
      },
    });
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    message.success(translate('Copied to clipboard'));
  };

  const toggleKeyVisibility = (keyId) => {
    setIsKeyVisible({
      ...isKeyVisible,
      [keyId]: !isKeyVisible[keyId]
    });
  };

  const columns = [
    {
      title: translate('Name'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: translate('API Key'),
      dataIndex: 'key',
      key: 'key',
      render: (text, record) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text ellipsis style={{ maxWidth: 300 }}>{text}</Text>
          <Button 
            type="text" 
            icon={<CopyOutlined />} 
            onClick={() => handleCopy(text)}
            style={{ marginLeft: 8 }}
          />
        </div>
      ),
    },
    {
      title: translate('Permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => (
        <>
          {permissions.map(perm => (
            <Tag color={perm === 'read' ? 'blue' : 'green'} key={perm}>
              {perm === 'read' ? translate('Read') : translate('Write')}
            </Tag>
          ))}
        </>
      ),
    },
    {
      title: translate('Status'),
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? translate('Active') : translate('Inactive')}
        </Tag>
      ),
    },
    {
      title: translate('Created'),
      dataIndex: 'created',
      key: 'created',
      render: (date) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: translate('Expires'),
      dataIndex: 'expires',
      key: 'expires',
      render: (date) => date ? dayjs(date).format('YYYY-MM-DD HH:mm') : translate('Never'),
    },
    {
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record.id)}
          >
            {translate('Revoke')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={2}>{translate('API Keys')}</Title>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={showModal}
        >
          {translate('Generate API Key')}
        </Button>
      </div>
      
      <Alert
        message={translate('API Access')}
        description={
          <div>
            <p>{translate('API keys allow external applications to authenticate with our service. They are used to track and control how the API is being used and prevent unauthorized access.')}</p>
            <p>{translate('Keep your API keys secure and do not share them in publicly accessible areas such as GitHub, client-side code, etc.')}</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 20 }}
      />
      
      <Table 
        columns={columns} 
        dataSource={apiKeys} 
        rowKey="id"
        pagination={false}
      />
      
      <Modal
        title={translate('Generate New API Key')}
        open={isModalVisible && !newKeyData}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            type: 'test',
            permissions: ['read'],
            neverExpires: true,
          }}
        >
          <Form.Item
            name="name"
            label={translate('API Key Name')}
            rules={[{ required: true, message: translate('Please enter a name for this API key') }]}
          >
            <Input placeholder={translate('e.g. Production API Key')} />
          </Form.Item>
          
          <Form.Item
            name="type"
            label={translate('API Key Type')}
            rules={[{ required: true }]}
          >
            <Select>
              <Select.Option value="test">{translate('Test')}</Select.Option>
              <Select.Option value="live">{translate('Live')}</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="permissions"
            label={translate('Permissions')}
            rules={[{ required: true, message: translate('Please select at least one permission') }]}
          >
            <Select mode="multiple">
              <Select.Option value="read">{translate('Read (GET)')}</Select.Option>
              <Select.Option value="write">{translate('Write (POST, PUT, DELETE)')}</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="neverExpires"
            valuePropName="checked"
          >
            <Select>
              <Select.Option value={true}>{translate('Never Expires')}</Select.Option>
              <Select.Option value={false}>{translate('Expires after 1 year')}</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {translate('Generate API Key')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title={translate('API Key Generated')}
        open={!!newKeyData}
        onCancel={() => {
          setNewKeyData(null);
          setIsModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button 
            key="done" 
            type="primary" 
            onClick={() => {
              setNewKeyData(null);
              setIsModalVisible(false);
              form.resetFields();
            }}
          >
            {translate('Done')}
          </Button>
        ]}
      >
        {newKeyData && (
          <>
            <Alert
              message={translate('Important')}
              description={translate('This is the only time your API secret will be displayed. Please save it somewhere secure as you won\'t be able to see it again.')}
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
            
            <div style={{ marginBottom: 16 }}>
              <Text strong>{translate('API Key')}:</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                <Input 
                  value={newKeyData.key} 
                  readOnly 
                />
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={() => handleCopy(newKeyData.key)}
                  style={{ marginLeft: 8 }}
                />
              </div>
            </div>
            
            <div>
              <Text strong>{translate('API Secret')}:</Text>
              <div style={{ display: 'flex', alignItems: 'center', marginTop: 8 }}>
                <Input.Password 
                  value={newKeyData.secret} 
                  readOnly 
                  visibilityToggle={{ 
                    visible: isKeyVisible[newKeyData.id] || false, 
                    onVisibleChange: () => toggleKeyVisibility(newKeyData.id)
                  }}
                />
                <Button 
                  icon={<CopyOutlined />} 
                  onClick={() => handleCopy(newKeyData.secret)}
                  style={{ marginLeft: 8 }}
                />
              </div>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}