const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authenticate } = require('../middlewares/auth.middleware');
router.post('/register', ctrl.register.bind(ctrl));
router.post('/login', ctrl.login.bind(ctrl));
router.get('/me', authenticate, ctrl.me.bind(ctrl));
module.exports = router;
