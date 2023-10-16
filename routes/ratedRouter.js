const router = require('express').Router();
const ratedCtrl = require('../controllers/ratedCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.get('/', ratedCtrl.getRateds);

router.get('/:id', ratedCtrl.getRated);

router.get('/product/:id', ratedCtrl.getRatedByProduct);

router.post('/add', auth, ratedCtrl.createRated);

router.patch('/edit/:id', auth, authAdmin, ratedCtrl.updateRated);

router.delete('/delete/:id', auth, authAdmin, ratedCtrl.deleteRated);


module.exports = router;