const router = require('express').Router();
const productCtrl = require('../controllers/productCtrl')
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.get('/', productCtrl.getProducts);

router.get('/products/:id', productCtrl.getProduct);

router.post('/add', auth, authAdmin, productCtrl.createProduct);

router.patch('/edit/:id', auth, authAdmin, productCtrl.updateProduct);

router.delete('/delete/:id', auth, authAdmin, productCtrl.deleteProduct);

module.exports = router;