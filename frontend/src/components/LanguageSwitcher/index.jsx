import { useState, useEffect } from 'react';
import { Select } from 'antd';
import { GlobalOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { settingsAction } from '@/redux/settings/actions';
import { selectAppSettings } from '@/redux/settings/selectors';
import useLanguage from '@/locale/useLanguage';

export default function LanguageSwitcher() {
  const dispatch = useDispatch();
  const translate = useLanguage();
  const appSettings = useSelector(selectAppSettings);
  const [language, setLanguage] = useState(appSettings?.idurar_app_language || 'en_us');

  useEffect(() => {
    if (appSettings?.idurar_app_language) {
      setLanguage(appSettings.idurar_app_language);
    }
  }, [appSettings]);

  const handleLanguageChange = (value) => {
    setLanguage(value);
    
    // Update language in settings
    const settings = [
      { settingKey: 'idurar_app_language', settingValue: value }
    ];
    
    dispatch(settingsAction.updateMany({ 
      entity: 'setting', 
      jsonData: { settings } 
    }));
  };

  return (
    <Select
      value={language}
      onChange={handleLanguageChange}
      style={{ width: 150, marginRight: '10px' }}
      options={[
        { value: 'en_us', label: <><GlobalOutlined /> English</> },
        { value: 'ar_eg', label: <><GlobalOutlined /> العربية</> },
        { value: 'fr_fr', label: <><GlobalOutlined /> Français</> },
      ]}
    />
  );
}