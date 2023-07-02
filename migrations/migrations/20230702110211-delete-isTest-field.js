module.exports = {
  async up(db) {
    const collection = db.collection('apikeys');

    // Remove the field from all documents in the collection
    const updateResult = await collection.updateMany(
      {},
      { $unset: { isTest: 1 } },
    );

    console.log(`Updated ${updateResult.modifiedCount} documents.`);
  },

  async down(db) {},
};
