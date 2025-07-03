import { useState } from 'react';
import { Button, Modal, Form, Input, Rate, Radio, message } from 'antd';
import { CommentOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';

const { TextArea } = Input;

export default function FeedbackWidget() {
  const translate = useLanguage();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleSubmit = (values) => {
    setLoading(true);
    
    // Simulate sending feedback
    setTimeout(() => {
      console.log('Feedback submitted:', values);
      message.success(translate('Thank you for your feedback!'));
      setLoading(false);
      setIsModalVisible(false);
      form.resetFields();
    }, 1000);
  };

  return (
    <>
      <Button
        type="primary"
        shape="circle"
        icon={<CommentOutlined />}
        size="large"
        onClick={showModal}
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          zIndex: 1000,
          boxShadow: '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
        }}
      />
      
      <Modal
        title={translate('Send Feedback')}
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            feedbackType: 'general',
            satisfaction: 3,
          }}
        >
          <Form.Item
            name="feedbackType"
            label={translate('Feedback Type')}
            rules={[{ required: true, message: translate('Please select a feedback type') }]}
          >
            <Radio.Group>
              <Radio value="general">{translate('General')}</Radio>
              <Radio value="bug">{translate('Bug Report')}</Radio>
              <Radio value="feature">{translate('Feature Request')}</Radio>
              <Radio value="improvement">{translate('Improvement')}</Radio>
            </Radio.Group>
          </Form.Item>
          
          <Form.Item
            name="satisfaction"
            label={translate('How satisfied are you with our application?')}
          >
            <Rate allowHalf />
          </Form.Item>
          
          <Form.Item
            name="feedback"
            label={translate('Your Feedback')}
            rules={[{ required: true, message: translate('Please enter your feedback') }]}
          >
            <TextArea rows={4} placeholder={translate('Please share your thoughts...')} />
          </Form.Item>
          
          <Form.Item
            name="email"
            label={translate('Email (optional)')}
            rules={[{ type: 'email', message: translate('Please enter a valid email') }]}
          >
            <Input placeholder={translate('Your email for follow-up')} />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              {translate('Submit Feedback')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}