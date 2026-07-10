import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext.jsx';

const Register = () => {
  const { register, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [otp, setOtp] = useState('');
  const [pendingUser, setPendingUser] = useState(null);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      const result = await register(form);
      if (result.requiresVerification) {
        setPendingUser(result);
        setError('');
      } else {
        navigate('/');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed';
      console.error('Registration error:', err);
      setError(errorMessage);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      const { data } = await api.post('/auth/verify-email', { userId: pendingUser._id, otp });
      // Backend now returns user data + token on successful verification
      setUser(data);
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Verification failed';
      setError(errorMessage);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      const { data } = await api.post('/auth/resend-otp', { userId: pendingUser._id });
      setInfo(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code');
    }
  };

  return (
    <section className="page-container auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <p className="eyebrow">Create account</p>
          <h1>Join Streamin</h1>
          <p className="auth-copy">
            Start uploading, liking, and growing your music feed with a single account.
          </p>
        </div>

        {!pendingUser ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field-group">
              <label>Username</label>
              <input type="text" name="username" value={form.username} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>
            {error && <p className="error auth-message">{error}</p>}
            <button className="button primary" type="submit">Register</button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="auth-form">
            <p className="auth-copy">We sent a 6-digit code to {pendingUser.email}. Enter it below to activate your account.</p>
            {info && <p className="success auth-message">{info}</p>}
            <div className="field-group">
              <label>Verification code</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            {error && <p className="error auth-message">{error}</p>}
            <button className="button primary" type="submit">Verify account</button>
            <button type="button" className="button secondary" onClick={handleResend}>Resend code</button>
          </form>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
