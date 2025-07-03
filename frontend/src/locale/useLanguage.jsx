import { useSelector } from 'react-redux';
import { selectAppSettings } from '@/redux/settings/selectors';
import translations from './translation/translation';

const getLabel = (lang, key) => {
  try {
    const lowerCaseKey = key
      .toLowerCase()
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/ /g, '_');

    if (lang[lowerCaseKey]) return lang[lowerCaseKey];

    // convert no found language label key to label
    const remove_underscore_fromKey = key.replace(/_/g, ' ').split(' ');

    const conversionOfAllFirstCharacterofEachWord = remove_underscore_fromKey.map(
      (word) => word[0].toUpperCase() + word.substring(1)
    );

    const label = conversionOfAllFirstCharacterofEachWord.join(' ');

    return label;
  } catch (error) {
    return 'No translate';
  }
};

const useLanguage = () => {
  const appSettings = useSelector(selectAppSettings);
  const selectedLang = appSettings?.idurar_app_language || 'en_us';
  
  // Set document direction based on language
  if (selectedLang === 'ar_eg') {
    document.body.setAttribute('dir', 'rtl');
  } else {
    document.body.setAttribute('dir', 'ltr');
  }
  
  const lang = translations[selectedLang] || translations.en_us;
  
  const translate = (value) => getLabel(lang, value);

  return translate;
};

export default useLanguage;