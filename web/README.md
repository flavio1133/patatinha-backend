# Patatinha Petshop 🐾

Sistema completo de gestão para petshops, desenvolvido com React no frontend e Node.js no backend.

## 📋 Sobre o Projeto

O Patatinha é uma plataforma que permite:
- 👥 Gerenciamento de clientes e seus pets
- 📅 Agendamento de serviços (banho, tosa, consultas)
- 💰 Controle financeiro e fluxo de caixa
- 📦 Gestão de estoque de produtos
- 🔐 Autenticação com diferentes níveis de acesso (super_admin, master, manager, employee, customer)

## 🏗️ Arquitetura

- **Frontend (Web):** React + Vite (hospedado no Firebase Hosting)
- **Frontend (Mobile):** React Native (em desenvolvimento)
- **Backend:** Node.js + Express (hospedado no Render)
- **Banco de dados:** PostgreSQL (gerenciado pelo Render)
- **Autenticação:** JWT + bcrypt

## 🚀 Como executar

### Pré-requisitos
- Node.js 18+ instalado
- npm ou yarn
- PostgreSQL (para desenvolvimento local)

### Backend

```bash
cd backend
npm install
cp .env.example .env  # Configure suas variáveis
npm run dev