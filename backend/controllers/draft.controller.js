const draftService = require('../services/draft.service');

const getDraft = async (req, res) => {
  try {
    const draft = await draftService.getActiveDraft();
    res.status(200).json({ success: true, data: draft });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const scanToDraft = async (req, res) => {
  try {
    const { code, lookupOnly } = req.body;
    if (!code) return res.status(400).json({ success: false, message: 'Scan code is required' });
    
    if (lookupOnly) {
      const productService = require('../services/product.service');
      const product = await productService.findProductByScanCode(code);
      return res.status(200).json({ success: true, data: product });
    }

    const draft = await draftService.scanProductToDraft(code);
    res.status(200).json({ success: true, data: draft });
  } catch (error) {
    res.status(404).json({ success: false, message: error.message });
  }
};

const updateItemQuantity = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { quantity } = req.body;
    if (quantity === undefined) return res.status(400).json({ success: false, message: 'Quantity is required' });
    const draft = await draftService.updateDraftItem(itemId, Number(quantity));
    res.status(200).json({ success: true, data: draft });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const removeItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const draft = await draftService.removeDraftItem(itemId);
    res.status(200).json({ success: true, data: draft });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

const clearDraft = async (req, res) => {
  try {
    const draft = await draftService.clearDraft();
    res.status(200).json({ success: true, data: draft });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getDraft,
  scanToDraft,
  updateItemQuantity,
  removeItem,
  clearDraft
};
