const router = require('express').Router();
const userCtrl = require('../controllers/userCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.post('/register', userCtrl.register);

router.post('/login', userCtrl.login);

router.get('/logout', userCtrl.logout);

router.get('/refresh_token', userCtrl.refreshToken);

router.get('/info', auth, userCtrl.viewProfile);

router.get('/all_info', auth, authAdmin, userCtrl.getAllUsers);

router.get('/:id', auth, authAdmin, userCtrl.getUser);

router.patch('/update', auth, userCtrl.updateProfile);

router.patch('/change_password', auth, userCtrl.changePassword);

router.patch('/edit/:id', auth, authAdmin, userCtrl.updateUser);

router.delete('/delete/:id', auth, authAdmin, userCtrl.deleteUser);



module.exports = router;