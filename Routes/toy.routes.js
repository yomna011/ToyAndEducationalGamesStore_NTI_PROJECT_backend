const express = require('express');
const router = express.Router();
const toyController = require('../Controllers/toy.controller');
const uploadMiddlewareHandler = require('../middleware/upload.middleware.handler');
const multerErrorHandler = require('../middleware/multer.error.handler');


router.get('/', toyController.getAllToys); // /toys >> hena a2dar a3ml query 34an a filter el toys for ageGroup aw learningObjective aw 34an a check in stock wla la2
router.get('/:id', toyController.getToyById); // /toys/:id >>ti get toy by id
router.post('/', uploadMiddlewareHandler, multerErrorHandler, toyController.addToy); // /toys>> hena to add a new toy
router.put('/:id', uploadMiddlewareHandler, multerErrorHandler, toyController.updateToy); // /toys/:id >>update a specific toy
router.delete('/:id', toyController.deleteToy); // delete /toys/:id

module.exports = router;