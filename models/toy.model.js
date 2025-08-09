const mongoose = require('mongoose');

const toySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  ageGroup: { type: String, required: true, enum: ['3-5', '6-8', '9-12', '13+'] },
  learningObjective: { 
    type: [String], 
    required: true, 
    enum: ['Math', 'Memory', 'Logic', 'Creativity', 'Language'] 
  },
  imageURL: { type: String }, 
  videoURL: { type: String }, 
  inStock: { type: Boolean, default: true }
});

module.exports = mongoose.model('Toy', toySchema);