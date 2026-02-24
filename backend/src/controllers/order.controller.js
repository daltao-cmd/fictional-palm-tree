const orderService = require('../services/order.service');
class OrderController {
  async create(req, res, next) { try { res.status(201).json(await orderService.create(req.body, req.user.id)); } catch (err) { next(err); } }
  async myOrders(req, res, next) { try { res.json(await orderService.getUserOrders(req.user.id)); } catch (err) { next(err); } }
  async storeOrders(req, res, next) { try { res.json(await orderService.getStoreOrders(req.params.storeId, req.user.id)); } catch (err) { next(err); } }
  async updateStatus(req, res, next) { try { res.json(await orderService.updateStatus(req.params.id, req.body.status, req.user.id)); } catch (err) { next(err); } }
}
module.exports = new OrderController();
