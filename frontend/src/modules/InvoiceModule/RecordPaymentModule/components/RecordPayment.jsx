import { useState, useEffect } from 'react';
import { Form, Button, Tabs } from 'antd';

import { useSelector, useDispatch } from 'react-redux';
import { erp } from '@/redux/erp/actions';
import { selectRecordPaymentItem } from '@/redux/erp/selectors';
import useLanguage from '@/locale/useLanguage';

import Loading from '@/components/Loading';

import PaymentForm from '@/forms/PaymentForm';
import { useNavigate } from 'react-router-dom';
import calculate from '@/utils/calculate';
import StripePaymentButton from '@/components/StripePaymentButton';

export default function RecordPayment({ config }) {
  const navigate = useNavigate();
  const translate = useLanguage();
  let { entity } = config;

  const dispatch = useDispatch();

  const { isLoading, isSuccess, current: currentInvoice } = useSelector(selectRecordPaymentItem);

  const [form] = Form.useForm();

  const [maxAmount, setMaxAmount] = useState(0);
  useEffect(() => {
    if (currentInvoice) {
      const { credit, total, discount } = currentInvoice;
      setMaxAmount(calculate.sub(calculate.sub(total, discount), credit));
    }
  }, [currentInvoice]);
  useEffect(() => {
    if (isSuccess) {
      form.resetFields();
      dispatch(erp.resetAction({ actionType: 'recordPayment' }));
      dispatch(erp.list({ entity }));
      navigate(`/${entity}/`);
    }
  }, [isSuccess]);

  const onSubmit = (fieldsValue) => {
    if (currentInvoice) {
      const { _id: invoice } = currentInvoice;
      const client = currentInvoice.client && currentInvoice.client._id;
      fieldsValue = {
        ...fieldsValue,
        invoice,
        client,
      };
    }

    dispatch(
      erp.recordPayment({
        entity: 'payment',
        jsonData: fieldsValue,
      })
    );
  };
  
  const handleStripeSuccess = (paymentDetails) => {
    // Create payment record with Stripe payment details
    if (currentInvoice) {
      const { _id: invoice } = currentInvoice;
      const client = currentInvoice.client && currentInvoice.client._id;
      
      const paymentData = {
        invoice,
        client,
        amount: maxAmount, // Use the full remaining amount
        date: new Date().toISOString(),
        paymentMode: "stripe", // You would need to add this payment mode to your system
        ref: paymentDetails.id,
        description: "Payment processed via Stripe"
      };
      
      dispatch(
        erp.recordPayment({
          entity: 'payment',
          jsonData: paymentData,
        })
      );
    }
  };

  const items = [
    {
      key: 'manual',
      label: translate('Manual Payment'),
      children: (
        <Form form={form} layout="vertical" onFinish={onSubmit}>
          <PaymentForm maxAmount={maxAmount} />
          <Form.Item>
            <Button type="primary" htmlType="submit">
              {translate('Record Payment')}
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'stripe',
      label: translate('Credit Card'),
      children: (
        <div style={{ padding: '20px 0' }}>
          <p style={{ marginBottom: '20px' }}>
            {translate('Process payment securely using Stripe payment gateway')}
          </p>
          <StripePaymentButton 
            amount={maxAmount} 
            onSuccess={handleStripeSuccess}
            buttonText={translate('Pay Invoice')}
            disabled={maxAmount <= 0}
          />
          {maxAmount <= 0 && (
            <p style={{ marginTop: '10px', color: '#ff4d4f' }}>
              {translate('This invoice is already fully paid')}
            </p>
          )}
        </div>
      ),
    },
  ];

  return (
    <Loading isLoading={isLoading}>
      <Tabs defaultActiveKey="manual" items={items} />
    </Loading>
  );
}