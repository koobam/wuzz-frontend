import type common from '@locales/en/common.json';
import type history from '@locales/en/history.json';
import type home from '@locales/en/home.json';
import type login from '@locales/en/auth/login.json';
import type register from '@locales/en/auth/register.json';
import type outlet from '@locales/en/outlet.json';

declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof common;
      history: typeof history;
      login: typeof login;
      register: typeof register;
      home: typeof home;
      outlet: typeof outlet;
    };
  }
}