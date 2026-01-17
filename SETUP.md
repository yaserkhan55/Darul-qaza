# Dar-ul-Qaza Setup Guide

## Quick Start

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd Backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```
   
   This will install:
   - Express.js
   - MongoDB/Mongoose
   - CORS
   - JWT (for future auth)
   - PDFKit (for certificate generation)

3. **Set up environment variables:**
   Create a `.env` file in the `Backend` directory:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start the backend server:**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd Frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `Frontend` directory:
   ```env
   VITE_API_BASE_URL=http://localhost:5000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open your browser:**
   The app will be available at `http://localhost:3000`

## Features Implemented

### ✅ Public Home Page
- Beautiful Islamic design with beige and green color palette
- Arabic calligraphy heading
- Informational sections about Islamic divorce process
- Three divorce type options (Talaq, Khula, Faskh)
- Step-by-step process explanation
- Documents section
- Contact/help section

### ✅ User Dashboard
- Case list on the left
- Active case workflow on the right
- Stateless design - passes cases to CaseSteps component
- Handles navigation from Home page with selected divorce type

### ✅ Step-Based Workflow
1. **Divorce Application Form** - Basic information
2. **Resolution/Sulh Form** - Reconciliation attempt
3. **Agreement Form** - Terms of separation (only after failed resolution)
4. **Affidavits Form** - Sworn statements confirmation
5. **Under Review** - Qazi review status
6. **Certificate View** - Read-only certificate after approval

### ✅ Admin/Qazi Panel
- View all cases with filters
- Search functionality
- Case details view
- Approve cases
- Download certificates
- Status counts and statistics

### ✅ PDF Generation
- Certificate PDF generation endpoint
- Download functionality for approved cases
- Professional certificate format

### ✅ Visual Confirmations
- Success messages after form submissions
- Progress indicators
- Status badges

## Development Mode

Currently, authentication is disabled. The system uses a fixed development user ID:
- `DEV_USER_ID = "693db08517114d56286b53c7"`

All cases are associated with this user for development purposes. Authentication can be added later without refactoring the core logic.

## Important Notes

1. **PDF Generation**: Make sure to install `pdfkit` in the backend:
   ```bash
   cd Backend
   npm install pdfkit
   ```

2. **MongoDB**: Ensure MongoDB is running and accessible. You can use:
   - Local MongoDB installation
   - MongoDB Atlas (cloud)

3. **CORS**: Backend is configured to allow:
   - `http://localhost:3000` (Vite dev server)
   - `http://localhost:5173` (Vite default)
   - Production URL from `FRONTEND_URL` env variable

4. **Routing**: Frontend uses React Router. For production deployment, ensure your server is configured to serve `index.html` for all routes (SPA routing).

## Next Steps

1. Install `pdfkit` in backend if not already installed
2. Set up MongoDB connection
3. Test the complete workflow
4. Add authentication when ready
5. Deploy to production

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions.

