const router = require('express').Router();
const promotionCtrl = require('../controllers/promotionCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');


router.get('/', auth, authAdmin, promotionCtrl.getPromotions);

router.get('/:id', auth, authAdmin, promotionCtrl.getPromotion);

router.post('/', auth, authAdmin, promotionCtrl.createPromotion);

router.patch('/:id', auth, authAdmin, promotionCtrl.updatePromotion);

router.delete('/:id', auth, authAdmin, promotionCtrl.deletePromotion);


module.exports = router;