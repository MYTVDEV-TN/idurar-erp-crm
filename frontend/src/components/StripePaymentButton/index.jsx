import { useState } from 'react';
import { Button, Modal, Form, Input, Select, message } from 'antd';
import { CreditCardOutlined, LockOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

export default function StripePaymentButton({ amount, onSuccess, buttonText, disabled = false }) {
  const translate = useLanguage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = async (values) => {
    setLoading(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setIsModalVisible(false);
      form.resetFields();
      
      message.success(translate('Payment processed successfully'));
      
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess({
          id: 'pm_' + Math.random().toString(36).substr(2, 9),
          amount: amount,
          status: 'succeeded',
          created: new Date().getTime(),
        });
      }
    }, 2000);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);
  
  return (
    <>
      <Button 
        type="primary" 
        icon={<CreditCardOutlined />} 
        onClick={showModal}
        disabled={disabled}
      >
        {buttonText || translate('Pay with Card')}
      </Button>
      
      <Modal
        title={translate('Credit Card Payment')}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="cardholderName"
            label={translate('Cardholder Name')}
            rules={[{ required: true, message: translate('Please enter cardholder name') }]}
          >
            <Input placeholder={translate('Name on card')} />
          </Form.Item>
          
          <Form.Item
            name="cardNumber"
            label={translate('Card Number')}
            rules={[
              { required: true, message: translate('Please enter card number') },
              { pattern: /^\d{16}$/, message: translate('Card number must be 16 digits') }
            ]}
          >
            <Input 
              placeholder="4242 4242 4242 4242" 
              maxLength={16}
              prefix={<CreditCardOutlined />}
            />
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0 }}>
            <Form.Item
              name="expiryMonth"
              label={translate('Expiry Date')}
              rules={[{ required: true, message: translate('Required') }]}
              style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}
            >
              <Select placeholder={translate('Month')}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                  <Select.Option key={month} value={month.toString().padStart(2, '0')}>
                    {month.toString().padStart(2, '0')}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
            <span style={{ display: 'inline-block', width: '24px', textAlign: 'center' }}>/</span>
            <Form.Item
              name="expiryYear"
              rules={[{ required: true, message: translate('Required') }]}
              style={{ display: 'inline-block', width: 'calc(50% - 12px)' }}
            >
              <Select placeholder={translate('Year')}>
                {years.map(year => (
                  <Select.Option key={year} value={year.toString()}>
                    {year}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          </Form.Item>
          
          <Form.Item
            name="cvc"
            label={translate('CVC')}
            rules={[
              { required: true, message: translate('Please enter CVC') },
              { pattern: /^\d{3,4}$/, message: translate('CVC must be 3 or 4 digits') }
            ]}
          >
            <Input 
              placeholder="123" 
              maxLength={4} 
              prefix={<LockOutlined />}
              style={{ width: '100px' }}
            />
          </Form.Item>
          
          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
            >
              {translate('Pay')} {amount ? moneyFormatter({ amount }) : ''}
            </Button>
          </Form.Item>
          
          <div style={{ textAlign: 'center' }}>
            <LockOutlined /> {translate('Secure payment processed by Stripe')}
          </div>
        </Form>
      </Modal>
    </>
  );
}

function moneyFormatter({ amount }) {
  return `$${parseFloat(amount).toFixed(2)}`;
}