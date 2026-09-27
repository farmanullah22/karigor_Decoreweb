const express = require('express');
const authRoutes = require('./authRoutes');
const productRoutes = require('./productRoutes');
const categoryRoutes = require('./categoryRoutes');
const serviceRoutes = require('./serviceRoutes');
const projectRoutes = require('./projectRoutes');
const inquiryRoutes = require('./inquiryRoutes');
const quoteRoutes = require('./quoteRoutes');
const customerRoutes = require('./customerRoutes');
const mediaRoutes = require('./mediaRoutes');
const settingsRoutes = require('./settingsRoutes');
const homepageRoutes = require('./homepageRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/categories', categoryRoutes);
router.use('/services', serviceRoutes);
router.use('/projects', projectRoutes);
router.use('/inquiries', inquiryRoutes);
router.use('/quotes', quoteRoutes);
router.use('/customers', customerRoutes);
router.use('/media', mediaRoutes);
router.use('/settings', settingsRoutes);
router.use('/homepage', homepageRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
