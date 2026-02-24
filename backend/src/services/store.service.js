const prisma = require('../config/prisma');

const isStoreOpen = (openTime, closeTime) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openH, openM] = openTime.split(':').map(Number);
  const [closeH, closeM] = closeTime.split(':').map(Number);
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  if (closeMinutes < openMinutes) {
    return currentMinutes >= openMinutes || currentMinutes < closeMinutes;
  }
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
};

const addIsOpen = (store) => ({ ...store, isOpen: isStoreOpen(store.openTime, store.closeTime) });

class StoreService {
  async getOpenStores() {
    const stores = await prisma.store.findMany({
      include: { admin: { select: { name: true } }, _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return stores.map(addIsOpen).filter((s) => s.isOpen);
  }

  async getAllStores(adminId) {
    const stores = await prisma.store.findMany({
      where: { adminId },
      include: { _count: { select: { products: true, orders: true } } },
      orderBy: { createdAt: 'desc' },
    });
    return stores.map(addIsOpen);
  }

  async getById(id) {
    const store = await prisma.store.findUniqueOrThrow({
      where: { id },
      include: { admin: { select: { name: true } }, products: { where: { available: true }, orderBy: { name: 'asc' } } },
    });
    return addIsOpen(store);
  }

  async create(data, adminId) { return prisma.store.create({ data: { ...data, adminId } }); }

  async update(id, data, adminId) {
    await this._assertOwnership(id, adminId);
    return prisma.store.update({ where: { id }, data });
  }

  async delete(id, adminId) {
    await this._assertOwnership(id, adminId);
    return prisma.store.delete({ where: { id } });
  }

  async _assertOwnership(id, adminId) {
    const store = await prisma.store.findUniqueOrThrow({ where: { id } });
    if (store.adminId !== adminId) throw Object.assign(new Error('Acesso não autorizado'), { status: 403 });
  }
}

module.exports = new StoreService();
