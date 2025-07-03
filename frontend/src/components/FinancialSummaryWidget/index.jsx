import { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Progress, Spin, Typography, Divider } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, DollarOutlined } from '@ant-design/icons';
import { request } from '@/request';
import { useMoney } from '@/settings';
import useLanguage from '@/locale/useLanguage';

const { Title } = Typography;

export default function FinancialSummaryWidget() {
  const translate = useLanguage();
  const { moneyFormatter } = useMoney();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    totalRevenue: 0,
    totalExpenses: 0,
    totalProfit: 0,
    revenueGrowth: 0,
    expenseGrowth: 0,
    profitGrowth: 0,
    topClients: [],
    invoiceStatus: {
      paid: 0,
      unpaid: 0,
      overdue: 0
    }
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch invoice summary
        const invoiceData = await request.summary({ entity: 'invoice' });
        
        // Fetch payment summary
        const paymentData = await request.summary({ entity: 'payment' });
        
        // Calculate financial metrics
        const totalRevenue = paymentData.result?.total || 0;
        const totalExpenses = 0; // In a real app, you would fetch this from expenses
        const totalProfit = totalRevenue - totalExpenses;
        
        // Get invoice status percentages
        const invoiceStatus = {};
        if (invoiceData.result?.performance) {
          invoiceData.result.performance.forEach(item => {
            invoiceStatus[item.status] = item.percentage || 0;
          });
        }
        
        setData({
          totalRevenue,
          totalExpenses,
          totalProfit,
          revenueGrowth: 15, // Example value - would be calculated from historical data
          expenseGrowth: 5,  // Example value
          profitGrowth: 20,  // Example value
          invoiceStatus: {
            paid: invoiceStatus.paid || 0,
            unpaid: invoiceStatus.unpaid || 0,
            overdue: invoiceStatus.overdue || 0
          }
        });
      } catch (error) {
        console.error("Error fetching financial data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <Card title={translate("Financial Summary")} bordered={false}>
      {loading ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      ) : (
        <>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Statistic
                title={translate("Total Revenue")}
                value={data.totalRevenue}
                precision={2}
                valueStyle={{ color: '#3f8600' }}
                prefix={<DollarOutlined />}
                suffix={data.revenueGrowth > 0 ? 
                  <span style={{ fontSize: '0.8em', marginLeft: '8px' }}>
                    <ArrowUpOutlined /> {data.revenueGrowth}%
                  </span> : 
                  <span style={{ fontSize: '0.8em', marginLeft: '8px', color: '#cf1322' }}>
                    <ArrowDownOutlined /> {Math.abs(data.revenueGrowth)}%
                  </span>
                }
                formatter={(value) => moneyFormatter({ amount: value })}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title={translate("Total Expenses")}
                value={data.totalExpenses}
                precision={2}
                valueStyle={{ color: '#cf1322' }}
                prefix={<DollarOutlined />}
                suffix={data.expenseGrowth > 0 ? 
                  <span style={{ fontSize: '0.8em', marginLeft: '8px', color: '#cf1322' }}>
                    <ArrowUpOutlined /> {data.expenseGrowth}%
                  </span> : 
                  <span style={{ fontSize: '0.8em', marginLeft: '8px', color: '#3f8600' }}>
                    <ArrowDownOutlined /> {Math.abs(data.expenseGrowth)}%
                  </span>
                }
                formatter={(value) => moneyFormatter({ amount: value })}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title={translate("Net Profit")}
                value={data.totalProfit}
                precision={2}
                valueStyle={{ color: data.totalProfit >= 0 ? '#3f8600' : '#cf1322' }}
                prefix={<DollarOutlined />}
                suffix={data.profitGrowth > 0 ? 
                  <span style={{ fontSize: '0.8em', marginLeft: '8px' }}>
                    <ArrowUpOutlined /> {data.profitGrowth}%
                  </span> : 
                  <span style={{ fontSize: '0.8em', marginLeft: '8px', color: '#cf1322' }}>
                    <ArrowDownOutlined /> {Math.abs(data.profitGrowth)}%
                  </span>
                }
                formatter={(value) => moneyFormatter({ amount: value })}
              />
            </Col>
          </Row>
          
          <Divider />
          
          <Title level={5}>{translate("Invoice Status")}</Title>
          <Row gutter={[16, 16]}>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Progress 
                  type="dashboard" 
                  percent={data.invoiceStatus.paid} 
                  status="success"
                  format={(percent) => `${percent}%`}
                />
                <div>{translate("Paid")}</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Progress 
                  type="dashboard" 
                  percent={data.invoiceStatus.unpaid} 
                  status="normal"
                  format={(percent) => `${percent}%`}
                />
                <div>{translate("Unpaid")}</div>
              </div>
            </Col>
            <Col span={8}>
              <div style={{ textAlign: 'center' }}>
                <Progress 
                  type="dashboard" 
                  percent={data.invoiceStatus.overdue} 
                  status="exception"
                  format={(percent) => `${percent}%`}
                />
                <div>{translate("Overdue")}</div>
              </div>
            </Col>
          </Row>
        </>
      )}
    </Card>
  );
}