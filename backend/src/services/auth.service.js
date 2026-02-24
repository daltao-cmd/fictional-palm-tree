const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');

class AuthService {
  async register({ name, email, password, role = 'CONSUMER' }) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw Object.assign(new Error('E-mail já cadastrado'), { status: 409 });
    const hashed = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    const token = this._generateToken(user.id);
    return { user, token };
  }

  async login({ email, password }) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw Object.assign(new Error('Credenciais inválidas'), { status: 401 });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw Object.assign(new Error('Credenciais inválidas'), { status: 401 });
    const { password: _, ...safeUser } = user;
    return { user: safeUser, token: this._generateToken(user.id) };
  }

  _generateToken(userId) {
    return jwt.sign({ sub: userId }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
  }
}

module.exports = new AuthService();
