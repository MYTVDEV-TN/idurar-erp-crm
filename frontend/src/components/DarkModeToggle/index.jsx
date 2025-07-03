import { useState, useEffect } from 'react';
import { Switch } from 'antd';
import { BulbOutlined, BulbFilled } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { settingsAction } from '@/redux/settings/actions';
import { selectAppSettings } from '@/redux/settings/selectors';

export default function DarkModeToggle() {
  const dispatch = useDispatch();
  const appSettings = useSelector(selectAppSettings);
  const [isDarkMode, setIsDarkMode] = useState(appSettings?.theme === 'dark');

  useEffect(() => {
    // Apply theme to body element
    if (isDarkMode) {
      document.body.classList.add('dark-theme');
    } else {
      document.body.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  const toggleTheme = (checked) => {
    setIsDarkMode(checked);
    const newTheme = checked ? 'dark' : 'light';
    
    // Update theme in settings
    const settings = [
      { settingKey: 'idurar_app_theme', settingValue: newTheme }
    ];
    
    dispatch(settingsAction.updateMany({ 
      entity: 'setting', 
      jsonData: { settings } 
    }));
  };

  return (
    <Switch
      checkedChildren={<BulbFilled />}
      unCheckedChildren={<BulbOutlined />}
      checked={isDarkMode}
      onChange={toggleTheme}
      style={{ marginRight: '10px' }}
    />
  );
}