# Darul Qaza - System Architecture

## Overview

Darul Qaza is a production-ready Islamic Divorce and Dispute Resolution platform that follows strict Shariah-compliant workflows. The system enforces a step-based case lifecycle that cannot be bypassed.

## System Architecture

### Frontend (React + Vite)
- **Location**: `Frontend/`
- **Port**: 3000 (development)
- **Framework**: React 19 with Vite
- **Styling**: Tailwind CSS with Islamic aesthetic
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: React Router v7

### Backend (Node.js + Express)
- **Location**: `Backend/`
- **Port**: 5000
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (ready for implementation)
- **API**: RESTful endpoints

## Case Lifecycle (Strict Order)

The system enforces a strict, unbreakable step sequence:

### 1. **STARTED** → Divorce Form Submission
- User selects divorce type (TALAQ, KHULA, FASKH)
- Fills basic information (husband/wife names, CNIC, marriage date, address)
- **Status Transition**: `STARTED` → `FORM_COMPLETED`

### 2. **FORM_COMPLETED** → Resolution (Sulh) Attempt
- Islamic reconciliation attempt
- Mediator name and result (SUCCESS/FAILED)
- **Status Transition**: `FORM_COMPLETED` → `RESOLUTION_SUCCESS` or `RESOLUTION_FAILED`

### 3. **RESOLUTION_SUCCESS/FAILED** → Agreement
- Terms of separation (Mahr, Iddat, Custody, Maintenance)
- **Status Transition**: → `AGREEMENT_DONE`

### 4. **AGREEMENT_DONE** → Affidavits
- Confirmation of sworn statements
- Applicant, Witness, and Supporting affidavits
- **Status Transition**: → `AFFIDAVITS_DONE`

### 5. **AFFIDAVITS_DONE** → Qazi Review
- Automatic transition to review
- **Status Transition**: → `UNDER_REVIEW`

### 6. **UNDER_REVIEW** → Approval
- Qazi reviews and approves/rejects
- **Status Transition**: → `APPROVED`

### 7. **APPROVED** → Certificate Issuance
- Final state - certificate can be generated

## Backend Status Validation

Every API endpoint validates:
1. **Case Ownership**: User can only access their own cases
2. **Status Order**: Cannot skip steps or submit out of order
3. **Required Data**: All required fields must be present

### Status Enum (Backend Model)
```javascript
[
  "STARTED",
  "FORM_COMPLETED",
  "RESOLUTION_SUCCESS",
  "RESOLUTION_FAILED",
  "AGREEMENT_DONE",
  "AFFIDAVITS_DONE",
  "UNDER_REVIEW",
  "APPROVED"
]
```

## API Endpoints

### Case Management
- `POST /api/cases/start` - Start new case
- `GET /api/cases/my` - Get user's cases
- `POST /api/cases/:id/form` - Submit divorce form (Step 1)
- `POST /api/cases/:id/resolution` - Submit resolution (Step 2)
- `POST /api/cases/:id/agreement` - Submit agreement (Step 3)
- `POST /api/cases/:id/affidavits` - Submit affidavits (Step 4)
- `PATCH /api/cases/:id/approve` - Qazi approval (Step 6)

### Authentication (Ready for Implementation)
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Frontend Components

### Pages
- `Dashboard.jsx` - Main case management interface
- `DivorceForm.jsx` - Step 1: Initial divorce application
- `ResolutionForm.jsx` - Step 2: Reconciliation attempt
- `AgreementForm.jsx` - Step 3: Separation terms
- `AffidavitsForm.jsx` - Step 4: Sworn statements
- `Login.jsx` - User authentication
- `Register.jsx` - User registration

### Components
- `CaseSteps.jsx` - Routes to correct form based on status
- `StepProgress.jsx` - Visual progress indicator
- `StatusBadge.jsx` - Status display component
- `Navbar.jsx` - Navigation header
- `CaseCard.jsx` - Case list item

## Development Mode

Currently using `DEV_USER_ID` for development:
- No authentication required
- All cases belong to hardcoded user ID
- Ready for auth integration without refactoring

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### Backend (.env)
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:3000
```

## CORS Configuration

Backend allows:
- `http://localhost:3000` (Vite dev server)
- `http://localhost:5173` (Vite default)
- Production URL from `FRONTEND_URL` env variable

## Data Flow

1. **User Action** → Frontend Component
2. **API Call** → `case.api.js` function
3. **HTTP Request** → Axios with auth token (if authenticated)
4. **Backend Validation** → Status check, ownership check
5. **Database Update** → Status transition + data save
6. **Response** → Updated case data
7. **UI Update** → Component re-renders with new status
8. **Next Step** → `CaseSteps` routes to next form

## Key Design Principles

1. **Status-Driven**: All logic flows from case status
2. **Backend Truth**: Frontend always reflects backend state
3. **No Skipping**: Steps cannot be bypassed
4. **Clean Architecture**: Separation of concerns
5. **Extensible**: Easy to add new divorce types or steps
6. **Production-Ready**: Error handling, validation, security considerations

## Future Enhancements

- Full authentication integration
- Role-based access (USER, QAZI, ADMIN)
- Certificate generation (PDF)
- Email notifications
- Document upload for affidavits
- Multi-language support (Arabic/Urdu)
- Payment integration for fees
- Case history and audit logs

