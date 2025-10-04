// app/screens/EntrevistadorTab.tsx
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { registerUser } from '../../config/registerUser'; // importa la función que creamos para registrar

type Role = 'entrevistador' | 'empleador';

export default function EntrevistadorTab() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('entrevistador');

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }
    try {
      await registerUser(email, password, role);
      Alert.alert('Éxito', `Usuario registrado como ${role}`);
      setEmail('');
      setPassword('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el usuario');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro rápido de usuario</Text>

      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <View style={styles.roleSelector}>
        <Button
          title="Entrevistador"
          color={role === 'entrevistador' ? '#3478f6' : '#ccc'}
          onPress={() => setRole('entrevistador')}
        />
        <Button
          title="Empleador"
          color={role === 'empleador' ? '#3478f6' : '#ccc'}
          onPress={() => setRole('empleador')}
        />
      </View>

      <Button title="Registrar usuario" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  roleSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
  },
});
