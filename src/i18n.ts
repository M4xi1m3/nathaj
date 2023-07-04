import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { en } from './translations/en';
import { fr } from './translations/fr';

const resources = {
    en,
    fr,
};

export const availableLanguages = Object.keys(resources);

i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    lowerCaseLng: true,
    interpolation: {
        escapeValue: false,
    },
});

export default i18n;
