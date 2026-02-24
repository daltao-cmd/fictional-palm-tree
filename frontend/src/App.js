// src/App.js
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider, useCart } from './contexts/CartContext';
import { storesAPI, productsAPI, ordersAPI } from './services/api';
import './App.css';

// ── Helpers ──────────────────────────────────────────────
const fmt = (v) => Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const statusLabel = { PENDING: 'Pendente', PREPARING: 'Preparando', DELIVERED: 'Entregue', CANCELLED: 'Cancelado' };
const statusColor = { PENDING: '#f59e0b', PREPARING: '#3b82f6', DELIVERED: '#22c55e', CANCELLED: '#ef4444' };

// ── Protected Routes ──────────────────────────────────────
function RequireAuth({ children, role }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

// ── Layout ────────────────────────────────────────────────
function Navbar() {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <Link to="/" className="brand">🛵 DeliveryApp</Link>
      <div className="nav-links">
        {user ? (
          <>
            {user.role === 'ADMIN' ? (
              <Link to="/admin">Painel Admin</Link>
            ) : (
              <>
                <Link to="/orders">Meus Pedidos</Link>
                <Link to="/cart" className="cart-btn">
                  🛒 {count > 0 && <span className="badge">{count}</span>}
                </Link>
              </>
            )}
            <button onClick={() => { logout(); navigate('/'); }} className="btn-ghost">
              Sair ({user.name.split(' ')[0]})
            </button>
          </>
        ) : (
          <>
            <Link to="/login">Entrar</Link>
            <Link to="/register" className="btn-primary">Cadastrar</Link>
          </>
        )}
      </div>
    </nav>
  );
}

// ── Pages ─────────────────────────────────────────────────

function HomePage() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    storesAPI.getOpen().then(setStores).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page">
      <div className="hero">
        <h1>Lojas Abertas Agora</h1>
        <p>Peça dos seus restaurantes favoritos com entrega rápida</p>
      </div>
      {loading ? <div className="loading">Buscando lojas...</div> : (
        stores.length === 0 ? (
          <div className="empty-state">
            <span>🏪</span>
            <p>Nenhuma loja aberta no momento. Tente mais tarde!</p>
          </div>
        ) : (
          <div className="grid">
            {stores.map((store) => (
              <Link to={`/store/${store.id}`} key={store.id} className="store-card">
                <div className="store-img">🍕</div>
                <div className="store-info">
                  <h3>{store.name}</h3>
                  <p>{store.description}</p>
                  <div className="store-meta">
                    <span className="badge-open">✅ Aberta</span>
                    <span className="hours">⏰ {store.openTime} – {store.closeTime}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )
      )}
    </div>
  );
}

function StorePage() {
  const { id } = useParams();
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    storesAPI.getById(id).then(setStore).finally(() => setLoading(false));
  }, [id]);

  const handleAdd = (product) => {
    if (!user) { navigate('/login'); return; }
    addItem(product, store.id, store.name);
  };

  if (loading) return <div className="loading">Carregando...</div>;
  if (!store) return <div className="empty-state"><p>Loja não encontrada</p></div>;

  return (
    <div className="page">
      <div className="store-header">
        <Link to="/" className="back-link">← Voltar</Link>
        <h1>{store.name}</h1>
        <p>{store.description}</p>
        <span className={store.isOpen ? 'badge-open' : 'badge-closed'}>
          {store.isOpen ? '✅ Aberta' : '🔴 Fechada'}
        </span>
        <span className="hours">⏰ {store.openTime} – {store.closeTime}</span>
      </div>

      <h2 style={{ marginTop: '2rem' }}>Cardápio</h2>
      {!store.products?.length ? (
        <div className="empty-state"><p>Sem produtos cadastrados</p></div>
      ) : (
        <div className="grid">
          {store.products.map((p) => (
            <div key={p.id} className={`product-card ${!p.available ? 'unavailable' : ''}`}>
              <div className="product-img">🍔</div>
              <div className="product-info">
                <h3>{p.name}</h3>
                <p>{p.description}</p>
                <div className="product-footer">
                  <strong className="price">{fmt(p.price)}</strong>
                  {p.available && store.isOpen ? (
                    <button className="btn-primary" onClick={() => handleAdd(p)}>+ Adicionar</button>
                  ) : (
                    <span className="badge-closed">{!p.available ? 'Indisponível' : 'Fechada'}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CartPage() {
  const { cart, removeItem, updateQuantity, clearCart, total } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCheckout = async () => {
    if (!cart.items.length) return;
    setLoading(true); setError('');
    try {
      await ordersAPI.create({
        storeId: cart.storeId,
        items: cart.items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      });
      clearCart();
      navigate('/orders');
    } catch (e) {
      setError(e.error || 'Erro ao finalizar pedido');
    } finally {
      setLoading(false);
    }
  };

  if (!cart.items.length) return (
    <div className="page">
      <div className="empty-state">
        <span>🛒</span>
        <p>Seu carrinho está vazio</p>
        <Link to="/" className="btn-primary">Ver Lojas</Link>
      </div>
    </div>
  );

  return (
    <div className="page narrow">
      <h1>Seu Carrinho</h1>
      <p className="subtitle">Loja: <strong>{cart.storeName}</strong></p>
      {error && <div className="error-box">{error}</div>}
      <div className="cart-items">
        {cart.items.map((item) => (
          <div key={item.id} className="cart-item">
            <div className="cart-item-info">
              <h3>{item.name}</h3>
              <span>{fmt(item.price)}</span>
            </div>
            <div className="quantity-ctrl">
              <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>−</button>
              <span>{item.quantity}</span>
              <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
            </div>
            <div className="item-subtotal">{fmt(Number(item.price) * item.quantity)}</div>
            <button className="remove-btn" onClick={() => removeItem(item.id)}>✕</button>
          </div>
        ))}
      </div>
      <div className="cart-total">
        <span>Total</span>
        <strong>{fmt(total)}</strong>
      </div>
      <button className="btn-primary full" onClick={handleCheckout} disabled={loading}>
        {loading ? 'Finalizando...' : '✅ Finalizar Pedido'}
      </button>
    </div>
  );
}

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    ordersAPI.myOrders().then(setOrders).finally(() => setLoading(false));
  }, []);

  return (
    <div className="page narrow">
      <h1>Meus Pedidos</h1>
      {loading ? <div className="loading">Carregando...</div> : orders.length === 0 ? (
        <div className="empty-state">
          <span>📦</span>
          <p>Nenhum pedido ainda</p>
          <Link to="/" className="btn-primary">Fazer Primeiro Pedido</Link>
        </div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>{order.store.name}</h3>
                <small>{new Date(order.createdAt).toLocaleString('pt-BR')}</small>
              </div>
              <span className="status-badge" style={{ background: statusColor[order.status] }}>
                {statusLabel[order.status]}
              </span>
            </div>
            <div className="order-items">
              {order.orderItems.map((oi, i) => (
                <div key={i} className="order-item-line">
                  <span>{oi.quantity}x {oi.product.name}</span>
                  <span>{fmt(Number(oi.unitPrice) * oi.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="order-total">
              <strong>Total: {fmt(order.totalPrice)}</strong>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const user = await login(form);
      navigate(user.role === 'ADMIN' ? '/admin' : '/');
    } catch (e) {
      setError(e.error || 'Credenciais inválidas');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Entrar</h1>
        {error && <div className="error-box">{error}</div>}
        <div className="hint-box">
          <p>🔑 <strong>Admin:</strong> admin@delivery.com / admin123</p>
          <p>👤 <strong>Cliente:</strong> user@delivery.com / consumer123</p>
        </div>
        <label>E-mail
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>Senha
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
        </label>
        <button className="btn-primary full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
        <p className="auth-link">Não tem conta? <Link to="/register">Cadastre-se</Link></p>
      </form>
    </div>
  );
}

function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await register({ ...form, role: 'CONSUMER' });
      navigate('/');
    } catch (e) {
      setError(e.error || 'Erro ao criar conta');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1>Criar Conta</h1>
        {error && <div className="error-box">{error}</div>}
        <label>Nome
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </label>
        <label>E-mail
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </label>
        <label>Senha
          <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} />
        </label>
        <button className="btn-primary full" disabled={loading}>{loading ? 'Criando...' : 'Criar Conta'}</button>
        <p className="auth-link">Já tem conta? <Link to="/login">Entrar</Link></p>
      </form>
    </div>
  );
}

// ── Admin Pages ───────────────────────────────────────────

function AdminPanel() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', openTime: '08:00', closeTime: '22:00' });
  const [submitting, setSubmitting] = useState(false);

  const refresh = () => storesAPI.getMyStores().then(setStores).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, []);

  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', openTime: '08:00', closeTime: '22:00' }); setShowForm(true); };
  const openEdit = (s) => { setEditing(s); setForm({ name: s.name, description: s.description || '', openTime: s.openTime, closeTime: s.closeTime }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      editing ? await storesAPI.update(editing.id, form) : await storesAPI.create(form);
      setShowForm(false);
      refresh();
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deletar esta loja?')) return;
    await storesAPI.delete(id);
    refresh();
  };

  return (
    <div className="page">
      <div className="admin-header">
        <h1>Painel Admin</h1>
        <button className="btn-primary" onClick={openCreate}>+ Nova Loja</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editing ? 'Editar Loja' : 'Nova Loja'}</h2>
            <label>Nome <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Descrição <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></label>
            <div className="form-row">
              <label>Abre <input type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} required /></label>
              <label>Fecha <input type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} required /></label>
            </div>
            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={submitting}>Salvar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="loading">Carregando...</div> : stores.length === 0 ? (
        <div className="empty-state"><span>🏪</span><p>Nenhuma loja criada ainda</p></div>
      ) : (
        <div className="admin-grid">
          {stores.map((s) => (
            <div key={s.id} className="admin-store-card">
              <div className="admin-store-header">
                <div>
                  <h3>{s.name}</h3>
                  <p>{s.description}</p>
                </div>
                <span className={s.isOpen ? 'badge-open' : 'badge-closed'}>{s.isOpen ? 'Aberta' : 'Fechada'}</span>
              </div>
              <div className="store-stats">
                <span>⏰ {s.openTime} – {s.closeTime}</span>
                <span>📦 {s._count?.products || 0} produtos</span>
                <span>🧾 {s._count?.orders || 0} pedidos</span>
              </div>
              <div className="admin-actions">
                <Link to={`/admin/store/${s.id}`} className="btn-ghost">Gerenciar Produtos</Link>
                <Link to={`/admin/orders/${s.id}`} className="btn-ghost">Ver Pedidos</Link>
                <button className="btn-ghost" onClick={() => openEdit(s)}>Editar</button>
                <button className="btn-danger" onClick={() => handleDelete(s.id)}>Deletar</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminProducts() {
  const { id: storeId } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', available: true });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    storesAPI.getById(storeId).then(setStore);
    refresh();
  }, [storeId]);

  const refresh = () => productsAPI.getByStore(storeId).then(setProducts);
  const openCreate = () => { setEditing(null); setForm({ name: '', description: '', price: '', available: true }); setShowForm(true); };
  const openEdit = (p) => { setEditing(p); setForm({ name: p.name, description: p.description || '', price: p.price, available: p.available }); setShowForm(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const data = { ...form, price: Number(form.price), storeId };
      editing ? await productsAPI.update(editing.id, data) : await productsAPI.create(data);
      setShowForm(false);
      refresh();
    } finally { setSubmitting(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Deletar produto?')) return;
    await productsAPI.delete(id);
    refresh();
  };

  return (
    <div className="page">
      <Link to="/admin" className="back-link">← Voltar</Link>
      <div className="admin-header">
        <h1>Produtos – {store?.name}</h1>
        <button className="btn-primary" onClick={openCreate}>+ Novo Produto</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
            <h2>{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
            <label>Nome <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
            <label>Descrição <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></label>
            <label>Preço (R$) <input type="number" step="0.01" min="0" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required /></label>
            <label className="checkbox-label">
              <input type="checkbox" checked={form.available} onChange={(e) => setForm({ ...form, available: e.target.checked })} />
              Disponível
            </label>
            <div className="form-actions">
              <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancelar</button>
              <button type="submit" className="btn-primary" disabled={submitting}>Salvar</button>
            </div>
          </form>
        </div>
      )}

      {products.length === 0 ? (
        <div className="empty-state"><span>🍽️</span><p>Nenhum produto cadastrado</p></div>
      ) : (
        <div className="products-table">
          <table>
            <thead>
              <tr><th>Produto</th><th>Preço</th><th>Status</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td><strong>{p.name}</strong><br /><small>{p.description}</small></td>
                  <td>{fmt(p.price)}</td>
                  <td><span className={p.available ? 'badge-open' : 'badge-closed'}>{p.available ? 'Disponível' : 'Indisponível'}</span></td>
                  <td>
                    <button className="btn-ghost sm" onClick={() => openEdit(p)}>Editar</button>
                    <button className="btn-danger sm" onClick={() => handleDelete(p.id)}>Deletar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminOrders() {
  const { storeId } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => ordersAPI.storeOrders(storeId).then(setOrders).finally(() => setLoading(false));
  useEffect(() => { refresh(); }, [storeId]);

  const handleStatus = async (id, status) => {
    await ordersAPI.updateStatus(id, status);
    refresh();
  };

  return (
    <div className="page narrow">
      <Link to="/admin" className="back-link">← Voltar</Link>
      <h1>Pedidos da Loja</h1>
      {loading ? <div className="loading">Carregando...</div> : orders.length === 0 ? (
        <div className="empty-state"><span>📋</span><p>Nenhum pedido ainda</p></div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-header">
              <div>
                <h3>{order.user.name}</h3>
                <small>{order.user.email}</small><br />
                <small>{new Date(order.createdAt).toLocaleString('pt-BR')}</small>
              </div>
              <span className="status-badge" style={{ background: statusColor[order.status] }}>
                {statusLabel[order.status]}
              </span>
            </div>
            <div className="order-items">
              {order.orderItems.map((oi, i) => (
                <div key={i} className="order-item-line">
                  <span>{oi.quantity}x {oi.product.name}</span>
                  <span>{fmt(Number(oi.unitPrice) * oi.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="order-total"><strong>Total: {fmt(order.totalPrice)}</strong></div>
            <div className="status-actions">
              {['PENDING', 'PREPARING', 'DELIVERED', 'CANCELLED'].map((s) => (
                <button
                  key={s}
                  className={`status-btn ${order.status === s ? 'active' : ''}`}
                  style={{ '--color': statusColor[s] }}
                  onClick={() => handleStatus(order.id, s)}
                  disabled={order.status === s}
                >
                  {statusLabel[s]}
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ── App Root ──────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/store/:id" element={<StorePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/cart" element={<RequireAuth><CartPage /></RequireAuth>} />
              <Route path="/orders" element={<RequireAuth role="CONSUMER"><OrdersPage /></RequireAuth>} />
              <Route path="/admin" element={<RequireAuth role="ADMIN"><AdminPanel /></RequireAuth>} />
              <Route path="/admin/store/:id" element={<RequireAuth role="ADMIN"><AdminProducts /></RequireAuth>} />
              <Route path="/admin/orders/:storeId" element={<RequireAuth role="ADMIN"><AdminOrders /></RequireAuth>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </main>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
