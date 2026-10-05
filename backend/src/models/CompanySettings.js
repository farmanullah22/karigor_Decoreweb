const mongoose = require('mongoose');

/**
 * CompanySettings - singleton document holding all public company
 * information (contact details, social links, branding).
 * The public website reads every piece of contact information from here;
 * nothing is hard-coded in the frontend.
 */
const companySettingsSchema = new mongoose.Schema(
  {
    companyName: { type: String, default: 'Decora', trim: true },
    tagline: { type: String, default: '', trim: true, maxlength: 200 },
    footerDescription: { type: String, default: '', trim: true, maxlength: 500 },
    logo: { type: String, default: '', trim: true },
    favicon: { type: String, default: '', trim: true },
    phone: { type: String, default: '', trim: true },
    whatsapp: { type: String, default: '', trim: true },
    email: { type: String, default: '', trim: true },
    address: { type: String, default: '', trim: true, maxlength: 400 },
    googleMapsUrl: { type: String, default: '', trim: true },
    businessHours: {
      type: [{ days: String, hours: String }],
      default: [],
    },
    social: {
      facebook: { type: String, default: '', trim: true },
      instagram: { type: String, default: '', trim: true },
      tiktok: { type: String, default: '', trim: true },
      youtube: { type: String, default: '', trim: true },
      linkedin: { type: String, default: '', trim: true },
    },
    defaultMeta: {
      title: { type: String, default: '', trim: true },
      description: { type: String, default: '', trim: true, maxlength: 300 },
    },
  },
  { timestamps: true }
);

/**
 * Get the singleton settings document, creating it with defaults on first use.
 */
companySettingsSchema.statics.getSingleton = async function getSingleton() {
  let settings = await this.findOne();
  if (!settings) settings = await this.create({});
  return settings;
};

module.exports = mongoose.model('CompanySettings', companySettingsSchema);
