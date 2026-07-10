# Streamin

Streamin is a simple music sharing platform with a Node.js/Express backend and a React/Vite frontend.

## Project Structure

- `backend/` - Express API with JWT auth, MongoDB, email OTP verification, song upload, voting, and play counting.
- `frontend/` - React/Vite application with auth, playlist dashboard, liked songs, and upload pages.

## Requirements

- Node.js 18+ (or compatible)
- npm
- MongoDB instance or Atlas cluster

## Setup

### Backend

1. Open `backend/.env` and configure your environment variables:

```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret>
PORT=5000

# Email OTP Configuration
BREVO_API_KEY=<your-brevo-api-key>
BREVO_FROM_EMAIL=<your-verified-email>
```

2. Install dependencies:

```bash
cd backend
npm install
```

3. Start the backend server:

```bash
node index.js
```

The backend runs on `http://localhost:5000` by default.

### Frontend

1. Install dependencies:

```bash
cd frontend
npm install
```

2. Start the development server:

```bash
npm run dev
```

## Features

- User registration and login
- **Email OTP verification** for secure account registration
- JWT-based authentication
- Upload music tracks using YouTube URLs
- Play songs with an embedded YouTube player
- Track play counts and total plays
- Upvote and downvote songs
- View uploaded songs and liked songs
- Dark-themed dashboard UI with red accent styling

## Notes

- Make sure the frontend `src/api.js` base URL points to `http://localhost:5000/api` if the backend is running locally.
- Configure your Brevo API key and verified sender email to enable OTP email delivery.
- If you change the backend port or host, update the frontend API URL accordingly.

## Useful Commands

```bash
# Backend
cd backend
npm install
node index.js

# Frontend
cd frontend
npm install
npm run dev
```

## Troubleshooting

- If the backend fails to connect, verify `MONGO_URI` and MongoDB availability.
- If OTP emails are not being delivered, verify your Brevo API key and sender email configuration.
- If the frontend cannot reach the backend, confirm both servers are running and the API base URL is correct.