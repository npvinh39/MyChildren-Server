const router = require('express').Router();
const productCtrl = require('../controllers/productCtrl')
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.get('/', productCtrl.getProducts);

router.get('/with-description', productCtrl.getProductsWithDescription);

router.get('/:id', productCtrl.getProduct);

router.get('/category/:id', productCtrl.getProductByCategory);

router.get('/description/:id', productCtrl.getDescriptionByProduct);

router.get('/length/all', productCtrl.getProductsLength);

router.post('/add', auth, authAdmin, productCtrl.createProduct);

router.patch('/edit/:id', auth, authAdmin, productCtrl.updateProduct);

router.delete('/delete/:id', auth, authAdmin, productCtrl.deleteProduct);

module.exports = router;