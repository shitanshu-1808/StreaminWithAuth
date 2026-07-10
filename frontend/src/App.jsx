import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './AuthContext.jsx';
import NavBar from './components/NavBar.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import UploadSong from './pages/UploadSong.jsx';
import MyUploads from './pages/MyUploads.jsx';
import MyLiked from './pages/MyLiked.jsx';
import SongDetails from './pages/SongDetails.jsx';
import VerifyEmail from './pages/VerifyEmail.jsx';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <NavBar />
        <main className="app-shell">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route
              path="/upload"
              element={<PrivateRoute><UploadSong /></PrivateRoute>}
            />
            <Route
              path="/my/uploads"
              element={<PrivateRoute><MyUploads /></PrivateRoute>}
            />
            <Route
              path="/my/liked"
              element={<PrivateRoute><MyLiked /></PrivateRoute>}
            />
            <Route path="/songs/:id" element={<SongDetails />} />
          </Routes>
        </main>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
