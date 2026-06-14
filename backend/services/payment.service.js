const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Dealer = require('../models/Dealer');
const mongoose = require('mongoose');

const recordPayment = async (paymentData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { partyType, partyId, amount } = paymentData;

    // Create payment record
    const payment = new Payment(paymentData);
    await payment.save({ session });

    // Deduct amount from respective balance
    if (partyType === 'Customer') {
      const customer = await Customer.findById(partyId).session(session);
      if (!customer) throw new Error('Customer not found');
      
      const currentBalance = parseFloat(customer.outstandingBalance.toString());
      customer.outstandingBalance = mongoose.Types.Decimal128.fromString((currentBalance - amount).toString());
      await customer.save({ session });
    } else if (partyType === 'Dealer') {
      const dealer = await Dealer.findById(partyId).session(session);
      if (!dealer) throw new Error('Dealer not found');
      
      const currentBalance = parseFloat(dealer.pendingBalance.toString());
      dealer.pendingBalance = mongoose.Types.Decimal128.fromString((currentBalance - amount).toString());
      await dealer.save({ session });
    }

    await session.commitTransaction();
    session.endSession();
    return payment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const getPaymentsByParty = async (partyType, partyId) => {
  const payments = await Payment.find({ partyType, partyId }).sort({ paymentDate: -1, createdAt: -1 });
  return payments;
};

const updatePayment = async (paymentId, updateData) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) throw new Error('Payment not found');

    const oldAmount = parseFloat(payment.amount.toString());
    
    // Update the payment fields
    if (updateData.amount !== undefined) payment.amount = updateData.amount;
    if (updateData.paymentDate !== undefined) payment.paymentDate = updateData.paymentDate;
    if (updateData.paymentMethod !== undefined) payment.paymentMethod = updateData.paymentMethod;
    if (updateData.referenceNumber !== undefined) payment.referenceNumber = updateData.referenceNumber;
    if (updateData.notes !== undefined) payment.notes = updateData.notes;

    const newAmount = parseFloat(payment.amount.toString());
    const difference = newAmount - oldAmount;

    if (difference !== 0) {
      if (payment.partyType === 'Customer') {
        const customer = await Customer.findById(payment.partyId).session(session);
        if (!customer) throw new Error('Customer not found');
        const currentBalance = parseFloat(customer.outstandingBalance.toString());
        customer.outstandingBalance = mongoose.Types.Decimal128.fromString((currentBalance - difference).toString());
        await customer.save({ session });
      } else if (payment.partyType === 'Dealer') {
        const dealer = await Dealer.findById(payment.partyId).session(session);
        if (!dealer) throw new Error('Dealer not found');
        const currentBalance = parseFloat(dealer.pendingBalance.toString());
        dealer.pendingBalance = mongoose.Types.Decimal128.fromString((currentBalance - difference).toString());
        await dealer.save({ session });
      }
    }

    await payment.save({ session });
    await session.commitTransaction();
    session.endSession();
    return payment;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const deletePayment = async (paymentId) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) throw new Error('Payment not found');

    const amount = parseFloat(payment.amount.toString());

    if (payment.partyType === 'Customer') {
      const customer = await Customer.findById(payment.partyId).session(session);
      if (!customer) throw new Error('Customer not found');
      
      const currentBalance = parseFloat(customer.outstandingBalance.toString());
      customer.outstandingBalance = mongoose.Types.Decimal128.fromString((currentBalance + amount).toString());
      await customer.save({ session });
    } else if (payment.partyType === 'Dealer') {
      const dealer = await Dealer.findById(payment.partyId).session(session);
      if (!dealer) throw new Error('Dealer not found');
      
      const currentBalance = parseFloat(dealer.pendingBalance.toString());
      dealer.pendingBalance = mongoose.Types.Decimal128.fromString((currentBalance + amount).toString());
      await dealer.save({ session });
    }

    await Payment.findByIdAndDelete(paymentId).session(session);

    await session.commitTransaction();
    session.endSession();
    return true;
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

module.exports = {
  recordPayment,
  getPaymentsByParty,
  updatePayment,
  deletePayment,
};
