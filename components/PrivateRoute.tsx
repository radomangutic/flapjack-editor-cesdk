import { useRouter } from 'next/router';

interface PrivateRouteProps {
  children: React.ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const router = useRouter();

  const authToken = getCookieValue('supabase-auth-token');

  if (!authToken) {
    router.push('/templates');
    return null; 
  }

  return <>{children}</>;
}

function getCookieValue(name: string): string | null {
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [cookieName, cookieValue] = cookie.split('=');
    if (cookieName.trim() === name) {
      return cookieValue;
    }
  }
  return null;
}

export default PrivateRoute;
