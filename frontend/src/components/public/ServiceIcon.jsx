import Icon from '../common/Icon';

/** Maps a service's stored icon key to the inline icon set (with fallback). */
export default function ServiceIcon({ icon, size = 26 }) {
  return <Icon name={icon || 'sparkle'} size={size} />;
}
