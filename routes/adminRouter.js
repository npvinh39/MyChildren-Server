const router = require('express').Router();
const adminCtrl = require('../controllers/adminCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.post('/register', adminCtrl.register);

router.post('/login', adminCtrl.login);

router.get('/logout', adminCtrl.logout);

router.get('/refresh_token', adminCtrl.refreshToken);

router.get('/info', auth, adminCtrl.viewProfile);

router.get('/all', auth, authAdmin, adminCtrl.getAllAdmins);

router.get('/:id', auth, authAdmin, adminCtrl.getAdmin);

router.patch('/edit/:id', auth, authAdmin, adminCtrl.updateAdmin);

router.delete('/delete/:id', auth, authAdmin, adminCtrl.deleteAdmin);

router.patch('/update', auth, authAdmin, adminCtrl.updateProfile);

router.patch('/change_password', auth, authAdmin, adminCtrl.changePassword);

router.patch('/update_password/:id', auth, authAdmin, adminCtrl.updatePassword);




module.exports = router;