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
