const authService = require('../services/auth.service');
class AuthController {
  async register(req, res, next) { try { res.status(201).json(await authService.register(req.body)); } catch (err) { next(err); } }
  async login(req, res, next) { try { res.json(await authService.login(req.body)); } catch (err) { next(err); } }
  async me(req, res) { const { password, ...user } = req.user; res.json(user); }
}
module.exports = new AuthController();
