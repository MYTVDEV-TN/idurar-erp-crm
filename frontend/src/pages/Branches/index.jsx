import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Select, Tag, Space, message, Tabs, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BranchesOutlined, SwapOutlined, DollarOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import { useNavigate } from 'react-router-dom';

export default function Branches() {
  const translate = useLanguage();
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTransferModalVisible, setIsTransferModalVisible] = useState(false);
  const [editingBranch, setEditingBranch] = useState(null);
  const [form] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  // Fetch branches on component mount
  useEffect(() => {
    // Simulated branches data - in a real app, this would come from an API
    const mockBranches = [
      { 
        id: 'main', 
        name: 'Main Branch', 
        address: 'Main Street 123', 
        manager: 'John Doe',
        phone: '+1 234 567 890',
        email: 'main@example.com',
        currency: 'USD',
        status: 'active',
        created: '2022-01-01T00:00:00Z',
        stats: {
          revenue: 125000,
          expenses: 75000,
          profit: 50000,
          customers: 120,
          invoices: 350,
          payments: 310
        }
      },
      { 
        id: 'branch1', 
        name: 'Downtown Branch', 
        address: '5th Avenue', 
        manager: 'Jane Smith',
        phone: '+1 234 567 891',
        email: 'downtown@example.com',
        currency: 'USD',
        status: 'active',
        created: '2022-03-15T00:00:00Z',
        stats: {
          revenue: 95000,
          expenses: 60000,
          profit: 35000,
          customers: 85,
          invoices: 220,
          payments: 195
        }
      },
      { 
        id: 'branch2', 
        name: 'East Side Branch', 
        address: 'East Road 45', 
        manager: 'Robert Johnson',
        phone: '+1 234 567 892',
        email: 'eastside@example.com',
        currency: 'EUR',
        status: 'active',
        created: '2022-06-20T00:00:00Z',
        stats: {
          revenue: 78000,
          expenses: 45000,
          profit: 33000,
          customers: 65,
          invoices: 180,
          payments: 165
        }
      },
    ];
    
    setBranches(mockBranches);
  }, []);

  const showModal = (branch = null) => {
    setEditingBranch(branch);
    if (branch) {
      form.setFieldsValue({
        name: branch.name,
        address: branch.address,
        manager: branch.manager,
        phone: branch.phone,
        email: branch.email,
        currency: branch.currency,
        status: branch.status,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const showTransferModal = () => {
    transferForm.resetFields();
    setIsTransferModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingBranch(null);
    form.resetFields();
  };

  const handleTransferCancel = () => {
    setIsTransferModalVisible(false);
    transferForm.resetFields();
  };

  const handleSubmit = (values) => {
    setLoading(true);
    
    // Simulate API call to create/update branch
    setTimeout(() => {
      if (editingBranch) {
        // Update existing branch
        const updatedBranches = branches.map(branch => 
          branch.id === editingBranch.id ? { ...branch, ...values } : branch
        );
        setBranches(updatedBranches);
        message.success(`${translate('Branch')} ${values.name} ${translate('updated successfully')}`);
      } else {
        // Create new branch
        const newBranch = {
          id: `branch${branches.length + 1}`,
          ...values,
          created: new Date().toISOString(),
          stats: {
            revenue: 0,
            expenses: 0,
            profit: 0,
            customers: 0,
            invoices: 0,
            payments: 0
          }
        };
        setBranches([...branches, newBranch]);
        message.success(`${translate('Branch')} ${values.name} ${translate('created successfully')}`);
      }
      
      setLoading(false);
      setIsModalVisible(false);
      setEditingBranch(null);
      form.resetFields();
    }, 1000);
  };

  const handleTransferSubmit = (values) => {
    setLoading(true);
    
    // Simulate API call to transfer inventory
    setTimeout(() => {
      message.success(translate('Inventory transfer initiated successfully'));
      setLoading(false);
      setIsTransferModalVisible(false);
      transferForm.resetFields();
    }, 1000);
  };

  const handleDelete = (branch) => {
    Modal.confirm({
      title: translate('Delete Branch'),
      content: `${translate('Are you sure you want to delete')} ${branch.name}?`,
      okText: translate('Delete'),
      okType: 'danger',
      cancelText: translate('Cancel'),
      onOk() {
        // Simulate API call to delete branch
        const updatedBranches = branches.filter(b => b.id !== branch.id);
        setBranches(updatedBranches);
        message.success(`${translate('Branch')} ${branch.name} ${translate('deleted successfully')}`);
      },
    });
  };

  const columns = [
    {
      title: translate('Branch Name'),
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: translate('Address'),
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: translate('Manager'),
      dataIndex: 'manager',
      key: 'manager',
    },
    {
      title: translate('Currency'),
      dataIndex: 'currency',
      key: 'currency',
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
      title: translate('Actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => showModal(record)}
          >
            {translate('Edit')}
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={() => handleDelete(record)}
            disabled={record.id === 'main'} // Prevent deleting the main branch
          >
            {translate('Delete')}
          </Button>
        </Space>
      ),
    },
  ];

  const items = [
    {
      key: '1',
      label: translate('Branches'),
      children: (
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => showModal()}
            >
              {translate('Add New Branch')}
            </Button>
            <Button 
              icon={<SwapOutlined />} 
              onClick={showTransferModal}
            >
              {translate('Transfer Inventory')}
            </Button>
          </div>
          
          <Table 
            columns={columns} 
            dataSource={branches} 
            rowKey="id"
            pagination={false}
          />
        </>
      ),
    },
    {
      key: '2',
      label: translate('Branch Performance'),
      children: (
        <div>
          <Row gutter={[16, 16]}>
            {branches.map(branch => (
              <Col xs={24} sm={12} md={8} key={branch.id}>
                <Card 
                  title={branch.name}
                  extra={<Button type="link" onClick={() => navigate(`/branch/${branch.id}`)}>{translate('Details')}</Button>}
                >
                  <Statistic
                    title={translate('Revenue')}
                    value={branch.stats.revenue}
                    prefix={<DollarOutlined />}
                    style={{ marginBottom: 16 }}
                  />
                  <Statistic
                    title={translate('Profit')}
                    value={branch.stats.profit}
                    prefix={<DollarOutlined />}
                    valueStyle={{ color: branch.stats.profit > 0 ? '#3f8600' : '#cf1322' }}
                    style={{ marginBottom: 16 }}
                  />
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title={translate('Customers')}
                        value={branch.stats.customers}
                        prefix={<UserOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title={translate('Invoices')}
                        value={branch.stats.invoices}
                        prefix={<FileTextOutlined />}
                      />
                    </Col>
                  </Row>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Tabs 
        defaultActiveKey="1" 
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
      />
      
      <Modal
        title={editingBranch ? `${translate('Edit Branch')}: ${editingBranch.name}` : translate('Add New Branch')}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            status: 'active',
            currency: 'USD',
          }}
        >
          <Form.Item
            name="name"
            label={translate('Branch Name')}
            rules={[{ required: true, message: translate('Please enter branch name') }]}
          >
            <Input placeholder={translate('Enter branch name')} />
          </Form.Item>
          
          <Form.Item
            name="address"
            label={translate('Branch Address')}
            rules={[{ required: true, message: translate('Please enter branch address') }]}
          >
            <Input placeholder={translate('Enter branch address')} />
          </Form.Item>
          
          <Form.Item
            name="manager"
            label={translate('Branch Manager')}
            rules={[{ required: true, message: translate('Please enter branch manager') }]}
          >
            <Input placeholder={translate('Enter branch manager name')} />
          </Form.Item>
          
          <Form.Item
            name="phone"
            label={translate('Branch Phone')}
            rules={[{ required: true, message: translate('Please enter branch phone') }]}
          >
            <Input placeholder={translate('Enter branch phone')} />
          </Form.Item>
          
          <Form.Item
            name="email"
            label={translate('Branch Email')}
            rules={[
              { required: true, message: translate('Please enter branch email') },
              { type: 'email', message: translate('Please enter a valid email') }
            ]}
          >
            <Input placeholder={translate('Enter branch email')} />
          </Form.Item>
          
          <Form.Item
            name="currency"
            label={translate('Branch Currency')}
            rules={[{ required: true, message: translate('Please select branch currency') }]}
          >
            <Select>
              <Select.Option value="USD">USD - US Dollar</Select.Option>
              <Select.Option value="EUR">EUR - Euro</Select.Option>
              <Select.Option value="GBP">GBP - British Pound</Select.Option>
              <Select.Option value="JPY">JPY - Japanese Yen</Select.Option>
              <Select.Option value="CAD">CAD - Canadian Dollar</Select.Option>
              <Select.Option value="AUD">AUD - Australian Dollar</Select.Option>
              <Select.Option value="CNY">CNY - Chinese Yuan</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="status"
            label={translate('Branch Status')}
            rules={[{ required: true, message: translate('Please select branch status') }]}
          >
            <Select>
              <Select.Option value="active">{translate('Active')}</Select.Option>
              <Select.Option value="inactive">{translate('Inactive')}</Select.Option>
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {editingBranch ? translate('Update Branch') : translate('Create Branch')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      
      <Modal
        title={translate('Transfer Inventory Between Branches')}
        open={isTransferModalVisible}
        onCancel={handleTransferCancel}
        footer={null}
      >
        <Form
          form={transferForm}
          layout="vertical"
          onFinish={handleTransferSubmit}
        >
          <Form.Item
            name="fromBranch"
            label={translate('From Branch')}
            rules={[{ required: true, message: translate('Please select source branch') }]}
          >
            <Select placeholder={translate('Select source branch')}>
              {branches.map(branch => (
                <Select.Option key={branch.id} value={branch.id}>{branch.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="toBranch"
            label={translate('To Branch')}
            rules={[{ required: true, message: translate('Please select destination branch') }]}
          >
            <Select placeholder={translate('Select destination branch')}>
              {branches.map(branch => (
                <Select.Option key={branch.id} value={branch.id}>{branch.name}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item
            name="items"
            label={translate('Items to Transfer')}
            rules={[{ required: true, message: translate('Please select at least one item') }]}
          >
            <Select 
              mode="multiple" 
              placeholder={translate('Select items to transfer')}
              options={[
                { value: 'item1', label: 'Product A' },
                { value: 'item2', label: 'Product B' },
                { value: 'item3', label: 'Product C' },
                { value: 'item4', label: 'Product D' },
              ]}
            />
          </Form.Item>
          
          <Form.Item
            name="quantities"
            label={translate('Quantities')}
            rules={[{ required: true, message: translate('Please enter quantities') }]}
          >
            <Input placeholder={translate('e.g. 5,10,15,20')} />
          </Form.Item>
          
          <Form.Item
            name="reason"
            label={translate('Transfer Reason')}
            rules={[{ required: true, message: translate('Please enter transfer reason') }]}
          >
            <Input.TextArea placeholder={translate('Enter reason for transfer')} rows={3} />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {translate('Initiate Transfer')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}