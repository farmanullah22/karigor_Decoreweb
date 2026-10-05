import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { settingsApi } from '../services/endpoints';

const SettingsContext = createContext(null);

/**
 * Public company settings (name, contacts, social links, logo...).
 * Every piece of company information on the public site comes from here -
 * nothing is hard-coded in components.
 */

const FALLBACK_SETTINGS = {
  companyName: 'Decora',
  tagline: '',
  footerDescription: '',
  logo: '',
  favicon: '',
  phone: '',
  whatsapp: '',
  email: '',
  address: '',
  googleMapsUrl: '',
  businessHours: [],
  social: { facebook: '', instagram: '', tiktok: '', youtube: '', linkedin: '' },
  defaultMeta: { title: '', description: '' },
};

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(FALLBACK_SETTINGS);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await settingsApi.getPublic();
      if (data) {
        setSettings({ ...FALLBACK_SETTINGS, ...data });
        // Apply favicon when configured.
        if (data.favicon) {
          let link = document.querySelector("link[rel='icon']");
          if (!link) {
            link = document.createElement('link');
            link.rel = 'icon';
            document.head.appendChild(link);
          }
          link.href = data.favicon;
        }
      }
    } catch {
      // Keep fallback settings when the API is unreachable; the site still
      // renders with empty contact fields rather than crashing.
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(() => ({ settings, loaded, refresh, setSettings }), [settings, loaded, refresh]);

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider.');
  return context;
}
