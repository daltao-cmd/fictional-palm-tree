const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@delivery.com' },
    update: {},
    create: { name: 'Admin', email: 'admin@delivery.com', password: adminPassword, role: 'ADMIN' },
  });

  const consumerPassword = await bcrypt.hash('consumer123', 10);
  await prisma.user.upsert({
    where: { email: 'user@delivery.com' },
    update: {},
    create: { name: 'João Silva', email: 'user@delivery.com', password: consumerPassword, role: 'CONSUMER' },
  });

  await prisma.store.create({
    data: {
      name: 'Pizzaria Bella Napoli',
      description: 'As melhores pizzas artesanais da cidade',
      openTime: '18:00', closeTime: '23:30', adminId: admin.id,
      products: { create: [
        { name: 'Pizza Margherita', description: 'Molho de tomate, mozzarella e manjericão', price: 45.90, available: true },
        { name: 'Pizza Calabresa', description: 'Calabresa fatiada com cebola', price: 49.90, available: true },
        { name: 'Pizza Quatro Queijos', description: 'Mozzarella, parmesão, gorgonzola e catupiry', price: 55.90, available: true },
      ]},
    },
  });

  await prisma.store.create({
    data: {
      name: 'Burger House',
      description: 'Hambúrgueres artesanais com ingredientes frescos',
      openTime: '11:00', closeTime: '22:00', adminId: admin.id,
      products: { create: [
        { name: 'Classic Burger', description: '180g de carne, queijo, alface e tomate', price: 32.90, available: true },
        { name: 'BBQ Burger', description: '180g de carne, queijo, bacon e molho BBQ', price: 39.90, available: true },
        { name: 'Batata Frita', description: 'Porção de batata frita crocante', price: 18.90, available: true },
      ]},
    },
  });

  await prisma.store.create({
    data: {
      name: 'Sushi Zen',
      description: 'Culinária japonesa autêntica',
      openTime: '12:00', closeTime: '23:00', adminId: admin.id,
      products: { create: [
        { name: 'Combinado Executivo (20 peças)', description: 'Seleção do chef', price: 68.90, available: true },
        { name: 'Temaki Salmão', description: 'Cone de alga com arroz e salmão fresco', price: 28.90, available: true },
      ]},
    },
  });

  console.log('✅ Seed completed!');
}

main().catch(console.error).finally(async () => { await prisma.$disconnect(); });
