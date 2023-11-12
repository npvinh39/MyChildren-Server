const router = require('express').Router();
const orderCtrl = require('../controllers/orderCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.get('/', auth, authAdmin, orderCtrl.getOrders);

router.get('/:id', orderCtrl.getOrder);

router.get('/user/:id', orderCtrl.getOrdersByUser);

router.post('/add/:id', auth, orderCtrl.createOrder);

router.patch('/edit/:id', auth, authAdmin, orderCtrl.updateOrder);

router.delete('/delete/:id', auth, authAdmin, orderCtrl.deleteOrder);

module.exports = router;