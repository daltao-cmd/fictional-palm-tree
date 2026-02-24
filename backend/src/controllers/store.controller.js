const storeService = require('../services/store.service');
class StoreController {
  async getOpen(req, res, next) { try { res.json(await storeService.getOpenStores()); } catch (err) { next(err); } }
  async getById(req, res, next) { try { res.json(await storeService.getById(req.params.id)); } catch (err) { next(err); } }
  async getMyStores(req, res, next) { try { res.json(await storeService.getAllStores(req.user.id)); } catch (err) { next(err); } }
  async create(req, res, next) { try { res.status(201).json(await storeService.create(req.body, req.user.id)); } catch (err) { next(err); } }
  async update(req, res, next) { try { res.json(await storeService.update(req.params.id, req.body, req.user.id)); } catch (err) { next(err); } }
  async delete(req, res, next) { try { await storeService.delete(req.params.id, req.user.id); res.status(204).end(); } catch (err) { next(err); } }
}
module.exports = new StoreController();
