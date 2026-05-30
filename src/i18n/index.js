import ru from './ru';
import en from './en';
const translations = { ru, en };

export const getTranslation = (key, lang = 'ru') => {
  return translations[lang]?.[key] || translations.ru[key] || key;
};