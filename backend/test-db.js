const mongoose = require('mongoose');

async function test() {
  let MONGODB_URI = 'mongodb://127.0.0.1:27017/paintdesk';
  if (MONGODB_URI.includes('retryWrites=true')) {
    MONGODB_URI = MONGODB_URI.replace('retryWrites=true', 'retryWrites=false');
  } else if (!MONGODB_URI.includes('retryWrites=false')) {
    MONGODB_URI += MONGODB_URI.includes('?') ? '&retryWrites=false' : '?retryWrites=false';
  }

  await mongoose.connect(MONGODB_URI, { retryWrites: false });
  console.log('Connected');

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    console.log('Transaction started');
    const db = mongoose.connection.db;
    const collection = db.collection('test_write');
    await collection.insertOne({ a: 1 }, { session });
    await session.commitTransaction();
    console.log('Transaction committed');
    session.endSession();
  } catch (err) {
    console.error('Transaction Error:', err.message);
  }

  mongoose.disconnect();
}

test();
