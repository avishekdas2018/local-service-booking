import { createContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setProfile(null);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && user) {
      api.get('/auth/me')
        .then(res => { setUser(res.data.user); setProfile(res.data.profile); })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
    // we intentionally run this effect only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = (token, userData, profileData = null) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setProfile(profileData);
  };

  const refreshUser = async () => {
    const res = await api.get('/auth/me');
    setUser(res.data.user);
    setProfile(res.data.profile);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout, refreshUser, setProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export { AuthContext };
