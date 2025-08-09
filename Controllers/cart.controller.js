const Cart = require('../models/cart.model');
const Toy = require('../models/toy.model');


const addToCart = async (req, res) => {
  try {
    console.log('Add to Cart Data:', req.body);
    const { userId, toyId, quantity, items } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid userId' });
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    if (Array.isArray(items) && items.length > 0) {
      
      const errors = [];
      
      for (const { toyId: itemToyId, quantity: itemQty } of items) {
        if (!mongoose.Types.ObjectId.isValid(itemToyId)) {
          errors.push(`Invalid toyId: ${itemToyId}`);
          continue;
        }

        if (!Number.isInteger(itemQty) || itemQty <= 0) {
          errors.push(`Invalid quantity for toy ${itemToyId}`);
          continue;
        }

        const toy = await Toy.findById(itemToyId);
        if (!toy) {
          errors.push(`Toy not found: ${itemToyId}`);
          continue;
        }

        if (!toy.inStock || toy.stock < itemQty) {
          errors.push(`Insufficient stock for toy ${toy.name} (ID: ${itemToyId})`);
          continue;
        }

        const itemIndex = cart.items.findIndex(item => item.toy.toString() === itemToyId);
        if (itemIndex > -1) {
          cart.items[itemIndex].quantity += itemQty;
        } else {
          cart.items.push({ toy: itemToyId, quantity: itemQty });
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({ 
          error: 'Some items could not be added',
          details: errors,
          partialCart: cart 
        });
      }
    } 
    else if (toyId && quantity) {  
      if (!mongoose.Types.ObjectId.isValid(toyId)) {
        return res.status(400).json({ error: 'Invalid toyId' });
      }

      if (!Number.isInteger(quantity) || quantity <= 0) {
        return res.status(400).json({ error: 'Quantity must be a positive integer' });
      }

      const toy = await Toy.findById(toyId);
      if (!toy) return res.status(404).json({ error: 'Toy not found' });
      
      if (!toy.inStock || toy.stock < quantity) {
        return res.status(400).json({ error: 'Insufficient stock' });
      }

      const itemIndex = cart.items.findIndex(item => item.toy.toString() === toyId);
      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
      } else {
        cart.items.push({ toy: toyId, quantity });
      }
    } 
    else {
      return res.status(400).json({ error: 'Request must include either "items" array or both "toyId" and "quantity"' });
    }

    cart.updatedAt = Date.now();
    await cart.save();
    res.status(200).json(cart);
  } catch (err) {
    console.error('Failed to add to cart:', err);
    res.status(500).json({ error: err.message || 'Failed to add to cart' });
  }
};



// Remove toy from cart (decrease quantity or remove fully if qty=0)
const removeFromCart = async (req, res) => {
  try {
    console.log('Remove from Cart Data:', req.body);
    const { userId, toyId, quantity } = req.body;
    if (!userId || !toyId) {
      return res.status(400).json({ error: 'userId and toyId are required' });
    }

    const cart = await Cart.findOne({ user: userId });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    const itemIndex = cart.items.findIndex(item => item.toy.toString() === toyId);
    if (itemIndex === -1) {
      return res.status(404).json({ error: 'Item not found in cart' });
    }

    
    if (quantity && quantity > 0 && cart.items[itemIndex].quantity > quantity) {
      cart.items[itemIndex].quantity -= quantity;
    } else {
    
      cart.items.splice(itemIndex, 1);
    }

    cart.updatedAt = Date.now();
    await cart.save();

    res.status(200).json(cart);
  } catch (err) {
    console.error('Failed to remove from cart:', err);
    res.status(500).json({ error: err.name === 'ValidationError' ? err.message : 'Failed to remove from cart' });
  }
};

// Get cart items
const getCart = async (req, res) => {
  try {
    console.log('Get Cart UserID:', req.params.userId);
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    const cart = await Cart.findOne({ user: userId }).populate('items.toy');
    if (!cart) return res.status(404).json({ error: 'Cart not found' });
    res.status(200).json(cart);
  } catch (err) {
    console.error('Failed to fetch cart:', err);
    res.status(500).json({ error: 'Failed to fetch cart' });
  }
};

// Delete cart by ID
const deleteCart = async (req, res) => {
  try {
    console.log('Delete Cart ID:', req.params.cartId);
    const { cartId } = req.params;
    if (!cartId) {
      return res.status(400).json({ error: 'cartId is required' });
    }

    const cart = await Cart.findByIdAndDelete(cartId);
    if (!cart) {
      return res.status(404).json({ error: 'Cart not found' });
    }

    res.status(200).json({ message: 'Cart deleted successfully' });
  } catch (err) {
    console.error('Failed to delete cart:', err);
    res.status(500).json({ error: err.name === 'ValidationError' ? err.message : 'Failed to delete cart' });
  }
};

module.exports = { addToCart, removeFromCart, getCart, deleteCart };
