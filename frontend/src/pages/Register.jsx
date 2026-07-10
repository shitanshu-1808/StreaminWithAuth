import { useContext, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../AuthContext.jsx';

const Register = () => {
  const { register } = useContext(AuthContext);
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(form);
      navigate('/');
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.response?.data?.error || err.message || 'Registration failed';
      console.error('Registration error:', err);
      setError(errorMessage);
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

        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </section>
  );
};

export default Register;
