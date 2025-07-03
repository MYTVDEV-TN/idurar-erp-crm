import React from 'react';
import { Result, Button } from 'antd';
import useLanguage from '@/locale/useLanguage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("Caught error:", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <ErrorDisplay error={this.state.error} errorInfo={this.state.errorInfo} onReset={() => this.setState({ hasError: false })} />;
    }

    return this.props.children;
  }
}

function ErrorDisplay({ error, errorInfo, onReset }) {
  const translate = useLanguage();
  
  return (
    <Result
      status="error"
      title={translate("Something went wrong")}
      subTitle={error?.message || translate("An unexpected error occurred")}
      extra={[
        <Button type="primary" key="console" onClick={() => window.location.reload()}>
          {translate("Reload Page")}
        </Button>,
        <Button key="reset" onClick={onReset}>
          {translate("Try Again")}
        </Button>
      ]}
    >
      <div style={{ textAlign: 'left', marginTop: 20 }}>
        <details style={{ whiteSpace: 'pre-wrap' }}>
          <summary>{translate("Error Details")}</summary>
          <p>{error && error.toString()}</p>
          <p>{errorInfo && errorInfo.componentStack}</p>
        </details>
      </div>
    </Result>
  );
}

export default ErrorBoundary;