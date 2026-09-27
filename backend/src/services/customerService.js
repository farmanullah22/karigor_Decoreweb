const Customer = require('../models/Customer');

/**
 * Unified lead capture: whenever an inquiry or quote request is submitted,
 * the sender is matched to an existing customer (by email or phone) or a
 * new customer record is created. This keeps one clean contact list in the
 * dashboard and tracks per-customer activity counters.
 *
 * @param {'inquiry'|'quote'} type
 */
async function findOrCreateCustomerFromSubmission({ name, phone, email, interestedService, type }) {
  const normalizedEmail = (email || '').toLowerCase().trim();
  const normalizedPhone = (phone || '').trim();

  const conditions = [];
  if (normalizedEmail) conditions.push({ email: normalizedEmail });
  if (normalizedPhone) conditions.push({ phone: normalizedPhone });

  let customer = conditions.length ? await Customer.findOne({ $or: conditions }) : null;

  if (!customer) {
    customer = await Customer.create({
      name,
      phone: normalizedPhone,
      email: normalizedEmail,
      interestedServices: interestedService ? [interestedService] : [],
      lastContactAt: new Date(),
      inquiryCount: type === 'inquiry' ? 1 : 0,
      quoteCount: type === 'quote' ? 1 : 0,
    });
    return customer;
  }

  // Update with the freshest information from this submission.
  if (name) customer.name = name;
  if (normalizedPhone) customer.phone = normalizedPhone;
  if (normalizedEmail) customer.email = normalizedEmail;
  if (interestedService && !customer.interestedServices.includes(interestedService)) {
    customer.interestedServices.push(interestedService);
  }
  customer.lastContactAt = new Date();
  if (type === 'inquiry') customer.inquiryCount += 1;
  if (type === 'quote') customer.quoteCount += 1;
  await customer.save();

  return customer;
}

module.exports = { findOrCreateCustomerFromSubmission };
