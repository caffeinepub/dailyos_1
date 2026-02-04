import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import AppButton from './AppButton';
import { LogIn } from 'lucide-react';

export default function LoginButton() {
  const { login, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();

  const disabled = loginStatus === 'logging-in';
  const shouldPulse = !disabled;

  const handleLogin = async () => {
    try {
      await login();
    } catch (error: any) {
      if (error.message === 'User is already authenticated') {
        // Clear and retry if there's a stale session
        queryClient.clear();
        setTimeout(() => login(), 300);
      }
    }
  };

  return (
    <AppButton
      onClick={handleLogin}
      disabled={disabled}
      variant="default"
      size="sm"
      className={shouldPulse ? 'motion-safe:animate-attention-pulse' : ''}
    >
      {loginStatus === 'logging-in' ? (
        'Logging in...'
      ) : (
        <>
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </>
      )}
    </AppButton>
  );
}
