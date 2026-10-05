/* eslint-disable no-console */
/**
 * Development seed script.
 *
 *   npm run seed
 *
 * Resets catalog/customer collections and inserts realistic sample data,
 * including a development admin account.
 *
 * WARNING: this clears the seeded collections. Never run it against a
 * production database.
 */
const { connectDatabase, disconnectDatabase } = require('../config/db');
const { toSlug } = require('../utils/slug');
const { findOrCreateCustomerFromSubmission } = require('../services/customerService');

const Admin = require('../models/Admin');
const Category = require('../models/Category');
const Product = require('../models/Product');
const Service = require('../models/Service');
const Project = require('../models/Project');
const Inquiry = require('../models/Inquiry');
const QuoteRequest = require('../models/QuoteRequest');
const Customer = require('../models/Customer');
const Media = require('../models/Media');
const CompanySettings = require('../models/CompanySettings');
const Homepage = require('../models/Homepage');

const data = require('./data');

function daysAgo(n) {
  const date = new Date();
  date.setDate(date.getDate() - n);
  return date;
}

/**
 * Normalize a placeholder path (string) or image object into the embedded
 * image sub-schema shape ({ url, alt }) used by the models.
 */
function imageOf(value, alt = '') {
  if (!value) return undefined;
  if (typeof value === 'string') return { url: value, alt };
  return { url: value.url || '', alt: value.alt || alt };
}

async function clearCollections() {
  await Promise.all([
    Category.deleteMany({}),
    Product.deleteMany({}),
    Service.deleteMany({}),
    Project.deleteMany({}),
    Inquiry.deleteMany({}),
    QuoteRequest.deleteMany({}),
    Customer.deleteMany({}),
    Media.deleteMany({}),
    CompanySettings.deleteMany({}),
    Homepage.deleteMany({}),
  ]);
  console.log('[seed] Cleared catalog collections.');
}

async function seedCategories() {
  const docs = [
    ...data.productCategories.map((category) => ({
      ...category,
      slug: toSlug(category.name),
      scope: 'product',
      isActive: true,
    })),
    ...data.projectCategories.map((category) => ({
      ...category,
      slug: toSlug(category.name),
      scope: 'project',
      description: '',
      isActive: true,
    })),
  ];

  const created = await Category.insertMany(docs);
  const byName = Object.fromEntries(created.map((category) => [category.name, category._id]));
  console.log(`[seed] Inserted ${created.length} categories.`);
  return byName;
}

async function seedProducts(categoryByName) {
  const docs = data.products.map((product) => ({
    name: product.name,
    slug: toSlug(product.name),
    category: categoryByName[product.category],
    shortDescription: product.shortDescription,
    description: product.description,
    features: product.features,
    specifications: product.specifications,
    materials: product.materials,
    colors: product.colors,
    image: imageOf(product.image, product.name),
    gallery: (product.gallery || []).map((path, index) =>
      imageOf(path, `${product.name} - view ${index + 2}`)
    ),
    featured: product.featured,
    isActive: true,
    sortOrder: product.sortOrder,
  }));

  const created = await Product.insertMany(docs);
  console.log(`[seed] Inserted ${created.length} products.`);
}

async function seedServices() {
  const docs = data.services.map((service) => ({
    name: service.name,
    slug: toSlug(service.name),
    shortDescription: service.shortDescription,
    description: service.description,
    icon: service.icon,
    image: { url: `/seed-images/service-${service.icon}.svg`, alt: service.name },
    features: service.features,
    process: service.process,
    featured: service.featured,
    isActive: true,
    sortOrder: service.sortOrder,
  }));

  const created = await Service.insertMany(docs);
  console.log(`[seed] Inserted ${created.length} services.`);
}

async function seedProjects() {
  const docs = data.projects.map((project) => ({
    name: project.name,
    slug: toSlug(project.name),
    category: project.category,
    location: project.location,
    completionDate: new Date(project.completionDate),
    shortDescription: project.shortDescription,
    description: project.description,
    materialsUsed: project.materialsUsed,
    servicesProvided: project.servicesProvided,
    coverImage: imageOf(project.coverImage, project.name),
    gallery: (project.gallery || []).map((path, index) =>
      imageOf(path, `${project.name} - view ${index + 2}`)
    ),
    featured: project.featured,
    isActive: true,
    sortOrder: project.sortOrder,
  }));

  const created = await Project.insertMany(docs);
  console.log(`[seed] Inserted ${created.length} projects.`);
}

async function seedSettingsAndHomepage() {
  await CompanySettings.create(data.companySettings);
  await Homepage.create(data.homepage);
  console.log('[seed] Inserted company settings and homepage content.');
}

async function seedAdmin() {
  const seedAdmin = data.getSeedAdmin();

  // Remove any previous seeded admin with the same email, then recreate so
  // the password always matches the current environment configuration.
  await Admin.deleteOne({ email: seedAdmin.email });
  await Admin.create(seedAdmin);

  console.log(`[seed] Admin account created: ${seedAdmin.email}`);
  return seedAdmin;
}

async function seedSampleRequests() {
  for (const inquiry of data.sampleInquiries) {
    const created = await Inquiry.create({
      name: inquiry.name,
      phone: inquiry.phone,
      email: inquiry.email,
      subject: inquiry.subject,
      service: inquiry.service,
      message: inquiry.message,
      status: inquiry.status,
      source: inquiry.source,
      createdAt: daysAgo(inquiry.daysAgo),
      updatedAt: daysAgo(inquiry.daysAgo),
    });

    const customer = await findOrCreateCustomerFromSubmission({
      name: inquiry.name,
      phone: inquiry.phone,
      email: inquiry.email,
      interestedService: inquiry.service,
      type: 'inquiry',
    });

    created.customer = customer._id;
    await created.save();
  }

  for (const quote of data.sampleQuotes) {
    const created = await QuoteRequest.create({
      name: quote.name,
      phone: quote.phone,
      email: quote.email,
      productService: quote.productService,
      quantity: quote.quantity,
      projectType: quote.projectType,
      budget: quote.budget,
      message: quote.message,
      status: quote.status,
      source: quote.source,
      createdAt: daysAgo(quote.daysAgo),
      updatedAt: daysAgo(quote.daysAgo),
    });

    const customer = await findOrCreateCustomerFromSubmission({
      name: quote.name,
      phone: quote.phone,
      email: quote.email,
      interestedService: quote.productService,
      type: 'quote',
    });

    created.customer = customer._id;
    await created.save();
  }

  console.log(`[seed] Inserted ${data.sampleInquiries.length} sample inquiries and ${data.sampleQuotes.length} sample quotes (with linked customers).`);
}

async function run() {
  console.log('----------------------------------------------');
  console.log(' Decora - development seed');
  console.log(' WARNING: this resets seeded collections.');
  console.log('----------------------------------------------');

  await connectDatabase();
  await clearCollections();

  const categoryByName = await seedCategories();
  await seedProducts(categoryByName);
  await seedServices();
  await seedProjects();
  await seedSettingsAndHomepage();
  const adminAccount = await seedAdmin();
  await seedSampleRequests();

  console.log('----------------------------------------------');
  console.log(' Seed complete.');
  console.log(' Development admin credentials (change immediately in production):');
  console.log(`   Email:    ${adminAccount.email}`);
  console.log(`   Password: ${adminAccount.password}`);
  console.log('----------------------------------------------');

  await disconnectDatabase();
}

run().catch(async (error) => {
  console.error('[seed] Failed:', error);
  await disconnectDatabase();
  process.exit(1);
});
