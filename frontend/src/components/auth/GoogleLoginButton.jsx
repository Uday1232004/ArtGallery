import { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

/**
 * Premium Google Single-Sign-On Button integrated via @react-oauth/google
 */
export default function GoogleLoginButton({ portalMode = 'user' }) {
  const { loginWithGoogle, logout, isLoading, error } = useAuth();
  const [btnError, setBtnError] = useState(null);
  const navigate = useNavigate();

  const handleSuccess = async (credentialResponse) => {
    setBtnError(null);
    try {
      if (!credentialResponse.credential) {
        throw new Error("No secure credential token returned from Google.");
      }
      const data = await loginWithGoogle(
        credentialResponse.credential,
        portalMode === 'admin' ? 'ARTIST' : 'USER'
      );
      const { role } = data;

      if (portalMode === 'admin') {
        if (role === 'SUPER_ADMIN' || role === 'MANAGER' || role === 'ARTIST') {
          navigate('/admin');
        } else {
          // Instantly clear collector session cookie/tokens if unauthorized
          logout();
          throw new Error('Access Denied: Standard collector accounts are not authorized to access the Curator Portal.');
        }
      } else {
        navigate('/profile');
      }
    } catch (err) {
      setBtnError(err.message || 'Google Sign-in failed');
    }
  };

  const handleError = () => {
    setBtnError('Google authentication popup closed or failed.');
  };

  return (
    <div className="w-full flex flex-col items-center gap-2 font-sans">
      {/* Dynamic Alert Banner */}
      {(btnError || error) && (
        <div className="w-full bg-red-500/10 border border-red-500/20 text-red-200 text-[10px] tracking-wide p-3.5 text-center rounded-sm">
          {btnError || error}
        </div>
      )}

      {/* Mounting Node */}
      <div className="w-full flex justify-center min-h-[46px] relative z-10 transition-all duration-300">
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          theme="filled_black"
          size="large"
          text="continue_with"
          shape="square"
          width="380"
        />
      </div>

      {/* Micro-Interaction Loading Feedback */}
      {isLoading && (
        <span className="text-[8px] tracking-[0.2em] text-gold uppercase animate-pulse mt-2 block">
          Verifying Google account secure tokens...
        </span>
      )}
    </div>
  );
}
