/**
 * Shared constants: navigation, status maps, select options.
 */

export const PUBLIC_NAV_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/about' },
  { label: 'Products', to: '/products' },
  { label: 'Services', to: '/services' },
  { label: 'Projects', to: '/projects' },
  { label: 'Contact', to: '/contact' },
];

/** Status pill metadata for inquiries. */
export const INQUIRY_STATUSES = {
  new: { label: 'New', tone: 'info' },
  contacted: { label: 'Contacted', tone: 'accent' },
  in_progress: { label: 'In Progress', tone: 'warning' },
  completed: { label: 'Completed', tone: 'success' },
  closed: { label: 'Closed', tone: 'neutral' },
};

/** Status pill metadata for quote requests. */
export const QUOTE_STATUSES = {
  new: { label: 'New', tone: 'info' },
  reviewed: { label: 'Reviewed', tone: 'accent' },
  contacted: { label: 'Contacted', tone: 'accent' },
  quoted: { label: 'Quoted', tone: 'warning' },
  approved: { label: 'Approved', tone: 'success' },
  rejected: { label: 'Rejected', tone: 'error' },
  completed: { label: 'Completed', tone: 'success' },
};

/** Status pill metadata for customers/leads. */
export const CUSTOMER_STATUSES = {
  lead: { label: 'Lead', tone: 'info' },
  contacted: { label: 'Contacted', tone: 'accent' },
  customer: { label: 'Customer', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'neutral' },
};

export const PROJECT_TYPE_OPTIONS = [
  { value: 'residential', label: 'Residential' },
  { value: 'commercial', label: 'Commercial' },
  { value: 'office', label: 'Office' },
  { value: 'industrial', label: 'Industrial' },
  { value: 'other', label: 'Other' },
];

/** Icon keys services can choose (rendered by the ServicesIcon component). */
export const SERVICE_ICON_OPTIONS = [
  { value: 'fabricate', label: 'Fabrication' },
  { value: 'window', label: 'Window' },
  { value: 'glass', label: 'Glass' },
  { value: 'design', label: 'Design' },
  { value: 'door', label: 'Door' },
  { value: 'partition', label: 'Partition' },
  { value: 'office', label: 'Office' },
  { value: 'shower', label: 'Shower' },
  { value: 'interior', label: 'Interior' },
  { value: 'custom', label: 'Custom' },
];
