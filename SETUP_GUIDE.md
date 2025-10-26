# Setup Guide - Jade SmartBank Frontend

## Quick Fix for Build Issues

If you encounter Tailwind CSS or npm cache errors, run:

```bash
# Fix npm cache permissions
sudo chown -R $(whoami) ~/.npm

# Install dependencies
npm install

# If you still have Tailwind issues, reinstall Tailwind CSS 3
npm uninstall tailwindcss
npm install -D tailwindcss@3.4.1 postcss@8.4.35 autoprefixer@10.4.18

# Initialize Tailwind (if needed)
npx tailwindcss init -p

# Build the app
npm run build
```

## Complete Setup from Scratch

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env

# 3. Update .env with your backend URL
# VITE_API_BASE_URL=http://localhost:8000/api/v1

# 4. Start development server
npm run dev
```

## Project Status

 **All features implemented and ready to use!**

### What's Included

1. **Complete Authentication Flow**
   - User registration with full validation
   - Login with JWT token management
   - Protected routes
   - Auto-logout on session expiry

2. **Dashboard**
   - Account balance overview
   - Active loans summary
   - Recent transactions
   - KYC status indicators

3. **Account Management**
   - Create accounts (Savings, Current, FD)
   - View all accounts
   - Account details with balances

4. **Transactions**
   - Money transfers between accounts
   - Deposits and withdrawals
   - Transaction history with filters
   - Real-time balance updates

5. **Loan Management**
   - EMI calculator (works without login!)
   - Loan applications with KYC validation
   - View all loans and their status
   - EMI schedules and payments

6. **Profile & KYC**
   - User profile information
   - KYC document upload
   - Document verification status

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import in Vercel
3. Set env var: `VITE_API_BASE_URL=<your-backend-url>`
4. Deploy!

### Netlify

1. Push code to GitHub
2. Connect to Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Add environment variable

## Tech Stack

- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS (styling)
- React Router (routing)
- Axios (API client)
- Lucide React (icons)

## API Connection

The frontend is configured to connect to your backend at:
- Default: `http://localhost:8000/api/v1`
- Production: Set via `VITE_API_BASE_URL` environment variable

## Troubleshooting

### Build Errors

If you see TypeScript errors:
```bash
npm run build -- --mode development
```

### CORS Issues

Make sure your backend allows requests from the frontend origin:
```python
# In your FastAPI app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Add your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Port Already in Use

Change the port in `vite.config.ts` or kill the process:
```bash
lsof -ti:5173 | xargs kill
```

## Features to Test

1. Register a new user
2. Upload KYC documents
3. Create a bank account (Note: requires admin to verify KYC first)
4. Make transactions
5. Use EMI calculator
6. Apply for a loan

## Next Steps

1. Fix npm cache if needed (see above)
2. Test the app locally: `npm run dev`
3. Deploy to Vercel/Netlify
4. Connect to your deployed backend
5. Test the full user journey!

---

**Frontend Status: ✅ Complete and ready for deployment!**