const router = require('express').Router();
const addressCtrl = require('../controllers/addressCtrl');
const auth = require('../middlewares/auth');

router.route('/')
    .get(addressCtrl.getAddress)
    .post(auth, addressCtrl.createAddress);

router.route('/:id')
    .get(addressCtrl.getAddressById)
    .put(auth, addressCtrl.updateAddress)
    .delete(auth, addressCtrl.deleteAddress);

// updateDefaultAddress
router.route('/default')
    .patch(auth, addressCtrl.updateDefaultAddress);

router.route('/user')
    .get(auth, addressCtrl.getAddressByUserId);

module.exports = router;