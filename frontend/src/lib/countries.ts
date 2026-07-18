// Shared country + dial-code data used by signup, the phone-number field, and
// (via LANGUAGES) the translator. `iso` is the lowercase ISO-3166 alpha-2 code,
// which also drives the real flag image from flagcdn.com.
export interface Country {
  name: string;
  iso: string; // lowercase alpha-2, e.g. "us"
  dial: string; // e.g. "+1"
}

export const COUNTRIES: Country[] = [
  { name: 'United States', iso: 'us', dial: '+1' },
  { name: 'United Kingdom', iso: 'gb', dial: '+44' },
  { name: 'Canada', iso: 'ca', dial: '+1' },
  { name: 'Australia', iso: 'au', dial: '+61' },
  { name: 'Germany', iso: 'de', dial: '+49' },
  { name: 'France', iso: 'fr', dial: '+33' },
  { name: 'Spain', iso: 'es', dial: '+34' },
  { name: 'Italy', iso: 'it', dial: '+39' },
  { name: 'Netherlands', iso: 'nl', dial: '+31' },
  { name: 'Switzerland', iso: 'ch', dial: '+41' },
  { name: 'Sweden', iso: 'se', dial: '+46' },
  { name: 'Norway', iso: 'no', dial: '+47' },
  { name: 'Denmark', iso: 'dk', dial: '+45' },
  { name: 'Ireland', iso: 'ie', dial: '+353' },
  { name: 'Portugal', iso: 'pt', dial: '+351' },
  { name: 'Belgium', iso: 'be', dial: '+32' },
  { name: 'Austria', iso: 'at', dial: '+43' },
  { name: 'Poland', iso: 'pl', dial: '+48' },
  { name: 'Singapore', iso: 'sg', dial: '+65' },
  { name: 'Japan', iso: 'jp', dial: '+81' },
  { name: 'South Korea', iso: 'kr', dial: '+82' },
  { name: 'China', iso: 'cn', dial: '+86' },
  { name: 'Hong Kong', iso: 'hk', dial: '+852' },
  { name: 'India', iso: 'in', dial: '+91' },
  { name: 'United Arab Emirates', iso: 'ae', dial: '+971' },
  { name: 'Saudi Arabia', iso: 'sa', dial: '+966' },
  { name: 'Qatar', iso: 'qa', dial: '+974' },
  { name: 'Israel', iso: 'il', dial: '+972' },
  { name: 'Turkey', iso: 'tr', dial: '+90' },
  { name: 'South Africa', iso: 'za', dial: '+27' },
  { name: 'Nigeria', iso: 'ng', dial: '+234' },
  { name: 'Ghana', iso: 'gh', dial: '+233' },
  { name: 'Kenya', iso: 'ke', dial: '+254' },
  { name: 'Egypt', iso: 'eg', dial: '+20' },
  { name: 'Brazil', iso: 'br', dial: '+55' },
  { name: 'Mexico', iso: 'mx', dial: '+52' },
  { name: 'Argentina', iso: 'ar', dial: '+54' },
  { name: 'Chile', iso: 'cl', dial: '+56' },
  { name: 'Colombia', iso: 'co', dial: '+57' },
  { name: 'New Zealand', iso: 'nz', dial: '+64' },
  { name: 'Malaysia', iso: 'my', dial: '+60' },
  { name: 'Indonesia', iso: 'id', dial: '+62' },
  { name: 'Philippines', iso: 'ph', dial: '+63' },
  { name: 'Thailand', iso: 'th', dial: '+66' },
  { name: 'Vietnam', iso: 'vn', dial: '+84' },
  { name: 'Russia', iso: 'ru', dial: '+7' },
  { name: 'Ukraine', iso: 'ua', dial: '+380' },
  { name: 'Greece', iso: 'gr', dial: '+30' },
  { name: 'Czech Republic', iso: 'cz', dial: '+420' },
  { name: 'Romania', iso: 'ro', dial: '+40' },
  { name: 'Hungary', iso: 'hu', dial: '+36' },
  { name: 'Finland', iso: 'fi', dial: '+358' },
  { name: 'Pakistan', iso: 'pk', dial: '+92' },
  { name: 'Bangladesh', iso: 'bd', dial: '+880' },
  { name: 'Other', iso: 'un', dial: '+' },
];

/** flagcdn URL for a country by ISO alpha-2. Real raster flags (render on Windows). */
export function flagUrl(iso: string, width: 20 | 40 | 80 = 40): string {
  const w = width === 20 ? 'w20' : width === 80 ? 'w80' : 'w40';
  return `https://flagcdn.com/${w}/${(iso || 'un').toLowerCase()}.png`;
}

// Languages for the on-site translator. `iso` picks the flag; `code` is the
// Google Translate language code.
export interface Language {
  code: string;
  name: string;
  iso: string;
}

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', iso: 'us' },
  { code: 'es', name: 'Español', iso: 'es' },
  { code: 'fr', name: 'Français', iso: 'fr' },
  { code: 'de', name: 'Deutsch', iso: 'de' },
  { code: 'it', name: 'Italiano', iso: 'it' },
  { code: 'pt', name: 'Português', iso: 'br' },
  { code: 'nl', name: 'Nederlands', iso: 'nl' },
  { code: 'ru', name: 'Русский', iso: 'ru' },
  { code: 'zh-CN', name: '中文 (简体)', iso: 'cn' },
  { code: 'zh-TW', name: '中文 (繁體)', iso: 'tw' },
  { code: 'ja', name: '日本語', iso: 'jp' },
  { code: 'ko', name: '한국어', iso: 'kr' },
  { code: 'ar', name: 'العربية', iso: 'sa' },
  { code: 'hi', name: 'हिन्दी', iso: 'in' },
  { code: 'tr', name: 'Türkçe', iso: 'tr' },
  { code: 'pl', name: 'Polski', iso: 'pl' },
  { code: 'vi', name: 'Tiếng Việt', iso: 'vn' },
  { code: 'th', name: 'ไทย', iso: 'th' },
  { code: 'id', name: 'Bahasa Indonesia', iso: 'id' },
  { code: 'uk', name: 'Українська', iso: 'ua' },
];
