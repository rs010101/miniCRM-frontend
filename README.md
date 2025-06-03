# 🎨 MiniCRM Frontend

A modern, responsive frontend for the MiniCRM application, built with React, Tailwind CSS, and advanced state management.

## 🌟 Features

- 🎨 **Modern UI/UX**
  - Responsive design for all devices
  - Dark/Light theme support
  - Smooth animations and transitions
  - Interactive dashboards

- 🔐 **Authentication**
  - Google OAuth integration
  - Secure session management
  - Protected routes

- 📊 **Dashboard & Analytics**
  - Real-time data visualization
  - Interactive charts and graphs
  - Key performance indicators
  - Custom filtering and sorting

- 👥 **Customer Management**
  - Customer profile management
  - Search and filter capabilities
  - Bulk actions
  - Customer history tracking

- 📈 **Campaign Management**
  - Campaign creation wizard
  - AI-powered message generation
  - Real-time campaign metrics
  - Historical campaign data

- 🎯 **Segmentation Tools**
  - Dynamic segment creation
  - Rule-based customer targeting
  - Segment performance analytics

## 🛠️ Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Icons**: React Icons
- **Charts**: Recharts
- **Animations**: Framer Motion
- **Forms**: React Hook Form
- **Date Handling**: Day.js

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running

### Environment Setup 🛠️

1. Create a `.env` file in the root directory:
\`\`\`env
# API Configuration
BACKEND_URL=your_backend_url
FRONTEND_URL=your_frontend_url
GOOGLE_CLIENT_ID=your_google_client_id

### Installation Steps 📥

1. **Clone the Repository**
   ```powershell
   git clone https://github.com/rs010101/miniCRM-frontend
   Set-Location miniCRM/frontend
   ```

2. **Install Dependencies**
   ```powershell
   npm install
   ```

3. **Start the Application**
   - For development:
     ```powershell
     npm run dev
     ```
   - For production build:
     ```powershell
     npm run build
     npm run preview
     ```

## 📁 Project Structure

```plaintext
frontend/
├── public/               # Static assets
├── src/
│   ├── assets/          # Images and animations
│   ├── components/      # Reusable components
│   │   ├── common/      # Shared UI components
│   │   │   └── CardStyles.jsx
│   │   ├── Navbar.jsx
│   │   └── Sidebar.jsx
│   ├── pages/          # Page components
│   │   ├── campaign/
│   │   ├── customers/
│   │   ├── orders/
│   │   └── segmentRules/
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
├── index.html
├── package.json
├── postcss.config.js    # PostCSS configuration
└── tailwind.config.js   # Tailwind CSS configuration
```

## 🎨 Component Library

The application uses a custom component library built with Tailwind CSS:

- **Button**: Multiple variants and sizes
- **Card**: For content organization
- **Table**: For data display
- **Badge**: Status indicators
- **Modal**: For dialogs and forms
- **Forms**: Input, Select, Checkbox components

## ⚡ Performance Optimizations

- Code splitting with React.lazy()
- Image optimization
- Memoization with useMemo and useCallback
- Virtual scrolling for large lists
- Efficient re-rendering strategies

## 🔄 State Management

- React Context for global state
- Custom hooks for reusable logic
- Local state with useState
- Efficient state updates with useReducer

## 📦 Key Dependencies

- `react`: UI library
- `react-router-dom`: Routing
- `tailwindcss`: Styling
- `react-icons`: Icons
- `react-hook-form`: Form handling
- `recharts`: Data visualization
- `framer-motion`: Animations

## 👥 Author

Radhika Singla

## 🙏 Acknowledgments

- Tailwind CSS for the utility-first CSS framework
- React team for the excellent frontend library
- All open-source contributors
