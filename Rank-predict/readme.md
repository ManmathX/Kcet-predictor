# Toppermode KCET Predictor

Toppermode KCET Predictor is a React-based web application that helps Karnataka Common Entrance Test (KCET) aspirants predict their engineering college admission chances based on the official 2025 third-round ROK cutoff dataset.

## 🚀 Features

- **Score & Rank Prediction**: Estimate your rank from your expected KCET score, or directly input your known official rank.
- **Advanced Filtering**: Filter options by seat type/category, branch groups (e.g., CSE, ECE), and cities.
- **Admissions Categorization**: Programs are intelligently classified into **Safe**, **Likely**, **Borderline**, or **Reach** based on your rank and historical cutoffs.
- **College Shortlisting**: Save and track your target colleges in a personal shortlist.
- **PDF Export**: Generate a downloadable, professional PDF report of your saved college shortlist.
- **User Authentication**: Secure Google Sign-In integration for profile management.

## 🛠️ Tech Stack

- **Frontend Framework**: React 19 + Vite
- **Styling**: Vanilla CSS
- **PDF Generation**: `jspdf` & `jspdf-autotable`
- **Data**: Local JSON dataset containing KCET cutoffs, college codes, and branch data.

## ⚙️ Getting Started

### Prerequisites

Ensure you have Node.js installed (v18+ recommended).

### Installation

1. Clone the repository and navigate to the project folder:
   ```bash
   cd Rank-predict
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173` (or the port provided by Vite).

## 📂 Project Structure

- `src/App.jsx`: Main application logic, including prediction algorithms and UI components.
- `src/index.css`: Styles for the application.
- `src/data.json`: The core dataset containing the KCET cutoffs, colleges, courses, and seat types.
- `legacy.html`: Previous version reference.

## 📝 Disclaimer

This tool is designed for educational and guidance purposes only. The predictions are based on historical 2025 third-round cutoffs and do not guarantee actual admission.
