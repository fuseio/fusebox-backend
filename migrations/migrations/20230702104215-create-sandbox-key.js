const base64url = require('base64url');
const crypto = require('crypto');

module.exports = {
  async up(db, client) {
    const collection = db.collection('apikeys');
    const generateRandomToken = () => {
      const randomString = base64url(crypto.randomBytes(18));
      return randomString;
    };

    const documents = await collection
      .find({ sandboxKey: { $exists: false } })
      .toArray();

    for (const doc of documents) {
      const randomToken = generateRandomToken();
      await collection.updateOne(
        { _id: doc._id },
        { $set: { sandboxKey: `pk_test_${randomToken}` } },
      );
    }
    console.log(`Updated ${documents.length} documents.`);
  },

  async down(db, client) {},
};
