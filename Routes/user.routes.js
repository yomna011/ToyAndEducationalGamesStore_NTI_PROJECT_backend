const express = require('express');
const router = express.Router();
const userController = require('../Controllers/user.controller');
const upload = require('../middleware/upload.middleware.handler');
const multerErrorHandler = require('../middleware/multer.error.handler');

// Public Routes
router.post('/register', upload, multerErrorHandler, userController.signup); //hena byregister as a new user>>keep el token and userid cuz will need you next
router.post('/login', userController.login); //hena bylogin bas lazel a keep el token w a7otha fe el auth el awel for security w kaman el username and pass
router.get('/', userController.getAllUsers); //get el users kolha 3ady

// Protected Routes
router.get('/:id', userController.protectRoutes, userController.getUserById); //hena 34an a get specific user by id bas lazem akon 3amla login el awel w ha7tag el token m3aya
router.put('/:id', userController.protectRoutes, upload, multerErrorHandler, userController.updateUser);//update user w nafs el kalam bas ba7ot fe el body el 7aga elly 3ayzaha t get updated only
router.post('/favorites', userController.protectRoutes, userController.addToFavorites); // hena ba7ot el toyId bas fa lazem ykoon m3aya el toyId el awel

module.exports = router;