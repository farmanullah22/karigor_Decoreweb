import api from './api';

/**
 * All API endpoints grouped by resource.
 * Every function returns the unwrapped `data` payload; list endpoints also
 * return `meta` where pagination is relevant.
 */

// ---------------- Auth ----------------
export const authApi = {
  async login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    return res.data; // { token, admin }
  },
  async logout() {
    return api.post('/auth/logout');
  },
  async me() {
    const res = await api.get('/auth/me');
    return res.data.admin;
  },
  async updateProfile(payload) {
    const res = await api.put('/auth/profile', payload);
    return res.data.admin;
  },
  async changePassword(currentPassword, newPassword) {
    const res = await api.put('/auth/change-password', { currentPassword, newPassword });
    return res.data;
  },
};

// ---------------- Categories ----------------
export const categoriesApi = {
  async list(params = {}) {
    const res = await api.get('/categories', { params });
    return { items: res.data, meta: res.meta };
  },
  async getById(id) {
    const res = await api.get(`/categories/${id}`);
    return res.data.category;
  },
  async create(payload) {
    const res = await api.post('/categories', payload);
    return res.data.category;
  },
  async update(id, payload) {
    const res = await api.put(`/categories/${id}`, payload);
    return res.data.category;
  },
  async remove(id) {
    return api.delete(`/categories/${id}`);
  },
};

// ---------------- Products ----------------
export const productsApi = {
  async list(params = {}) {
    const res = await api.get('/products', { params });
    return { items: res.data, meta: res.meta };
  },
  async getBySlug(slug) {
    const res = await api.get(`/products/${slug}`);
    return res.data; // { product, related }
  },
  async getById(id) {
    const res = await api.get(`/products/id/${id}`);
    return res.data.product;
  },
  async create(payload) {
    const res = await api.post('/products', payload);
    return res.data.product;
  },
  async update(id, payload) {
    const res = await api.put(`/products/${id}`, payload);
    return res.data.product;
  },
  async toggle(id) {
    return api.patch(`/products/${id}/toggle`);
  },
  async toggleFeatured(id) {
    return api.patch(`/products/${id}/featured`);
  },
  async remove(id) {
    return api.delete(`/products/${id}`);
  },
};

// ---------------- Company services ----------------
export const servicesApi = {
  async list(params = {}) {
    const res = await api.get('/services', { params });
    return { items: res.data, meta: res.meta };
  },
  async getBySlug(slug) {
    const res = await api.get(`/services/${slug}`);
    return res.data; // { service, related }
  },
  async getById(id) {
    const res = await api.get(`/services/id/${id}`);
    return res.data.service;
  },
  async create(payload) {
    const res = await api.post('/services', payload);
    return res.data.service;
  },
  async update(id, payload) {
    const res = await api.put(`/services/${id}`, payload);
    return res.data.service;
  },
  async toggle(id) {
    return api.patch(`/services/${id}/toggle`);
  },
  async toggleFeatured(id) {
    return api.patch(`/services/${id}/featured`);
  },
  async remove(id) {
    return api.delete(`/services/${id}`);
  },
};

// ---------------- Projects ----------------
export const projectsApi = {
  async list(params = {}) {
    const res = await api.get('/projects', { params });
    return { items: res.data, meta: res.meta };
  },
  async listCategories() {
    const res = await api.get('/projects/categories');
    return res.data;
  },
  async getBySlug(slug) {
    const res = await api.get(`/projects/${slug}`);
    return res.data; // { project, related }
  },
  async getById(id) {
    const res = await api.get(`/projects/id/${id}`);
    return res.data.project;
  },
  async create(payload) {
    const res = await api.post('/projects', payload);
    return res.data.project;
  },
  async update(id, payload) {
    const res = await api.put(`/projects/${id}`, payload);
    return res.data.project;
  },
  async toggle(id) {
    return api.patch(`/projects/${id}/toggle`);
  },
  async toggleFeatured(id) {
    return api.patch(`/projects/${id}/featured`);
  },
  async remove(id) {
    return api.delete(`/projects/${id}`);
  },
};

// ---------------- Inquiries ----------------
export const inquiriesApi = {
  async create(payload) {
    return api.post('/inquiries', payload);
  },
  async list(params = {}) {
    const res = await api.get('/inquiries', { params });
    return { items: res.data, meta: res.meta };
  },
  async getById(id) {
    const res = await api.get(`/inquiries/${id}`);
    return res.data.inquiry;
  },
  async updateStatus(id, status) {
    return api.patch(`/inquiries/${id}/status`, { status });
  },
  async updateNotes(id, adminNotes) {
    return api.put(`/inquiries/${id}/notes`, { adminNotes });
  },
  async remove(id) {
    return api.delete(`/inquiries/${id}`);
  },
};

// ---------------- Quote requests ----------------
export const quotesApi = {
  async create(payload) {
    return api.post('/quotes', payload);
  },
  async uploadAttachments(files) {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    const res = await api.post('/quotes/attachments', formData);
    return res.data.files;
  },
  async list(params = {}) {
    const res = await api.get('/quotes', { params });
    return { items: res.data, meta: res.meta };
  },
  async getById(id) {
    const res = await api.get(`/quotes/${id}`);
    return res.data.quote;
  },
  async updateStatus(id, status) {
    return api.patch(`/quotes/${id}/status`, { status });
  },
  async updateNotes(id, adminNotes) {
    return api.put(`/quotes/${id}/notes`, { adminNotes });
  },
  async remove(id) {
    return api.delete(`/quotes/${id}`);
  },
};

// ---------------- Customers ----------------
export const customersApi = {
  async list(params = {}) {
    const res = await api.get('/customers', { params });
    return { items: res.data, meta: res.meta };
  },
  async getById(id) {
    const res = await api.get(`/customers/${id}`);
    return res.data; // { customer, inquiries, quotes }
  },
  async update(id, payload) {
    const res = await api.put(`/customers/${id}`, payload);
    return res.data.customer;
  },
  async remove(id) {
    return api.delete(`/customers/${id}`);
  },
};

// ---------------- Media ----------------
export const mediaApi = {
  async list(params = {}) {
    const res = await api.get('/media', { params });
    return { items: res.data, meta: res.meta };
  },
  async upload(files, alt = '') {
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append('files', file));
    if (alt) formData.append('alt', alt);
    const res = await api.post('/media/upload', formData);
    return res.data.media;
  },
  async usage(id) {
    const res = await api.get(`/media/${id}/usage`);
    return res.data.usages;
  },
  async remove(id, force = false) {
    return api.delete(`/media/${id}`, { params: force ? { force: 'true' } : {} });
  },
};

// ---------------- Company settings ----------------
export const settingsApi = {
  async getPublic() {
    const res = await api.get('/settings');
    return res.data.settings;
  },
  async getForAdmin() {
    const res = await api.get('/settings/admin');
    return res.data.settings;
  },
  async update(payload) {
    const res = await api.put('/settings', payload);
    return res.data.settings;
  },
};

// ---------------- Homepage content ----------------
export const homepageApi = {
  async get() {
    const res = await api.get('/homepage');
    return res.data; // { homepage, featuredProducts, featuredServices, featuredProjects }
  },
  async getForAdmin() {
    const res = await api.get('/homepage/admin');
    return res.data.homepage;
  },
  async update(payload) {
    const res = await api.put('/homepage', payload);
    return res.data.homepage;
  },
};

// ---------------- Dashboard ----------------
export const dashboardApi = {
  async stats() {
    const res = await api.get('/dashboard/stats');
    return res.data;
  },
};
