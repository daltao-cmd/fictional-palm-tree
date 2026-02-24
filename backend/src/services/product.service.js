const prisma = require('../config/prisma');

class ProductService {
  async getByStore(storeId) {
    return prisma.product.findMany({
      where: { storeId },
      orderBy: [{ available: 'desc' }, { name: 'asc' }],
    });
  }

  async create(data, adminId) {
    const store = await prisma.store.findUniqueOrThrow({ where: { id: data.storeId } });
    if (store.adminId !== adminId) throw Object.assign(new Error('Acesso negado'), { status: 403 });
    return prisma.product.create({ data });
  }

  async update(id, data, adminId) {
    await this._assertOwnership(id, adminId);
    return prisma.product.update({ where: { id }, data });
  }

  async delete(id, adminId) {
    await this._assertOwnership(id, adminId);
    return prisma.product.delete({ where: { id } });
  }

  async _assertOwnership(id, adminId) {
    const product = await prisma.product.findUniqueOrThrow({
      where: { id },
      include: { store: { select: { adminId: true } } },
    });
    if (product.store.adminId !== adminId) throw Object.assign(new Error('Acesso negado'), { status: 403 });
  }
}

module.exports = new ProductService();
