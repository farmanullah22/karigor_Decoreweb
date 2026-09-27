import Icon from '../common/Icon';
import { useSettings } from '../../context/SettingsContext';
import { whatsappLink } from '../../utils/format';

/**
 * Floating WhatsApp button - the primary "chat with us" action.
 * Rendered only when a WhatsApp number is configured in company settings.
 */
export default function WhatsAppFloat() {
  const { settings } = useSettings();

  const href = whatsappLink(
    settings.whatsapp || settings.phone,
    `Hello ${settings.companyName || 'Karigor Decore'}, I would like to know more about your products and services.`
  );

  if (!href) return null;

  return (
    <a
      className="whatsapp-float"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat on WhatsApp"
    >
      <Icon name="whatsapp" size={28} />
    </a>
  );
}
