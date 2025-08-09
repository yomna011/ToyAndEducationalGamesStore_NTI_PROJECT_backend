const Order = require('../models/order.model');
const Cart = require('../models/cart.model');
const Toy = require('../models/toy.model');


const placeOrder = async (req, res) => {
  try {
    console.log('Incoming Order Data:', req.body);
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.toy');
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found for user' });
    }
    if (cart.items.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' });
    }

    const items = cart.items.map(item => ({
      toy: item.toy._id,
      quantity: item.quantity,
      price: item.toy.price
    }));
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    const order = await Order.create({ user: userId, items, total });

    // Clear cart after order
    cart.items = [];
    await cart.save();

    res.status(201).json(order);
  } catch (err) {
    console.error('Failed to place order:', err);
    res.status(500).json({ error: err.name === 'ValidationError' ? err.message : 'Failed to place order' });
  }
};

// View user's orders
const getOrders = async (req, res) => {
  try {
    console.log('Get Orders UserID:', req.params.userId);
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const orders = await Order.find({ user: userId }).populate('items.toy');
    res.status(200).json(orders);
  } catch (err) {
    console.error('Failed to fetch orders:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
};

module.exports = { placeOrder, getOrders };