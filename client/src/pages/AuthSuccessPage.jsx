import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AuthSuccessPage() {
  const [searchParams] = useSearchParams();
  const { handleOAuthSuccess } = useAuth();
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const userStr = searchParams.get('user');

    if (token && userStr) {
      try {
        let user;
        // Check if userStr is already parsed (React Router sometimes decodes it for us)
        if (userStr.startsWith('{')) {
           user = JSON.parse(userStr);
        } else {
           user = JSON.parse(decodeURIComponent(userStr));
        }
        
        handleOAuthSuccess(token, user);
        
        // Short timeout before redirecting to ensure state has settled
        setTimeout(() => {
            window.location.href = '/dashboard';
        }, 1000);
        
      } catch (e) {
        console.error('Failed to parse user from OAuth callback', e);
        setErrorMsg('Error parsing login data: ' + e.message);
      }
    } else {
        setErrorMsg('Missing token or user data in URL. Token: ' + !!token + ', User: ' + !!userStr);
    }
  }, [searchParams]); // Removed handleOAuthSuccess to prevent infinite loop

  return (
    <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'white', padding: '20px', textAlign: 'center' }}>
      <h2>Authenticating...</h2>
      <p style={{ color: '#8b8b9e', marginTop: '10px' }}>Please wait while we log you in.</p>
      
      {/* Fallback button if auto-redirect fails */}
      <button 
        onClick={() => window.location.href = '/dashboard'} 
        className="btn btn-primary" 
        style={{ marginTop: '30px' }}
      >
        Go to Dashboard
      </button>

      {errorMsg && <p style={{ color: '#ef4444', marginTop: '20px', background: 'rgba(239, 68, 68, 0.1)', padding: '10px', borderRadius: '8px' }}>{errorMsg}</p>}
      {errorMsg && <button onClick={() => window.location.href = '/login'} className="btn btn-secondary" style={{ marginTop: '20px' }}>Back to Login</button>}
    </div>
  );
}
