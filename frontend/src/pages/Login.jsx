import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';
import api from '../api';

const Login = () => {
  const { login, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
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
      const data = await login(form);
      navigate('/');
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.requiresVerification) {
        setPendingUser(resp);
        setInfo(resp.message);
        setError('');
      } else {
        setError(resp?.message || 'Login failed');
      }
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      const { data } = await api.post('/auth/verify-email', { userId: pendingUser._id, otp });
      setUser(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed');
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
          <p className="eyebrow">Welcome back</p>
          <h1>{pendingUser ? 'Verify your email' : 'Sign in to your account'}</h1>
          <p className="auth-copy">
            {pendingUser
              ? 'Enter the 6-digit code sent to your email to complete verification.'
              : 'Access your uploaded tracks, likes, and live analytics from a sleek dashboard.'}
          </p>
        </div>

        {!pendingUser ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field-group">
              <label>Email</label>
              <input type="email" name="email" value={form.email} onChange={handleChange} required />
            </div>
            <div className="field-group">
              <label>Password</label>
              <input type="password" name="password" value={form.password} onChange={handleChange} required />
            </div>
            {error && <p className="error auth-message">{error}</p>}
            <button className="button primary" type="submit">Login</button>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="auth-form">
            {info && <p className="success auth-message">{info}</p>}
            <div className="field-group">
              <label>Verification code</label>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
            </div>
            {error && <p className="error auth-message">{error}</p>}
            <button className="button primary" type="submit">Verify &amp; Login</button>
            <button type="button" className="button secondary" onClick={handleResend}>Resend code</button>
          </form>
        )}

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
