const router = require('express').Router();
const addressCtrl = require('../controllers/addressCtrl');
const auth = require('../middlewares/auth');

router.route('/')
    .get(auth, addressCtrl.getAddress)

router.get('/id/:id', auth, addressCtrl.getAddressById);

router.get('/user-address', auth, addressCtrl.getAddressByUserId);

router.post('/add', auth, addressCtrl.createAddress);

router.patch('/default', auth, addressCtrl.updateDefaultAddress);

router.patch('/update/:id', auth, addressCtrl.updateAddress);

router.delete('/delete/:id', auth, addressCtrl.deleteAddress);


module.exports = router;