import { MMKV } from "react-native-mmkv";

export const SUPPORTED_LANGUAGES = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'id', label: 'Indonesia', flag: '🇮🇩' },
    { code: 'ja', label: '日本語', flag: '🇯🇵' },
    { code: 'ko', label: '한국어', flag: '🇰🇷' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
] as const;

export type LanguageCode = typeof SUPPORTED_LANGUAGES[number]['code'];

export const NAMESPACES = ['common', 'home', 'profile', 'outlet', 'history', 'login', 'register'] as const;
export type Namespace = typeof NAMESPACES[number];

export const DEFAULT_LANGUAGE: LanguageCode = 'en';
export const LANGUAGE_STORAGE_KEY = 'app_language';
export const LANGUAGE_STORAGE = new MMKV();
