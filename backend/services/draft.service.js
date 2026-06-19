const DraftSale = require('../models/DraftSale');
const Product = require('../models/Product');

const getActiveDraft = async () => {
  let draft = await DraftSale.findOne().sort({ createdAt: -1 });
  if (!draft) {
    draft = new DraftSale({ items: [], subTotal: 0, totalGst: 0, totalAmount: 0 });
    await draft.save();
  }
  return draft;
};

const productService = require('./product.service');

const scanProductToDraft = async (code) => {
  const product = await productService.findProductByScanCode(code);

  const draft = await getActiveDraft();

  const existingItemIndex = draft.items.findIndex(item => item.productId.toString() === product._id.toString());

  const unitPrice = parseFloat(product.sellingPrice.toString());
  const gstPercentage = product.gstPercentage;

  if (existingItemIndex > -1) {
    // Increment quantity
    draft.items[existingItemIndex].quantity += 1;
    const qty = draft.items[existingItemIndex].quantity;
    
    const priceBeforeGst = unitPrice * qty;
    const gstAmount = (priceBeforeGst * gstPercentage) / 100;
    const totalPrice = priceBeforeGst + gstAmount;

    draft.items[existingItemIndex].gstAmount = gstAmount;
    draft.items[existingItemIndex].totalPrice = totalPrice;
  } else {
    // Add new item
    const qty = 1;
    const priceBeforeGst = unitPrice * qty;
    const gstAmount = (priceBeforeGst * gstPercentage) / 100;
    const totalPrice = priceBeforeGst + gstAmount;

    draft.items.push({
      productId: product._id,
      name: product.name,
      quantity: qty,
      unitPrice: unitPrice,
      gstPercentage: gstPercentage,
      gstAmount: gstAmount,
      totalPrice: totalPrice
    });
  }

  // Recalculate totals
  let subTotal = 0;
  let totalGst = 0;
  let totalAmount = 0;

  draft.items.forEach(item => {
    subTotal += parseFloat(item.unitPrice.toString()) * item.quantity;
    totalGst += parseFloat(item.gstAmount.toString());
    totalAmount += parseFloat(item.totalPrice.toString());
  });

  draft.subTotal = subTotal;
  draft.totalGst = totalGst;
  draft.totalAmount = totalAmount;

  await draft.save();
  return draft;
};

const updateDraftItem = async (itemId, quantity) => {
  const draft = await getActiveDraft();
  const itemIndex = draft.items.findIndex(item => item._id.toString() === itemId);

  if (itemIndex === -1) {
    throw new Error('Item not found in draft');
  }

  if (quantity <= 0) {
    draft.items.splice(itemIndex, 1);
  } else {
    draft.items[itemIndex].quantity = quantity;
    const qty = quantity;
    const unitPrice = parseFloat(draft.items[itemIndex].unitPrice.toString());
    const gstPercentage = draft.items[itemIndex].gstPercentage;

    const priceBeforeGst = unitPrice * qty;
    const gstAmount = (priceBeforeGst * gstPercentage) / 100;
    const totalPrice = priceBeforeGst + gstAmount;

    draft.items[itemIndex].gstAmount = gstAmount;
    draft.items[itemIndex].totalPrice = totalPrice;
  }

  // Recalculate totals
  let subTotal = 0;
  let totalGst = 0;
  let totalAmount = 0;

  draft.items.forEach(item => {
    subTotal += parseFloat(item.unitPrice.toString()) * item.quantity;
    totalGst += parseFloat(item.gstAmount.toString());
    totalAmount += parseFloat(item.totalPrice.toString());
  });

  draft.subTotal = subTotal;
  draft.totalGst = totalGst;
  draft.totalAmount = totalAmount;

  await draft.save();
  return draft;
};

const removeDraftItem = async (itemId) => {
  return await updateDraftItem(itemId, 0);
};

const clearDraft = async () => {
  const draft = await getActiveDraft();
  draft.items = [];
  draft.subTotal = 0;
  draft.totalGst = 0;
  draft.totalAmount = 0;
  await draft.save();
  return draft;
};

module.exports = {
  getActiveDraft,
  scanProductToDraft,
  updateDraftItem,
  removeDraftItem,
  clearDraft
};
