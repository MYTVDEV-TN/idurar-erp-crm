import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, Checkbox, Tag, Space, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

export default function UserRoles() {
  const translate = useLanguage();
  const [roles, setRoles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Define available permissions
  const availablePermissions = [
    { id: 'dashboard_view', name: translate('View Dashboard'), module: 'dashboard' },
    { id: 'invoice_create', name: translate('Create Invoice'), module: 'invoice' },
    { id: 'invoice_view', name: translate('View Invoice'), module: 'invoice' },
    { id: 'invoice_edit', name: translate('Edit Invoice'), module: 'invoice' },
    { id: 'invoice_delete', name: translate('Delete Invoice'), module: 'invoice' },
    { id: 'quote_create', name: translate('Create Quote'), module: 'quote' },
    { id: 'quote_view', name: translate('View Quote'), module: 'quote' },
    { id: 'quote_edit', name: translate('Edit Quote'), module: 'quote' },
    { id: 'quote_delete', name: translate('Delete Quote'), module: 'quote' },
    { id: 'payment_create', name: translate('Create Payment'), module: 'payment' },
    { id: 'payment_view', name: translate('View Payment'), module: 'payment' },
    { id: 'payment_edit', name: translate('Edit Payment'), module: 'payment' },
    { id: 'payment_delete', name: translate('Delete Payment'), module: 'payment' },
    { id: 'client_create', name: translate('Create Client'), module: 'client' },
    { id: 'client_view', name: translate('View Client'), module: 'client' },
    { id: 'client_edit', name: translate('Edit Client'), module: 'client' },
    { id: 'client_delete', name: translate('Delete Client'), module: 'client' },
    { id: 'settings_view', name: translate('View Settings'), module: 'settings' },
    { id: 'settings_edit', name: translate('Edit Settings'), module: 'settings' },
    { id: 'admin_create', name: translate('Create Admin'), module: 'admin' },
    { id: 'admin_view', name: translate('View Admin'), module: 'admin' },
    { id: 'admin_edit', name: translate('Edit Admin'), module: 'admin' },
    { id: 'admin_delete', name: translate('Delete Admin'), module: 'admin' },
  ];

  // Group permissions by module
  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.module]) {
      acc[permission.module] = [];
    }
    acc[permission.module].push(permission);
    return acc;
  }, {});

  // Fetch roles on component mount
  useEffect(() => {
    // Simulated roles data - in a real app, this would come from an API
    const mockRoles = [
      {
        id: '1',
        name: 'Administrator',
        description: 'Full access to all features',
        permissions: availablePermissions.map(p => p.id),
        status: 'active',
      },
      {
        id: '2',
        name: 'Manager',
        description: 'Can manage most features except admin settings',
        permissions: availablePermissions
          .filter(p => !p.id.startsWith('admin_') && p.id !== 'settings_edit')
          .map(p => p.id),
        status: 'active',
      },
      {
        id: '3',
        name: 'Sales Representative',
        description: 'Can create and view sales documents',
        permissions: [
          'dashboard_view',
          'invoice_create', 'invoice_view',
          'quote_create', 'quote_view',
          'client_view',
          'payment_view',
        ],
        status: 'active',
      },
      {
        id: '4',
        name: 'Accountant',
        description: 'Can manage financial records',
        permissions: [
          'dashboard_view',
          'invoice_view', 'invoice_edit',
          'quote_view',
          'payment_create', 'payment_view', 'payment_edit',
          'client_view',
        ],
        status: 'active',
      },
      {
        id: '5',
        name: 'Read Only',
        description: 'Can only view data',
        permissions: [
          'dashboard_view',
          'invoice_view',
          'quote_view',
          'payment_view',
          'client_view',
        ],
        status: 'active',
      },
    ];
    
    setRoles(mockRoles);
  }, []);

  const showModal = (role = null) => {
    setEditingRole(role);
    if (role) {
      form.setFieldsValue({
        name: role.name,
        description: role.description,
        permissions: role.permissions,
      });
    } else {
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingRole(null);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    setLoading(true);
    
    // Simulate API call to create/update role
    setTimeout(() => {
      if (editingRole) {
        // Update existing role
        const updatedRoles = roles.map(role => 
          role.id === editingRole.id ? { ...role, ...values } : role
        );
        setRoles(updatedRoles);
        message.success(`${translate('Role')} ${values.name} ${translate('updated successfully')}`);
      } else {
        // Create new role
        const newRole = {
          id: `${roles.length + 1}`,
          ...values,
          status: 'active',
        };
        setRoles([...roles, newRole]);
        message.success(`${translate('Role')} ${values.name} ${translate('created successfully')}`);
      }
      
      setLoading(false);
      setIsModalVisible(false);
      setEditingRole(null);
      form.resetFields();
    }, 1000);
  };

  const handleDelete = (role) => {
    Modal.confirm({
      title: translate('Delete Role'),
      content: `${translate('Are you sure you want to delete')} ${role.name}?`,
      okText: translate('Delete'),
      okType: 'danger',
      cancelText: translate('Cancel'),
      onOk() {
        // Simulate API call to delete role
        const updatedRoles = roles.filter(r => r.id !== role.id);
        setRoles(updatedRoles);
        message.success(`${translate('Role')} ${role.name} ${translate('deleted successfully')}`);
      },
    });
  };

  const columns = [
    {
      title: translate('Role Name'),
      dataIndex: 'name',
      key: 'name',
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: translate('Permissions'),
      dataIndex: 'permissions',
      key: 'permissions',
      render: (permissions) => (
        <span>
          {permissions.length} {translate('permissions')}
        </span>
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
            disabled={record.name === 'Administrator'} // Prevent deleting the Administrator role
          >
            {translate('Delete')}
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>{translate('User Roles')}</h2>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={() => showModal()}
        >
          {translate('Add New Role')}
        </Button>
      </div>
      
      <Table 
        columns={columns} 
        dataSource={roles} 
        rowKey="id"
        pagination={false}
      />
      
      <Modal
        title={editingRole ? `${translate('Edit Role')}: ${editingRole.name}` : translate('Add New Role')}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label={translate('Role Name')}
            rules={[{ required: true, message: translate('Please enter role name') }]}
          >
            <Input placeholder={translate('Enter role name')} />
          </Form.Item>
          
          <Form.Item
            name="description"
            label={translate('Description')}
            rules={[{ required: true, message: translate('Please enter role description') }]}
          >
            <Input.TextArea placeholder={translate('Enter role description')} rows={3} />
          </Form.Item>
          
          <Form.Item
            name="permissions"
            label={translate('Permissions')}
            rules={[{ required: true, message: translate('Please select at least one permission') }]}
          >
            <div style={{ maxHeight: '300px', overflowY: 'auto', padding: '10px', border: '1px solid #d9d9d9', borderRadius: '2px' }}>
              {Object.entries(groupedPermissions).map(([module, permissions]) => (
                <div key={module} style={{ marginBottom: '15px' }}>
                  <h3 style={{ marginBottom: '8px', textTransform: 'capitalize' }}>{translate(module)}</h3>
                  <Checkbox.Group style={{ width: '100%' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {permissions.map(permission => (
                        <Checkbox key={permission.id} value={permission.id}>
                          {permission.name}
                        </Checkbox>
                      ))}
                    </div>
                  </Checkbox.Group>
                </div>
              ))}
            </div>
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {editingRole ? translate('Update Role') : translate('Create Role')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}