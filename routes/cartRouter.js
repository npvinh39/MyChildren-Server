const router = require('express').Router();
const cartCtrl = require('../controllers/cartCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');


router.get('/:user_id', auth, cartCtrl.getCart);

router.post('/add/:user_id', auth, cartCtrl.addToCart);

router.patch('/edit', auth, cartCtrl.updateCart);

// delete the product from cart
router.patch('/delete/:id', auth, cartCtrl.deleteProduct);

// delete all products from cart
router.patch('/delete-all', auth, cartCtrl.deleteAllProducts);

router.delete('/delete/:id', auth, cartCtrl.deleteCart);


module.exports = router;