const Tag = require('../models/Tag');

// Keeps the Tag aggregate collection in sync so the "Popular Tags" endpoint is cheap to query
const syncTags = async (oldTags = [], newTags = []) => {
  const removed = oldTags.filter((t) => !newTags.includes(t));
  const added = newTags.filter((t) => !oldTags.includes(t));

  await Promise.all([
    ...added.map((name) =>
      Tag.findOneAndUpdate({ name }, { $inc: { postCount: 1 } }, { upsert: true, new: true })
    ),
    ...removed.map((name) => Tag.findOneAndUpdate({ name }, { $inc: { postCount: -1 } })),
  ]);
};

module.exports = { syncTags };
