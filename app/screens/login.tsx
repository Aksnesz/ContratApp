// app/screens/LoginScreen.tsx
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { auth, db } from '../../config/firebase';

type Role = 'entrevistador' | 'empresa';
type Props = { onLogin: (user: { username: string; role: Role }) => void };

export default function LoginScreen({ onLogin }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Ingrese correo y contraseña');
      return;
    }
    setLoading(true);
    try {
      // Autenticar usuario
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Obtener rol desde Firestore
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (!userDoc.exists()) {
        Alert.alert('Error', 'No se encontró rol para este usuario');
        setLoading(false);
        return;
      }
      const userData = userDoc.data();
      const userRole = userData.role as Role | undefined;
      if (!userRole) {
        Alert.alert('Error', 'Usuario sin rol asignado');
        setLoading(false);
        return;
      }

      // Invocar callback con info real de usuario y rol
      onLogin({ username: email, role: userRole });
    } catch (error) {
      Alert.alert('Error', 'Correo o contraseña incorrectos');
    }
    setLoading(false);
  };

 return (
  <View style={styles.container}>
    <Text style={styles.title}>Iniciar Sesión</Text>

    <Text style={styles.label}>Correo</Text>
    <TextInput
      value={email}
      onChangeText={setEmail}
      placeholder="Ingresa tu correo"
      keyboardType="email-address"
      autoCapitalize="none"
      style={styles.input}
    />

    <Text style={styles.label}>Contraseña</Text>
    <TextInput
      value={password}
      onChangeText={setPassword}
      placeholder="Ingresa tu contraseña"
      secureTextEntry
      style={styles.input}
    />

    <View style={styles.button}>
      <Button title={loading ? 'Cargando...' : 'Iniciar sesión'} onPress={handleLogin} color="#3478f6" disabled={loading} />
    </View>
  </View>
);
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff', // Fondo blanco
    padding: 24,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#222',
    marginBottom: 24,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#444',
  },
  input: {
    height: 48,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    fontSize: 16,
    backgroundColor: '#fafafa',
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 30,
    backgroundColor: '#fafafa',
  },
  picker: {
    height: 48,
    width: '100%',
  },
  button: {
    borderRadius: 8,
    overflow: 'hidden',
  },
});
