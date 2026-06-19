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
  const product = await Product.findOne({
    $or: [
      { productCode: code },
      { barcode: code },
      { qrCode: code },
      { name: { $regex: new RegExp(`^${code}$`, 'i') } }
    ],
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
