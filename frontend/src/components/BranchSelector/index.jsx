import { useState, useEffect } from 'react';
import { Select, Button, Modal, Form, Input, Divider, message } from 'antd';
import { BranchesOutlined, PlusOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import useLanguage from '@/locale/useLanguage';
import { request } from '@/request';

export default function BranchSelector() {
  const translate = useLanguage();
  const [branches, setBranches] = useState([]);
  const [currentBranch, setCurrentBranch] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Fetch branches on component mount
  useEffect(() => {
    // Simulated branches data - in a real app, this would come from an API
    const mockBranches = [
      { id: 'main', name: 'Main Branch', address: 'Main Street 123', currency: 'USD' },
      { id: 'branch1', name: 'Downtown Branch', address: '5th Avenue', currency: 'USD' },
      { id: 'branch2', name: 'East Side Branch', address: 'East Road 45', currency: 'EUR' },
    ];
    
    setBranches(mockBranches);
    setCurrentBranch(mockBranches[0].id);
  }, []);

  const handleBranchChange = (value) => {
    if (value === 'add_new') {
      setIsModalVisible(true);
    } else {
      setCurrentBranch(value);
      // In a real app, you would dispatch an action to update the current branch in the store
      message.success(`${translate('Switched to')} ${branches.find(b => b.id === value)?.name}`);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleCreateBranch = (values) => {
    setLoading(true);
    
    // Simulate API call to create a new branch
    setTimeout(() => {
      const newBranch = {
        id: `branch${branches.length + 1}`,
        name: values.name,
        address: values.address,
        currency: values.currency || 'USD',
      };
      
      setBranches([...branches, newBranch]);
      setCurrentBranch(newBranch.id);
      setLoading(false);
      setIsModalVisible(false);
      form.resetFields();
      
      message.success(`${translate('Branch')} ${values.name} ${translate('created successfully')}`);
    }, 1000);
  };

  return (
    <>
      <Select
        value={currentBranch}
        onChange={handleBranchChange}
        style={{ width: 180, marginRight: '10px' }}
        dropdownRender={(menu) => (
          <>
            {menu}
            <Divider style={{ margin: '8px 0' }} />
            <Button 
              type="text" 
              icon={<PlusOutlined />} 
              block 
              onClick={() => setIsModalVisible(true)}
            >
              {translate('Add New Branch')}
            </Button>
          </>
        )}
        options={[
          ...branches.map(branch => ({ 
            value: branch.id, 
            label: <><BranchesOutlined /> {branch.name}</> 
          })),
        ]}
      />
      
      <Modal
        title={translate('Add New Branch')}
        open={isModalVisible}
        onCancel={handleModalCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateBranch}
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
            name="currency"
            label={translate('Branch Currency')}
            initialValue="USD"
          >
            <Select
              options={[
                { value: 'USD', label: 'USD - US Dollar' },
                { value: 'EUR', label: 'EUR - Euro' },
                { value: 'GBP', label: 'GBP - British Pound' },
                { value: 'JPY', label: 'JPY - Japanese Yen' },
                { value: 'CAD', label: 'CAD - Canadian Dollar' },
                { value: 'AUD', label: 'AUD - Australian Dollar' },
                { value: 'CNY', label: 'CNY - Chinese Yuan' },
              ]}
            />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {translate('Create Branch')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}