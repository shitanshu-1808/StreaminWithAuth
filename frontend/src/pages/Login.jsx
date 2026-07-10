import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';

const Login = () => {
  const { login } = useContext(AuthContext);
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(form);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <section className="page-container auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <p className="eyebrow">Welcome back</p>
          <h1>Sign in to your account</h1>
          <p className="auth-copy">
            Access your uploaded tracks, likes, and live analytics from a sleek dashboard.
          </p>
        </div>

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

        <p className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </section>
  );
};

export default Login;
