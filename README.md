# KCET Predictors 2.0

![React](https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Vite](https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)

Predictors 2.0 is a Next-Generation **Karnataka Common Entrance Test (KCET)** rank predictor and college research tool. It provides students with a comprehensive platform to discover engineering college matches based on their KCET rank, category, and course preferences using 2025 Round 3 cutoff data.

## 🏗 System Architecture

The project is divided into three main services:

1.  **[Rank-predict](./Rank-predict)**: The main student-facing predictor frontend.
2.  **[rank-backend](./rank-backend)**: Express/Node.js API and MongoDB database for college data.
3.  **[adminwebsite](./adminwebsite)**: An administrative portal for managing college data and publication status.

## ✨ Key Features

- **2025 Data Accuracy**: Pre-loaded with official KCET 2025 Round 3 cutoff data.
- **High-Density UI**: Professional grid views for courses and cutoffs with mobile-responsive design.
- **Publication Workflow**: Admins can manage college details in "Draft" mode before pushing to live users.
- **Global Search**: Instantly find any of the 228+ colleges by name, code, or location.
- **Smart Filters**: Multi-select support for branches, categories, and specializations.

## 📁 Project Structure

```bash
Predictors2.0/
├── Rank-predict/      # Student Predictor Frontend (Vite + React)
├── rank-backend/      # API Server (Node.js + Express + MongoDB)
├── adminwebsite/      # Admin Management Portal (Vite + React)
└── data.json          # Master cutoff data (Round 3, 2025)
```

## 🚀 Quick Start

### 1. Backend Setup
```bash
cd rank-backend
npm install
cp .env.example .env # Configure your MongoDB URI
node seed-colleges.js # Import data.json into MongoDB
npm run dev
```

### 2. Predictor Setup
```bash
cd Rank-predict
npm install
cp .env.example .env # Set VITE_API_URL=http://localhost:5001/api
npm run dev
```

### 3. Admin Panel Setup
```bash
cd adminwebsite
npm install
cp .env.example .env # Set VITE_API_URL=http://localhost:5001/api
npm run dev
```

## 🛠 Tech Stack

- **Frontend**: React 19, Vite 8, Vanilla CSS (Premium Aesthetics)
- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB (Atlas)
- **Deployment**: Vercel / Railway

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---
Built with ❤️ | Inspired by KCET aspirants