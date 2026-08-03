const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Product = require('../models/Product');
const AdminConfig = require('../models/Admin');
const store = require('./mockStore');

const seedInitialData = async () => {
  try {
    // 1. Seed SuperAdmin User
    const adminExists = await User.findOne({ email: 'sakthivijayarajkrv@gmail.com' });
    if (!adminExists) {
      await User.create({
        name: 'Sakthi Vijayaraj',
        email: 'sakthivijayarajkrv@gmail.com',
        phone: '7358409336',
        password: await bcrypt.hash('admin123', 10),
        role: 'ADMIN',
        sellerStatus: 'VERIFIED',
        storeName: 'VizHop Official SuperAdmin',
        storeDescription: 'Official Platform Administrator Store',
        isEmailVerified: true,
        isMobileVerified: true
      });
      console.log('[VizHop Seed] SuperAdmin user created in MongoDB Atlas');
    }

    // 2. Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const formattedProducts = store.products.map(p => {
        const { _id, reviews, ...rest } = p;
        const cleanReviews = (reviews || []).map(r => {
          const { _id: rId, ...rRest } = r;
          return rRest;
        });
        return { ...rest, reviews: cleanReviews };
      });
      await Product.insertMany(formattedProducts);
      console.log('[VizHop Seed] Initial products seeded into MongoDB Atlas');
    }

    // 3. Seed AdminConfig (Banners & Categories)
    let config = await AdminConfig.findOne({});
    if (!config) {
      const cleanBanners = (store.banners || []).map(b => { const { _id, ...r } = b; return r; });
      const cleanCategories = (store.categories || []).map(c => { const { _id, ...r } = c; return r; });
      await AdminConfig.create({
        banners: cleanBanners,
        categories: cleanCategories,
        announcement: store.announcement
      });
      console.log('[VizHop Seed] Admin Banners and Categories seeded into MongoDB Atlas');
    }
  } catch (error) {
    console.error('[VizHop Seed Error]', error.message);
  }
};

module.exports = seedInitialData;
