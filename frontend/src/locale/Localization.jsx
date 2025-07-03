import { ConfigProvider } from 'antd';
import { useSelector } from 'react-redux';
import { selectAppSettings } from '@/redux/settings/selectors';

export default function Localization({ children }) {
  const appSettings = useSelector(selectAppSettings);
  const direction = appSettings?.idurar_app_language === 'ar_eg' ? 'rtl' : 'ltr';
  
  return (
    <ConfigProvider
      direction={direction}
      theme={{
        token: {
          colorPrimary: '#339393',
          colorLink: '#1640D6',
          borderRadius: 0,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}