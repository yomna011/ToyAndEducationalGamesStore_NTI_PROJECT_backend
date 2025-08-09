const Toy = require('../models/toy.model');

exports.addToy = async (req, res) => {
  try {
    console.log('Incoming Toy Data:', req.body, 'Files:', req.files);

    const { name, description, price, ageGroup, learningObjective } = req.body;

    if (!name || !description || !price || !ageGroup || !learningObjective) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    let parsedObjectives;
    if (typeof learningObjective === 'string') {
      parsedObjectives = [learningObjective];
    } else if (Array.isArray(learningObjective)) {
      parsedObjectives = learningObjective;
    } else {
      return res.status(400).json({ error: 'learningObjective must be a string or array' });
    }

    const imageURL = req.files && req.files.image ? `/Uploads/${req.files.image[0].filename}` : undefined;
    const videoURL = req.files && req.files.video ? `/Uploads/${req.files.video[0].filename}` : undefined;

    const newToy = await Toy.create({
      name,
      description,
      price,
      ageGroup,
      learningObjective: parsedObjectives,
      imageURL,
      videoURL
    });

    res.status(201).json(newToy);
  } catch (err) {
    console.error('Failed to add toy:', err);
    res.status(500).json({ error: err.name === 'ValidationError' ? err.message : 'Failed to add toy' });
  }
};

exports.getAllToys = async (req, res) => {
  try {
    const { ageGroup, learningObjective, inStock } = req.query;
    const query = {};

    if (ageGroup) query.ageGroup = ageGroup;
    if (learningObjective) query.learningObjective = { $in: [learningObjective] };
    if (inStock !== undefined) query.inStock = inStock === 'true';

    const toys = await Toy.find(query);
    res.status(200).json(toys);
  } catch (err) {
    console.error('Error fetching toys:', err);
    res.status(500).json({ error: 'Failed to fetch toys' });
  }
};

exports.getToyById = async (req, res) => {
  try {
    const toy = await Toy.findById(req.params.id);
    if (!toy) {
      return res.status(404).json({ error: 'Toy not found' });
    }
    res.status(200).json(toy);
  } catch (err) {
    console.error('Error fetching toy:', err);
    res.status(500).json({ error: 'Failed to fetch toy' });
  }
};

exports.updateToy = async (req, res) => {
  try {
    console.log('Update Toy Data:', req.body, 'Files:', req.files);

    const { name, description, price, ageGroup, learningObjective, inStock } = req.body;

    let parsedObjectives;
    if (learningObjective) {
      parsedObjectives = typeof learningObjective === 'string' ? [learningObjective] : learningObjective;
    }

    const imageURL = req.files && req.files.image ? `/Uploads/${req.files.image[0].filename}` : undefined;
    const videoURL = req.files && req.files.video ? `/Uploads/${req.files.video[0].filename}` : undefined;

    const updateData = {
      name,
      description,
      price,
      ageGroup,
      learningObjective: parsedObjectives,
      inStock,
      imageURL,
      videoURL
    };

    Object.keys(updateData).forEach(key => updateData[key] === undefined && delete updateData[key]);

    const toy = await Toy.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!toy) {
      return res.status(404).json({ error: 'Toy not found' });
    }
    res.status(200).json(toy);
  } catch (err) {
    console.error('Error updating toy:', err);
    res.status(500).json({ error: err.name === 'ValidationError' ? err.message : 'Failed to update toy' });
  }
};

exports.deleteToy = async (req, res) => {
  try {
    const deletedToy = await Toy.findByIdAndDelete(req.params.id);
    if (!deletedToy) {
      return res.status(404).json({ error: 'Toy not found' });
    }
    res.status(200).json({ message: 'Toy deleted successfully' });
  } catch (err) {
    console.error('Error deleting toy:', err);
    res.status(500).json({ error: 'Failed to delete toy' });
  }
};