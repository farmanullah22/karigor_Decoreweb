const CompanySettings = require('../models/CompanySettings');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

/** Fields the public website is allowed to see. */
const PUBLIC_FIELDS = [
  'companyName',
  'tagline',
  'footerDescription',
  'logo',
  'favicon',
  'phone',
  'whatsapp',
  'email',
  'address',
  'googleMapsUrl',
  'businessHours',
  'social',
  'defaultMeta',
];

function pickPublic(settings) {
  const plain = settings.toObject ? settings.toObject() : settings;
  const result = {};
  PUBLIC_FIELDS.forEach((field) => {
    result[field] = plain[field];
  });
  return result;
}

/** GET /api/settings - public company information. */
const getPublicSettings = asyncHandler(async (req, res) => {
  const settings = await CompanySettings.getSingleton();
  return sendSuccess(res, { message: 'OK', data: { settings: pickPublic(settings) } });
});

/** GET /api/settings/admin - full document for the dashboard form. */
const getSettingsForAdmin = asyncHandler(async (req, res) => {
  const settings = await CompanySettings.getSingleton();
  return sendSuccess(res, { message: 'OK', data: { settings } });
});

/** PUT /api/settings - admin update. */
const updateSettings = asyncHandler(async (req, res) => {
  const settings = await CompanySettings.getSingleton();

  const allowed = [
    'companyName',
    'tagline',
    'footerDescription',
    'logo',
    'favicon',
    'phone',
    'whatsapp',
    'email',
    'address',
    'googleMapsUrl',
    'businessHours',
    'social',
    'defaultMeta',
  ];

  allowed.forEach((field) => {
    if (req.body[field] !== undefined) {
      // eslint-disable-next-line no-param-reassign
      settings[field] = req.body[field];
    }
  });

  await settings.save();
  return sendSuccess(res, { message: 'Company settings saved successfully.', data: { settings } });
});

module.exports = { getPublicSettings, getSettingsForAdmin, updateSettings };
