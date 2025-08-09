const express = require('express');
const router = express.Router();
const orderController = require('../Controllers/order.controller');


router.post('/', orderController.placeOrder); //  /order>>to add new order bas lazem ykoon el user daf 7agat fe el cart el awel before adding
router.get('/history/:userId', orderController.getOrders); //  /order/history/:userId

module.exports = router;