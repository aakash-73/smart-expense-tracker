import { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

function parseJwt(token) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch {
    return null;
  }
}

function isTokenExpired(payload) {
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser]                       = useState(null); // { userId, email, username, roles }
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const payload = parseJwt(token);
      if (payload && !isTokenExpired(payload)) {
        setIsAuthenticated(true);
        setUser({
          userId:   payload.sub,
          email:    payload.email,
          username: payload.username || payload.email,
          roles:    payload.roles || [],
        });
      } else {
        // Token expired — clean up
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const loginContext = (token) => {
    localStorage.setItem('token', token);
    const payload = parseJwt(token);
    setIsAuthenticated(true);
    setUser({
      userId:   payload?.sub,
      email:    payload?.email,
      username: payload?.username || payload?.email,
      roles:    payload?.roles || [],
    });
  };

  const logoutContext = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, loginContext, logoutContext, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
