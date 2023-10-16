const router = require('express').Router();
const warehouseCtrl = require('../controllers/warehouseCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');


router.post('/in', auth, authAdmin, warehouseCtrl.updateProductStockIn);

router.post('/out', auth, authAdmin, warehouseCtrl.updateProductStockOut);

router.get('/', auth, authAdmin, warehouseCtrl.getWarehouseEntries);


module.exports = router;