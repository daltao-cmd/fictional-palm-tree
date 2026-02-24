const prisma = require('../config/prisma');
const storeService = require('./store.service');

class OrderService {
  async create({ storeId, items }, userId) {
    const store = await storeService.getById(storeId);
    if (!store.isOpen) throw Object.assign(new Error('Loja está fechada no momento'), { status: 400 });

    const productIds = items.map((i) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, storeId, available: true },
    });
    if (products.length !== items.length) {
      throw Object.assign(new Error('Um ou mais produtos inválidos ou indisponíveis'), { status: 400 });
    }

    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));
    let totalPrice = 0;
    const orderItems = items.map(({ productId, quantity }) => {
      const product = productMap[productId];
      const unitPrice = Number(product.price);
      totalPrice += unitPrice * quantity;
      return { productId, quantity, unitPrice };
    });

    return prisma.order.create({
      data: { userId, storeId, totalPrice, status: 'PENDING', orderItems: { create: orderItems } },
      include: { orderItems: { include: { product: { select: { name: true } } } }, store: { select: { name: true } } },
    });
  }

  async getUserOrders(userId) {
    return prisma.order.findMany({
      where: { userId },
      include: { store: { select: { id: true, name: true } }, orderItems: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getStoreOrders(storeId, adminId) {
    const store = await prisma.store.findUniqueOrThrow({ where: { id: storeId } });
    if (store.adminId !== adminId) throw Object.assign(new Error('Acesso negado'), { status: 403 });
    return prisma.order.findMany({
      where: { storeId },
      include: { user: { select: { name: true, email: true } }, orderItems: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(orderId, status, adminId) {
    const order = await prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { store: { select: { adminId: true } } },
    });
    if (order.store.adminId !== adminId) throw Object.assign(new Error('Acesso negado'), { status: 403 });
    return prisma.order.update({ where: { id: orderId }, data: { status } });
  }
}

module.exports = new OrderService();
