const router = require('express').Router();
const revenueCtrl = require('../controllers/revenueCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.get('/', auth, authAdmin, revenueCtrl.getRevenue);

router.post('/time', auth, authAdmin, revenueCtrl.getRevenueByTime);

router.get('/date/:date', auth, authAdmin, revenueCtrl.getRevenueByDate);

router.get('/month/:month', auth, authAdmin, revenueCtrl.getRevenueByMonth);

router.get('/year/:year', auth, authAdmin, revenueCtrl.getRevenueByYear);

router.get('/total', auth, authAdmin, revenueCtrl.getTotalRevenue);

router.get('/total/:date', auth, authAdmin, revenueCtrl.getTotalRevenueByDate);

router.get('/total/:month', auth, authAdmin, revenueCtrl.getTotalRevenueByMonth);

router.get('/total/:year', auth, authAdmin, revenueCtrl.getTotalRevenueByYear);

router.get('/quantity', auth, authAdmin, revenueCtrl.getQuantityRevenue);

router.get('/quantity/:date', auth, authAdmin, revenueCtrl.getQuantityRevenueByDate);

router.get('/quantity/:month', auth, authAdmin, revenueCtrl.getQuantityRevenueByMonth);

router.get('/quantity/:year', auth, authAdmin, revenueCtrl.getQuantityRevenueByYear);

router.post('/', auth, authAdmin, revenueCtrl.createRevenue);

router.put('/:id', auth, authAdmin, revenueCtrl.updateRevenue);

router.delete('/:id', auth, authAdmin, revenueCtrl.deleteRevenue);

router.delete('/', auth, authAdmin, revenueCtrl.deleteAllRevenue);


module.exports = router;