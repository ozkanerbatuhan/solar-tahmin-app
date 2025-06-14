import { useRouter } from 'next/router';
import { Dropdown } from 'react-bootstrap';

const LanguageSwitcher = () => {
  const router = useRouter();
  const currentLocale = router.locale || 'tr';
  
  const changeLanguage = (lng) => {
    const { pathname, asPath, query } = router;
    router.push({ pathname, query }, asPath, { locale: lng });
  };
  
  return (
    <Dropdown>
      <Dropdown.Toggle variant="light" size="sm" id="dropdown-language">
        {currentLocale === 'tr' ? '🇹🇷 TR' : '🇬🇧 EN'}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.Item 
          active={currentLocale === 'tr'} 
          onClick={() => changeLanguage('tr')}
        >
          🇹🇷 Türkçe
        </Dropdown.Item>
        <Dropdown.Item 
          active={currentLocale === 'en'} 
          onClick={() => changeLanguage('en')}
        >
          🇬🇧 English
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default LanguageSwitcher; 