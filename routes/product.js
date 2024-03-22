const express = require('express');

const { auth } = require('../middleware/auth');

const productController = require('../controllers/product');

const multer = require('multer');



const router = express.Router();



router.get('/total', auth, productController.getTotalProducts);

router.get('/categories', auth, productController.getCategories);

router.get('/:productId', productController.getProduct);

router.post('/', auth,  productController.createProduct);


module.exports = router;