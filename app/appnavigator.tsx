// app/AppNavigator.tsx
import React, { useState } from 'react';
import EmpresaTab from './screens/Empresatab';
import EntrevistadorTab from './screens/Entrevistadortab';
import LoginScreen from './screens/login';

type User = {
  username: string;
  role: 'entrevistador' | 'empresa';
} | null;

export default function AppNavigator() {
  const [user, setUser] = useState<User>(null);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  if (user.role === 'entrevistador') {
    return <EntrevistadorTab />;
  } else if (user.role === 'empresa') {
    return <EmpresaTab />;
  }
  return null;
}
