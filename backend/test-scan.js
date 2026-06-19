const mongoose = require('mongoose');
const Product = require('./models/Product');
require('dotenv').config();

const test = async () => {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/paintdesk', { retryWrites: false });
  console.log('Connected to DB');

  const code = 'https://www.bergerpaints.com/product-finder/weathercoat-glow';
  
  const orConditions = [
    { productCode: code },
    { barcode: code },
    { qrCode: code },
    { name: { $regex: new RegExp(`^${code}$`, 'i') } }
  ];

  try {
    if (code.startsWith('http://') || code.startsWith('https://')) {
      const url = new URL(code);
      const paths = url.pathname.split('/').filter(Boolean);
      if (paths.length > 0) {
        const slug = paths[paths.length - 1];
        const regexPattern = slug.replace(/[-_]/g, '[-_ ]+').trim();
        if (regexPattern) {
          console.log(`Adding regex condition: ${regexPattern}`);
          orConditions.push({ name: { $regex: new RegExp(regexPattern, 'i') } });
        }
      }
    }
  } catch (err) {
    console.error('URL Parsing Error:', err);
  }

  console.log('OR Conditions:', JSON.stringify(orConditions, null, 2));

  const product = await Product.findOne({
    $or: orConditions
  });

  if (product) {
    console.log('FOUND PRODUCT:', product.name);
  } else {
    console.log('PRODUCT NOT FOUND');
    // Let's see what's actually in the database
    const allProducts = await Product.find({ name: /weather/i });
    console.log('Did find these products matching "weather":', allProducts.map(p => p.name));
  }

  mongoose.connection.close();
};

test().catch(console.error);
