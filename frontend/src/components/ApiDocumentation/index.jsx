import { useState } from 'react';
import { Tabs, Typography, Card, Table, Divider, Tag, Space, Button, Input, Select } from 'antd';
import { CopyOutlined, CodeOutlined } from '@ant-design/icons';
import useLanguage from '@/locale/useLanguage';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/dist/esm/styles/hljs';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

export default function ApiDocumentation() {
  const translate = useLanguage();
  const [selectedEndpoint, setSelectedEndpoint] = useState('listInvoices');
  
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    message.success(translate('Copied to clipboard'));
  };
  
  const endpoints = [
    {
      key: 'listInvoices',
      name: translate('List Invoices'),
      method: 'GET',
      path: '/api/v1/invoice/list',
      description: translate('Retrieve a list of invoices'),
      parameters: [
        { name: 'page', type: 'number', description: translate('Page number'), required: false, default: '1' },
        { name: 'items', type: 'number', description: translate('Items per page'), required: false, default: '10' },
        { name: 'sortBy', type: 'string', description: translate('Field to sort by'), required: false },
        { name: 'sortValue', type: 'number', description: translate('Sort direction (1 for ascending, -1 for descending)'), required: false, default: '-1' },
      ],
      responseFields: [
        { name: 'success', type: 'boolean', description: translate('Indicates if the request was successful') },
        { name: 'result', type: 'array', description: translate('Array of invoice objects') },
        { name: 'pagination', type: 'object', description: translate('Pagination information') },
        { name: 'message', type: 'string', description: translate('Response message') },
      ],
    },
    {
      key: 'getInvoice',
      name: translate('Get Invoice'),
      method: 'GET',
      path: '/api/v1/invoice/read/:id',
      description: translate('Retrieve a specific invoice by ID'),
      parameters: [
        { name: 'id', type: 'string', description: translate('Invoice ID'), required: true },
      ],
      responseFields: [
        { name: 'success', type: 'boolean', description: translate('Indicates if the request was successful') },
        { name: 'result', type: 'object', description: translate('Invoice object') },
        { name: 'message', type: 'string', description: translate('Response message') },
      ],
    },
    {
      key: 'createInvoice',
      name: translate('Create Invoice'),
      method: 'POST',
      path: '/api/v1/invoice/create',
      description: translate('Create a new invoice'),
      parameters: [
        { name: 'client', type: 'string', description: translate('Client ID'), required: true },
        { name: 'number', type: 'number', description: translate('Invoice number'), required: true },
        { name: 'year', type: 'number', description: translate('Invoice year'), required: true },
        { name: 'status', type: 'string', description: translate('Invoice status'), required: true },
        { name: 'date', type: 'date', description: translate('Invoice date'), required: true },
        { name: 'expiredDate', type: 'date', description: translate('Invoice expiry date'), required: true },
        { name: 'items', type: 'array', description: translate('Invoice items'), required: true },
      ],
      responseFields: [
        { name: 'success', type: 'boolean', description: translate('Indicates if the request was successful') },
        { name: 'result', type: 'object', description: translate('Created invoice object') },
        { name: 'message', type: 'string', description: translate('Response message') },
      ],
    },
    {
      key: 'updateInvoice',
      name: translate('Update Invoice'),
      method: 'PATCH',
      path: '/api/v1/invoice/update/:id',
      description: translate('Update an existing invoice'),
      parameters: [
        { name: 'id', type: 'string', description: translate('Invoice ID'), required: true },
        { name: 'client', type: 'string', description: translate('Client ID'), required: false },
        { name: 'number', type: 'number', description: translate('Invoice number'), required: false },
        { name: 'year', type: 'number', description: translate('Invoice year'), required: false },
        { name: 'status', type: 'string', description: translate('Invoice status'), required: false },
        { name: 'date', type: 'date', description: translate('Invoice date'), required: false },
        { name: 'expiredDate', type: 'date', description: translate('Invoice expiry date'), required: false },
        { name: 'items', type: 'array', description: translate('Invoice items'), required: false },
      ],
      responseFields: [
        { name: 'success', type: 'boolean', description: translate('Indicates if the request was successful') },
        { name: 'result', type: 'object', description: translate('Updated invoice object') },
        { name: 'message', type: 'string', description: translate('Response message') },
      ],
    },
    {
      key: 'deleteInvoice',
      name: translate('Delete Invoice'),
      method: 'DELETE',
      path: '/api/v1/invoice/delete/:id',
      description: translate('Delete an invoice'),
      parameters: [
        { name: 'id', type: 'string', description: translate('Invoice ID'), required: true },
      ],
      responseFields: [
        { name: 'success', type: 'boolean', description: translate('Indicates if the request was successful') },
        { name: 'result', type: 'object', description: translate('Deleted invoice object') },
        { name: 'message', type: 'string', description: translate('Response message') },
      ],
    },
  ];
  
  const selectedEndpointData = endpoints.find(e => e.key === selectedEndpoint);
  
  const parameterColumns = [
    {
      title: translate('Parameter'),
      dataIndex: 'name',
      key: 'name',
      render: text => <Text code>{text}</Text>,
    },
    {
      title: translate('Type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: translate('Required'),
      dataIndex: 'required',
      key: 'required',
      render: required => required ? <Tag color="red">Required</Tag> : <Tag color="green">Optional</Tag>,
    },
    {
      title: translate('Default'),
      dataIndex: 'default',
      key: 'default',
      render: text => text ? <Text code>{text}</Text> : '-',
    },
  ];
  
  const responseColumns = [
    {
      title: translate('Field'),
      dataIndex: 'name',
      key: 'name',
      render: text => <Text code>{text}</Text>,
    },
    {
      title: translate('Type'),
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: translate('Description'),
      dataIndex: 'description',
      key: 'description',
    },
  ];
  
  const getExampleRequest = (endpoint) => {
    if (endpoint.method === 'GET') {
      return `curl -X ${endpoint.method} \\
  "${endpoint.path.replace(':id', '60a1b2c3d4e5f6g7h8i9j0k')}${endpoint.parameters.some(p => !p.required && p.name !== 'id') ? '?page=1&items=10' : ''}" \\
  -H "x-api-key: YOUR_API_KEY"`;
    } else if (endpoint.method === 'POST' || endpoint.method === 'PATCH') {
      const bodyParams = endpoint.parameters.filter(p => p.name !== 'id');
      const bodyObject = bodyParams.reduce((acc, param) => {
        if (param.type === 'string') acc[param.name] = 'example';
        else if (param.type === 'number') acc[param.name] = 1;
        else if (param.type === 'date') acc[param.name] = '2023-01-01T00:00:00.000Z';
        else if (param.type === 'array') acc[param.name] = [];
        else acc[param.name] = null;
        return acc;
      }, {});
      
      return `curl -X ${endpoint.method} \\
  "${endpoint.path.replace(':id', '60a1b2c3d4e5f6g7h8i9j0k')}" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(bodyObject, null, 2)}'`;
    } else if (endpoint.method === 'DELETE') {
      return `curl -X ${endpoint.method} \\
  "${endpoint.path.replace(':id', '60a1b2c3d4e5f6g7h8i9j0k')}" \\
  -H "x-api-key: YOUR_API_KEY"`;
    }
  };
  
  const getExampleResponse = (endpoint) => {
    if (endpoint.key === 'listInvoices') {
      return `{
  "success": true,
  "result": [
    {
      "_id": "60a1b2c3d4e5f6g7h8i9j0k",
      "number": 1001,
      "year": 2023,
      "client": {
        "_id": "60a1b2c3d4e5f6g7h8i9j0l",
        "name": "Example Client"
      },
      "date": "2023-01-01T00:00:00.000Z",
      "expiredDate": "2023-02-01T00:00:00.000Z",
      "status": "draft",
      "paymentStatus": "unpaid",
      "total": 1000,
      "subTotal": 900,
      "taxTotal": 100,
      "credit": 0
    }
  ],
  "pagination": {
    "page": 1,
    "pages": 1,
    "count": 1
  },
  "message": "Successfully found all documents"
}`;
    } else if (endpoint.key === 'getInvoice') {
      return `{
  "success": true,
  "result": {
    "_id": "60a1b2c3d4e5f6g7h8i9j0k",
    "number": 1001,
    "year": 2023,
    "client": {
      "_id": "60a1b2c3d4e5f6g7h8i9j0l",
      "name": "Example Client",
      "email": "client@example.com",
      "phone": "+1234567890",
      "address": "123 Example St"
    },
    "date": "2023-01-01T00:00:00.000Z",
    "expiredDate": "2023-02-01T00:00:00.000Z",
    "status": "draft",
    "paymentStatus": "unpaid",
    "items": [
      {
        "itemName": "Product A",
        "description": "Description of Product A",
        "quantity": 2,
        "price": 450,
        "total": 900
      }
    ],
    "subTotal": 900,
    "taxRate": 10,
    "taxTotal": 90,
    "total": 990,
    "credit": 0,
    "notes": "Example notes"
  },
  "message": "we found this document"
}`;
    } else if (endpoint.key === 'createInvoice' || endpoint.key === 'updateInvoice') {
      return `{
  "success": true,
  "result": {
    "_id": "60a1b2c3d4e5f6g7h8i9j0k",
    "number": 1001,
    "year": 2023,
    "client": "60a1b2c3d4e5f6g7h8i9j0l",
    "date": "2023-01-01T00:00:00.000Z",
    "expiredDate": "2023-02-01T00:00:00.000Z",
    "status": "draft",
    "paymentStatus": "unpaid",
    "items": [
      {
        "itemName": "Product A",
        "description": "Description of Product A",
        "quantity": 2,
        "price": 450,
        "total": 900
      }
    ],
    "subTotal": 900,
    "taxRate": 10,
    "taxTotal": 90,
    "total": 990,
    "credit": 0,
    "notes": "Example notes",
    "pdf": "invoice-60a1b2c3d4e5f6g7h8i9j0k.pdf"
  },
  "message": "${endpoint.key === 'createInvoice' ? 'Invoice created successfully' : 'we update this document'}"
}`;
    } else if (endpoint.key === 'deleteInvoice') {
      return `{
  "success": true,
  "result": {
    "_id": "60a1b2c3d4e5f6g7h8i9j0k",
    "removed": true
  },
  "message": "Successfully Deleted the document"
}`;
    }
  };
  
  const items = [
    {
      key: '1',
      label: translate('API Overview'),
      children: (
        <div>
          <Title level={3}>{translate('API Overview')}</Title>
          <Paragraph>
            {translate('The IDURAR API provides programmatic access to your ERP and CRM data. You can use this API to build integrations, automate workflows, and extend the functionality of your IDURAR instance.')}
          </Paragraph>
          
          <Title level={4}>{translate('Base URL')}</Title>
          <Paragraph>
            <Text code>https://your-domain.com/api/v1</Text>
          </Paragraph>
          
          <Title level={4}>{translate('Authentication')}</Title>
          <Paragraph>
            {translate('All API requests require authentication using an API key. You can generate API keys in the API Keys section of your IDURAR dashboard.')}
          </Paragraph>
          <Paragraph>
            {translate('Include your API key in the request header:')}
            <br />
            <Text code>x-api-key: YOUR_API_KEY</Text>
          </Paragraph>
          
          <Title level={4}>{translate('Rate Limits')}</Title>
          <Paragraph>
            {translate('The API is rate limited to prevent abuse. The current limits are:')}
          </Paragraph>
          <ul>
            <li>{translate('100 requests per minute for read operations')}</li>
            <li>{translate('30 requests per minute for write operations')}</li>
          </ul>
          
          <Title level={4}>{translate('Response Format')}</Title>
          <Paragraph>
            {translate('All API responses are returned in JSON format with the following structure:')}
          </Paragraph>
          <SyntaxHighlighter language="json" style={docco}>
{`{
  "success": true|false,
  "result": Object|Array,
  "message": "Response message",
  "pagination": {
    "page": 1,
    "pages": 10,
    "count": 100
  }
}`}
          </SyntaxHighlighter>
        </div>
      ),
    },
    {
      key: '2',
      label: translate('Endpoints'),
      children: (
        <div>
          <div style={{ display: 'flex', marginBottom: 20 }}>
            <div style={{ width: 250, marginRight: 20 }}>
              <Card title={translate('API Endpoints')} size="small">
                {endpoints.map(endpoint => (
                  <div 
                    key={endpoint.key} 
                    style={{ 
                      padding: '8px 16px', 
                      cursor: 'pointer',
                      backgroundColor: selectedEndpoint === endpoint.key ? '#f0f0f0' : 'transparent',
                      borderLeft: selectedEndpoint === endpoint.key ? '3px solid #1890ff' : '3px solid transparent',
                    }}
                    onClick={() => setSelectedEndpoint(endpoint.key)}
                  >
                    <Tag color={
                      endpoint.method === 'GET' ? 'blue' : 
                      endpoint.method === 'POST' ? 'green' :
                      endpoint.method === 'PATCH' ? 'orange' :
                      endpoint.method === 'DELETE' ? 'red' : 'default'
                    }>
                      {endpoint.method}
                    </Tag>
                    <Text>{endpoint.name}</Text>
                  </div>
                ))}
              </Card>
            </div>
            
            <div style={{ flex: 1 }}>
              {selectedEndpointData && (
                <Card title={
                  <Space>
                    <Tag color={
                      selectedEndpointData.method === 'GET' ? 'blue' : 
                      selectedEndpointData.method === 'POST' ? 'green' :
                      selectedEndpointData.method === 'PATCH' ? 'orange' :
                      selectedEndpointData.method === 'DELETE' ? 'red' : 'default'
                    }>
                      {selectedEndpointData.method}
                    </Tag>
                    <Text>{selectedEndpointData.path}</Text>
                  </Space>
                }>
                  <Paragraph>{selectedEndpointData.description}</Paragraph>
                  
                  <Divider orientation="left">{translate('Parameters')}</Divider>
                  <Table 
                    dataSource={selectedEndpointData.parameters} 
                    columns={parameterColumns} 
                    pagination={false}
                    size="small"
                    rowKey="name"
                  />
                  
                  <Divider orientation="left">{translate('Response')}</Divider>
                  <Table 
                    dataSource={selectedEndpointData.responseFields} 
                    columns={responseColumns} 
                    pagination={false}
                    size="small"
                    rowKey="name"
                  />
                  
                  <Divider orientation="left">{translate('Example Request')}</Divider>
                  <div style={{ position: 'relative' }}>
                    <SyntaxHighlighter language="bash" style={docco}>
                      {getExampleRequest(selectedEndpointData)}
                    </SyntaxHighlighter>
                    <Button 
                      icon={<CopyOutlined />} 
                      size="small"
                      onClick={() => copyToClipboard(getExampleRequest(selectedEndpointData))}
                      style={{ position: 'absolute', top: 10, right: 10 }}
                    />
                  </div>
                  
                  <Divider orientation="left">{translate('Example Response')}</Divider>
                  <div style={{ position: 'relative' }}>
                    <SyntaxHighlighter language="json" style={docco}>
                      {getExampleResponse(selectedEndpointData)}
                    </SyntaxHighlighter>
                    <Button 
                      icon={<CopyOutlined />} 
                      size="small"
                      onClick={() => copyToClipboard(getExampleResponse(selectedEndpointData))}
                      style={{ position: 'absolute', top: 10, right: 10 }}
                    />
                  </div>
                </Card>
              )}
            </div>
          </div>
        </div>
      ),
    },
    {
      key: '3',
      label: translate('Error Codes'),
      children: (
        <div>
          <Title level={3}>{translate('Error Codes')}</Title>
          <Paragraph>
            {translate('When an API request fails, the response will include an error message and an appropriate HTTP status code.')}
          </Paragraph>
          
          <Table 
            dataSource={[
              { status: 400, code: 'BAD_REQUEST', description: translate('The request was invalid or cannot be served. The exact error is specified in the response body.') },
              { status: 401, code: 'UNAUTHORIZED', description: translate('Authentication credentials were missing or incorrect.') },
              { status: 403, code: 'FORBIDDEN', description: translate('The request is understood, but it has been refused or access is not allowed.') },
              { status: 404, code: 'NOT_FOUND', description: translate('The requested resource could not be found.') },
              { status: 409, code: 'CONFLICT', description: translate('The request could not be completed due to a conflict with the current state of the resource.') },
              { status: 422, code: 'UNPROCESSABLE_ENTITY', description: translate('The request was well-formed but was unable to be followed due to semantic errors.') },
              { status: 429, code: 'TOO_MANY_REQUESTS', description: translate('The user has sent too many requests in a given amount of time.') },
              { status: 500, code: 'INTERNAL_SERVER_ERROR', description: translate('Something went wrong on the server.') },
              { status: 503, code: 'SERVICE_UNAVAILABLE', description: translate('The server is currently unable to handle the request due to a temporary overload or maintenance.') },
            ]} 
            columns={[
              {
                title: translate('Status Code'),
                dataIndex: 'status',
                key: 'status',
                render: status => <Tag color="red">{status}</Tag>,
              },
              {
                title: translate('Error Code'),
                dataIndex: 'code',
                key: 'code',
                render: code => <Text code>{code}</Text>,
              },
              {
                title: translate('Description'),
                dataIndex: 'description',
                key: 'description',
              },
            ]}
            pagination={false}
            rowKey="status"
          />
          
          <Divider />
          
          <Title level={4}>{translate('Error Response Format')}</Title>
          <SyntaxHighlighter language="json" style={docco}>
{`{
  "success": false,
  "result": null,
  "message": "Error message describing what went wrong",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  }
}`}
          </SyntaxHighlighter>
        </div>
      ),
    },
    {
      key: '4',
      label: translate('SDKs & Libraries'),
      children: (
        <div>
          <Title level={3}>{translate('SDKs & Libraries')}</Title>
          <Paragraph>
            {translate('We provide official client libraries for several programming languages to make it easier to integrate with our API.')}
          </Paragraph>
          
          <Card title={translate('JavaScript/Node.js')} style={{ marginBottom: 16 }}>
            <Paragraph>
              {translate('Install the package:')}
            </Paragraph>
            <SyntaxHighlighter language="bash" style={docco}>
              npm install idurar-api-client
            </SyntaxHighlighter>
            
            <Paragraph style={{ marginTop: 16 }}>
              {translate('Example usage:')}
            </Paragraph>
            <SyntaxHighlighter language="javascript" style={docco}>
{`const IdurarApi = require('idurar-api-client');

const api = new IdurarApi({
  apiKey: 'YOUR_API_KEY',
  baseUrl: 'https://your-domain.com/api/v1'
});

// List invoices
api.invoices.list({ page: 1, items: 10 })
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });

// Create an invoice
api.invoices.create({
  client: '60a1b2c3d4e5f6g7h8i9j0l',
  number: 1001,
  year: 2023,
  date: '2023-01-01',
  expiredDate: '2023-02-01',
  status: 'draft',
  items: [
    {
      itemName: 'Product A',
      description: 'Description of Product A',
      quantity: 2,
      price: 450
    }
  ]
})
  .then(response => {
    console.log(response.data);
  })
  .catch(error => {
    console.error(error);
  });`}
            </SyntaxHighlighter>
          </Card>
          
          <Card title={translate('Python')} style={{ marginBottom: 16 }}>
            <Paragraph>
              {translate('Install the package:')}
            </Paragraph>
            <SyntaxHighlighter language="bash" style={docco}>
              pip install idurar-api-client
            </SyntaxHighlighter>
            
            <Paragraph style={{ marginTop: 16 }}>
              {translate('Example usage:')}
            </Paragraph>
            <SyntaxHighlighter language="python" style={docco}>
{`from idurar_api_client import IdurarApi

api = IdurarApi(
    api_key='YOUR_API_KEY',
    base_url='https://your-domain.com/api/v1'
)

# List invoices
response = api.invoices.list(page=1, items=10)
print(response.data)

# Create an invoice
response = api.invoices.create({
    'client': '60a1b2c3d4e5f6g7h8i9j0l',
    'number': 1001,
    'year': 2023,
    'date': '2023-01-01',
    'expiredDate': '2023-02-01',
    'status': 'draft',
    'items': [
        {
            'itemName': 'Product A',
            'description': 'Description of Product A',
            'quantity': 2,
            'price': 450
        }
    ]
})
print(response.data)`}
            </SyntaxHighlighter>
          </Card>
          
          <Card title={translate('PHP')} style={{ marginBottom: 16 }}>
            <Paragraph>
              {translate('Install the package:')}
            </Paragraph>
            <SyntaxHighlighter language="bash" style={docco}>
              composer require idurar/api-client
            </SyntaxHighlighter>
            
            <Paragraph style={{ marginTop: 16 }}>
              {translate('Example usage:')}
            </Paragraph>
            <SyntaxHighlighter language="php" style={docco}>
{`<?php
require_once 'vendor/autoload.php';

$api = new Idurar\\ApiClient\\IdurarApi([
    'api_key' => 'YOUR_API_KEY',
    'base_url' => 'https://your-domain.com/api/v1'
]);

// List invoices
$response = $api->invoices->list(['page' => 1, 'items' => 10]);
print_r($response->data);

// Create an invoice
$response = $api->invoices->create([
    'client' => '60a1b2c3d4e5f6g7h8i9j0l',
    'number' => 1001,
    'year' => 2023,
    'date' => '2023-01-01',
    'expiredDate' => '2023-02-01',
    'status' => 'draft',
    'items' => [
        [
            'itemName' => 'Product A',
            'description' => 'Description of Product A',
            'quantity' => 2,
            'price' => 450
        ]
    ]
]);
print_r($response->data);`}
            </SyntaxHighlighter>
          </Card>
        </div>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>{translate('API Documentation')}</Title>
      <Paragraph>
        {translate('Welcome to the IDURAR API documentation. This guide will help you integrate with our API to access and manage your ERP and CRM data programmatically.')}
      </Paragraph>
      
      <Tabs defaultActiveKey="1" items={items} />
    </div>
  );
}