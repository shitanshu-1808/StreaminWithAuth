import { useContext, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import { AuthContext } from '../AuthContext.jsx';

function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const userIdParam = searchParams.get('userId');
  const emailParam = searchParams.get('email');

  const [userId] = useState(userIdParam || '');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  if (!userIdParam) {
    return (
      <section className="page-container auth-page">
        <div className="auth-card">
          <div className="auth-head">
            <h1>Email Verification</h1>
            <p className="auth-copy">No verification details were provided. Please register or login to verify your email.</p>
          </div>
          <p className="auth-footer">
            <Link to="/login">Go to Login</Link>
          </p>
        </div>
      </section>
    );
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');
    try {
      const { data } = await api.post('/auth/verify-email', { userId, otp });
      setUser(data);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed.');
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    try {
      const { data } = await api.post('/auth/resend-otp', { userId });
      setInfo(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend code.');
    }
  };

  return (
    <section className="page-container auth-page">
      <div className="auth-card">
        <div className="auth-head">
          <h1>Email Verification</h1>
          <p className="auth-copy">
            Enter the 6-digit code sent to {emailParam || 'your email'} to verify your account.
          </p>
        </div>

        <form onSubmit={handleVerify} className="auth-form">
          {info && <p className="success auth-message">{info}</p>}
          <div className="field-group">
            <label>Verification code</label>
            <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} required />
          </div>
          {error && <p className="error auth-message">{error}</p>}
          <button className="button primary" type="submit">Verify account</button>
          <button type="button" className="button secondary" onClick={handleResend}>Resend code</button>
        </form>

        <p className="auth-footer">
          <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </section>
  );
}

export default VerifyEmail;
