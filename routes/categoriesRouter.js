const router = require('express').Router();
const categoriesCtrl = require('../controllers/categoriesCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.get('/', categoriesCtrl.getCategories);

router.post('/add', auth, authAdmin, categoriesCtrl.createCategory);

router.patch('/update/:id', auth, authAdmin, categoriesCtrl.updateCategory);

router.delete('/delete/:id', auth, authAdmin, categoriesCtrl.deleteCategory);


module.exports = router;