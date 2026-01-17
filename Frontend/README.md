# Darul Qaza - Frontend Application

A modern, responsive web application for managing Islamic divorce cases (Darul Qaza system).

## Features

- ✅ User Authentication (Login/Register)
- ✅ Case Management Dashboard
- ✅ Divorce Form Submission
- ✅ Responsive Design (Mobile & Desktop)
- ✅ Modern UI with Tailwind CSS
- ✅ API Integration with Axios

## Tech Stack

- **React 19** - UI Library
- **Vite** - Build Tool
- **React Router** - Routing
- **Tailwind CSS** - Styling
- **Axios** - HTTP Client

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:3000`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── api/           # API functions (auth, cases)
├── components/    # Reusable components
├── pages/         # Page components
├── routes/        # Route configuration
└── App.jsx        # Main app component
```

## Environment Variables

- `VITE_API_BASE_URL` - Backend API base URL

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Responsive Design

The application is fully responsive and optimized for:
- Mobile devices (320px+)
- Tablets (768px+)
- Desktop (1024px+)

## License

Private project - All rights reserved
