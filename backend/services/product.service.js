const Product = require('../models/Product');

const createProduct = async (productData) => {
  const product = new Product(productData);
  return await product.save();
};

const getProducts = async (query = {}) => {
  const { search, page = 1, limit = 10, brand } = query;
  
  const filter = { isActive: true };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { productCode: { $regex: search, $options: 'i' } },
    ];
  }
  if (brand) {
    filter.brand = brand;
  }

  if (query.stockStatus === 'out') {
    filter.currentStock = { $lte: 0 };
  } else if (query.stockStatus === 'low') {
    filter.$expr = {
      $and: [
        { $gt: ["$currentStock", 0] },
        { $lte: ["$currentStock", "$lowStockLimit"] }
      ]
    };
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [products, total] = await Promise.all([
    Product.find(filter).sort({ name: 1 }).skip(skip).limit(parseInt(limit)),
    Product.countDocuments(filter),
  ]);

  return {
    products,
    total,
    page: parseInt(page),
    totalPages: Math.ceil(total / parseInt(limit)),
  };
};

const getProductById = async (id) => {
  const product = await Product.findById(id);
  if (!product || !product.isActive) {
    throw new Error('Product not found');
  }
  return product;
};

const updateProduct = async (id, updateData) => {
  const product = await Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

const deleteProduct = async (id) => {
  // Hard delete
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    throw new Error('Product not found');
  }
  return product;
};

const findProductByScanCode = async (code) => {
  // Base matching conditions
  const orConditions = [
    { productCode: code },
    { barcode: code },
    { qrCode: code },
    { name: { $regex: new RegExp(`^${code}$`, 'i') } }
  ];

  // If the scanned code looks like a URL, extract the last part for a fuzzy name match
  // e.g. "https://www.bergerpaints.com/product/walmasta-glow" -> "walmasta glow"
  try {
    if (code.startsWith('http://') || code.startsWith('https://')) {
      const url = new URL(code);
      const paths = url.pathname.split('/').filter(Boolean);
      if (paths.length > 0) {
        const slug = paths[paths.length - 1];
        // Replace hyphens and underscores with a pattern that matches spaces, hyphens, or underscores
        const regexPattern = slug.replace(/[-_]/g, '[-_ ]+').trim();
        if (regexPattern) {
          orConditions.push({ name: { $regex: new RegExp(regexPattern, 'i') } });
        }
      }
    }
  } catch (err) {
    // Ignore URL parsing errors
  }

  const product = await Product.findOne({
    $or: orConditions,
    isActive: true
  });
  
  if (!product) {
    throw new Error('Product not found with this code or name');
  }
  return product;
};

module.exports = {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  findProductByScanCode,
};
