const router = require('express').Router();
const contactCtrl = require('../controllers/contactCtrl');
const auth = require('../middlewares/auth');
const authAdmin = require('../middlewares/authAdmin');

router.route('/')
    .get(auth, authAdmin, contactCtrl.getContacts)
    .post(contactCtrl.createContact);

router.route('/:id')
    .get(auth, authAdmin, contactCtrl.getContact)
    .patch(auth, authAdmin, contactCtrl.updateContact)
    .delete(auth, authAdmin, contactCtrl.deleteContact);

module.exports = router;