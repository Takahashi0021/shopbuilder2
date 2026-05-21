import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { authAPI } from '../services/api';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      authAPI.verifyEmail(token)
        .then(() => setStatus('success'))
        .catch(() => setStatus('error'));
    } else {
      setStatus('error');
    }
  }, []);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {status === 'verifying' && <h2>⏳ Verifying your email...</h2>}
        {status === 'success' && (
          <>
            <h2 style={{ color: 'green' }}>✅ Email Verified!</h2>
            <p>Your account is now active. You can login.</p>
            <Link to="/login" style={styles.btn}>Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 style={{ color: 'red' }}>❌ Verification Failed</h2>
            <p>Token is invalid or expired.</p>
            <Link to="/register" style={styles.btn}>Register Again</Link>
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' },
  card: { background: 'white', padding: 40, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', textAlign: 'center' },
  btn: { display: 'inline-block', marginTop: 16, padding: '10px 24px', background: '#e94560', color: 'white', borderRadius: 8, textDecoration: 'none' },
};
