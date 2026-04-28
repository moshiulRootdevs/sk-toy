const slugifyLib = require('slugify');

const slugify = (text) =>
  slugifyLib(text, { lower: true, strict: true, trim: true });

module.exports = slugify;
