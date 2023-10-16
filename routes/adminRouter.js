const router = require('express').Router();
const adminCtrl = require('../controllers/adminCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.post('/register', adminCtrl.register);

router.post('/login', adminCtrl.login);

router.get('/logout', adminCtrl.logout);

router.get('/refresh_token', adminCtrl.refreshToken);

router.get('/info', auth, adminCtrl.viewProfile);

router.get('/all_info', auth, authAdmin, adminCtrl.getAllAdmins);

router.patch('/update', auth, authAdmin, adminCtrl.updateProfile);

router.patch('/change_password', auth, authAdmin, adminCtrl.changePassword);




module.exports = router;