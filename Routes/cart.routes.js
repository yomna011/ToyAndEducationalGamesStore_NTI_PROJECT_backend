const express = require('express');
const router = express.Router();
const cartController = require('../Controllers/cart.controller');


router.post('/add', cartController.addToCart); // /cart/add momken a add single toy aw multiple toys bas wa2tha ha3ml array items w a7ot gwaha el toyId w el quantity
router.get('/:userId', cartController.getCart); // /cart/:userId
router.post('/remove', cartController.removeFromCart); // /cart/remove 34an a remove specific toy from the cart if i added the toy id withoud determining the qty it will remove the toy completely and if i added the qty it will decrease from it
router.delete('/:cartId', cartController.deleteCart); //  /cart/:cartId by delete el cart totally b kol elly feha

module.exports = router;