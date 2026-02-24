const router = require('express').Router();
const ctrl = require('../controllers/product.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
router.get('/store/:storeId', ctrl.getByStore.bind(ctrl));
router.post('/', authenticate, authorize('ADMIN'), ctrl.create.bind(ctrl));
router.put('/:id', authenticate, authorize('ADMIN'), ctrl.update.bind(ctrl));
router.delete('/:id', authenticate, authorize('ADMIN'), ctrl.delete.bind(ctrl));
module.exports = router;
