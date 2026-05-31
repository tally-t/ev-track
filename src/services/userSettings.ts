export interface UserSettings {
  name: string;
  carModel: string;
  currency: string;
  currencySymbol: string;
}

const KEY = 'ev_user_settings';

const DEFAULTS: UserSettings = {
  name: '',
  carModel: '',
  currency: 'THB',
  currencySymbol: '฿',
};

export const CURRENCIES = [
  { code: 'THB', symbol: '฿', label: 'Thai Baht' },
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'EUR', symbol: '€', label: 'Euro' },
  { code: 'GBP', symbol: '£', label: 'British Pound' },
  { code: 'JPY', symbol: '¥', label: 'Japanese Yen' },
  { code: 'SGD', symbol: 'S$', label: 'Singapore Dollar' },
  { code: 'AUD', symbol: 'A$', label: 'Australian Dollar' },
];

export function getSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

export function saveSettings(settings: Partial<UserSettings>) {
  const current = getSettings();
  localStorage.setItem(KEY, JSON.stringify({ ...current, ...settings }));
}
