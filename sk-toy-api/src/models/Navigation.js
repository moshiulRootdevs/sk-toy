const mongoose = require('mongoose');

const navChildSchema = new mongoose.Schema({
  label:    String,
  link:     String,
  children: [{
    label: String,
    link:  String,
  }],
}, { _id: true });

const navigationSchema = new mongoose.Schema({
  label:    { type: String, required: true },
  link:     String,
  badge:    String,
  order:    { type: Number, default: 0 },
  children: [navChildSchema],
}, { timestamps: true });

module.exports = mongoose.model('Navigation', navigationSchema);
