# 🛵 DeliveryApp – Plataforma Multi-Loja

Sistema completo de delivery multi-loja com painel administrativo, autenticação JWT e regras de horário automáticas.

## 🏗️ Arquitetura

```
delivery-app/
├── backend/                  # Node.js + Express + Prisma
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   └── src/
│       ├── server.js
│       ├── app.js
│       ├── config/
│       ├── controllers/
│       ├── services/
│       ├── routes/
│       └── middlewares/
├── frontend/                 # React 18
│   └── src/
│       ├── App.js
│       ├── App.css
│       ├── contexts/
│       └── services/
└── docker-compose.yml
```

## 🚀 Como Rodar

```bash
docker-compose up --build
```

Acesse: http://localhost:3000

## 👤 Usuários de Teste

| Role     | Email                   | Senha       |
|----------|-------------------------|-------------|
| Admin    | admin@delivery.com      | admin123    |
| Consumer | user@delivery.com       | consumer123 |
