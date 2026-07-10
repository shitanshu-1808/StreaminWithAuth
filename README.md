# Streamin

Streamin is a simple music sharing platform with a Node.js/Express backend and a React/Vite frontend.

## Project Structure

- `backend/` - Express API with JWT auth, MongoDB, song upload, voting, and play counting.
- `frontend/` - React/Vite application with auth, playlist dashboard, liked songs, and upload pages.

## Requirements

- Node.js 18+ (or compatible)
- npm
- MongoDB instance or atlas cluster

## Setup

### Backend

1. Open `backend/.env` and configure your MongoDB connection and JWT secret:

```env
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-secret>
PORT=5000
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

2. Start development server:

```bash
npm run dev
```


## Features

- User registration and login
- Upload music tracks using YouTube URLs
- Play songs with an embedded YouTube player
- Track play counts and total plays
- Upvote and downvote songs
- View uploaded songs and liked songs
- Dark-themed dashboard UI with red accent styling

## Notes

- Make sure the frontend `src/api.js` base URL points to `http://localhost:5000/api` if the backend is running locally.
- If you change backend port or host, update the frontend API URL accordingly.

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

- If backend fails to connect, verify `MONGO_URL` and MongoDB availability.
- If frontend cannot reach the backend, confirm both servers are running and the API base URL is correct.
