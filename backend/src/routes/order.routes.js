const router = require('express').Router();
const ctrl = require('../controllers/order.controller');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
router.post('/', authenticate, authorize('CONSUMER'), ctrl.create.bind(ctrl));
router.get('/my', authenticate, ctrl.myOrders.bind(ctrl));
router.get('/store/:storeId', authenticate, authorize('ADMIN'), ctrl.storeOrders.bind(ctrl));
router.patch('/:id/status', authenticate, authorize('ADMIN'), ctrl.updateStatus.bind(ctrl));
module.exports = router;
