# Predictors 2.0

![React](https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/tailwindcss-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Google Sheets](https://img.shields.io/badge/Google%20Sheets-34A853?style=for-the-badge&logo=google-sheets&logoColor=white)
![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)

Predictors 2.0 is a Next-Generation **Karnataka Common Entrance Test (KCET)** rank predictor and college research tool built with modern web technologies. It serves as a comprehensive platform for students to discover their potential engineering college matches based on their KCET rank, category, and course preferences.

## ✨ Features

- **Smart College Matching**: Advanced algorithms to find the best-fit colleges based on rank percentiles and cutoffs.
- **Comprehensive Database**: Detailed information on 200+ colleges and 100+ engineering courses with historic data.
- **Google Sheets Integration**: Real-time data synchronization and offline support via Google Apps Script.
- **Modern UI/UX**:
  - **Collapsible Sidebar**: Easy navigation with auto-hide sidebar on mobile.
  - **Dark & Light Mode**: Auto-detects system preference or allows manual switching.
  - **Smooth Animations**: Subtle transitions for a premium feel.
- **User Management**:
  - **Profile Persistence**: Saves user data locally using `localStorage`.
  - **Google Sign-In**: One-click login with Google for cross-device sync.
- **Data Visualization**:
  - **Responsive Tables**: Grid layout that adapts to different screen sizes.
  - **Export Options**: Generate PDF reports of selected colleges.
- **Advanced Filtering**:
  - **Multi-Select**: Select multiple courses and colleges simultaneously.
  - **Category Filters**: Filter by HKR, Rural, GM, and other categories.

## 🚀 Tech Stack

- **Framework**: [React](https://react.dev/) (v19)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (optional, used in frontend code)
- **Styling**:
  - [Tailwind CSS](https://tailwindcss.com/)
  - [CSS Modules](https://github.com/css-modules/css-modules)
- **PDF Generation**: [jspdf](https://github.com/parallax/jsPDF) + [jspdf-autotable](https://github.com/simonbengtsson/jsPDF-AutoTable)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Data Storage**:
  - `localStorage` for persistence.
  - Google Sheets for cloud sync.

## 📁 Project Structure

```
Predictors2.0/
├── Rank-predict/
│   ├── src/
│   │   ├── assets/          # Static assets like images, logos
│   │   ├── components/      # Reusable UI components
│   │   │   ├── CollegeCard.jsx
│   │   │   ├── CollegeDetail.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Header.jsx
│   │   │   ├── Modal.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── QuickActions.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   └── MultiSelectDropdown.jsx
│   │   ├── data/
│   │   │   ├── courses.js       # Course definitions
│   │   │   └── selected_colleges.js # College data
│   │   ├── App.jsx          # Main application component
│   │   ├── index.css          # Global styles
│   │   ├── index.html         # HTML entry point
│   │   └── main.jsx         # React entry point
│   ├── package.json
│   └── index.html           # V2-specific entry
├── google-apps-script/      # Google Apps Script implementations
│   ├── google-apps-script.js  # Main data sync script
│   ├── google-apps-script-report.js # Report submission script
│   └── google-apps-script-feedback.js # Feedback script
├── GOOGLE_CREDENTIALS.md    # Guide to setting up Google OAuth
├── GOOGLE_SHEET_Setup.md    # Instructions for Google Sheets integration
├── data_schema.md           # Database schema and architecture
├── LICENSE                  # Project license
└── README.md                  # This file
```

## 🔧 Setup

### Prerequisites
- **Node.js** (v16 or higher)
- **npm** (or yarn/pnpm)

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/ManmathX/Predictors2.0.git
    cd Predictors2.0/Rank-predict
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  **Configure Google Sheets Integration**:
    - Follow the instructions in [GOOGLE_SHEET_Setup.md](GOOGLE_SHEET_Setup.md).
    - Deploy the Google Apps Scripts to your own Google Sheets.
    - Update the webhook URLs in `Rank-predict/src/App.jsx`.

4.  Start the development server:
    ```bash
    npm run dev
    ```

5.  Open your browser and navigate to [http://localhost:5173](http://localhost:5173).

### Environment Variables
No environment variables are required for basic functionality. However, if you want to use different Google Sheets or OAuth credentials, you'll need to update `Rank-predict/src/App.jsx` directly or set up environment variables if you configure `dotenv`.

## 🛠 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Starts the development server |
| `npm run build` | Builds the application for production |
| `npm run preview` | Previews the production build |
| `npm run lint` | Runs ESLint to check for code quality issues |

### Adding New Colleges
To add new colleges, update the `selected_colleges.js` file in the `data/` directory with the new college data.

### Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

We welcome contributions from the open-source community. To contribute:

1.  Fork the repository.
2.  Create a new branch for your feature (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## 📞 Support & Contact

For questions or support, please open an issue on the GitHub repository.

---

Built with ❤️ | Inspired by KCET aspirants