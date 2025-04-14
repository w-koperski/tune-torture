import i18n from 'sveltekit-i18n';
export const defaultLocale = 'en';
/** @type {import('sveltekit-i18n').Config} */
const config = ({
  loaders: [
    {
        locale: 'en',
        key: 'common',
        loader: async () => (
          await import('./locale/en/common.json')
        ).default,
      },
      {
        locale: 'pl',
        key: 'common',
        loader: async () => (
          await import('./locale/pl/common.json')
        ).default,
      },
    {
      locale: 'en',
      key: 'home',
      routes: ['/'], // you can use regexes as well!
      loader: async () => (
        await import('./locale/en/home.json')
      ).default,
    },
    {
      locale: 'en',
      key: 'roast',
      routes: ['/roast'],
      loader: async () => (
        await import('./locale/en/roast.json')
      ).default,
    },
    {
      locale: 'pl',
      key: 'home',
      routes: ['/'],
      loader: async () => (
        await import('./locale/pl/home.json')
      ).default,
    },
    {
      locale: 'pl',
      key: 'roast',
      routes: ['/roast'],
      loader: async () => (
        await import('./locale/pl/roast.json')
      ).default,
    },
  ],
});

export const { t, loading, locales, locale, translations, loadTranslations, addTranslations, setLocale, setRoute } = new i18n(config);
loading.subscribe(($loading) => $loading && console.log('Loading translations...'));