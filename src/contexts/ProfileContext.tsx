import React, { createContext, useContext, useState } from 'react';

export interface ProfileUser {
  full_name: string;
  email: string;
}

interface ProfileContextType {
  user: ProfileUser | null;
  setUser: (u: ProfileUser) => void;
  token: string;
  setToken: (t: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export const ProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [token, setToken] = useState('');
  return (
    <ProfileContext.Provider value={{ user, setUser, token, setToken }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile debe usarse dentro de ProfileProvider');
  return ctx;
};
