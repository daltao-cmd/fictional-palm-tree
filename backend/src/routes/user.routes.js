const router = require('express').Router();
const prisma = require('../config/prisma');
const { authenticate, authorize } = require('../middlewares/auth.middleware');
router.get('/', authenticate, authorize('ADMIN'), async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    res.json(users);
  } catch (err) { next(err); }
});
module.exports = router;
