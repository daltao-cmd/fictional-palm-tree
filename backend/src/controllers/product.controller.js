const productService = require('../services/product.service');
class ProductController {
  async getByStore(req, res, next) { try { res.json(await productService.getByStore(req.params.storeId)); } catch (err) { next(err); } }
  async create(req, res, next) { try { res.status(201).json(await productService.create(req.body, req.user.id)); } catch (err) { next(err); } }
  async update(req, res, next) { try { res.json(await productService.update(req.params.id, req.body, req.user.id)); } catch (err) { next(err); } }
  async delete(req, res, next) { try { await productService.delete(req.params.id, req.user.id); res.status(204).end(); } catch (err) { next(err); } }
}
module.exports = new ProductController();
