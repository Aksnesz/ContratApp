import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { db } from '../../config/firebase'; // Asegúrate de tener tu instancia de Firestore

export default function EntrevistadorTab() {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [edad, setEdad] = useState('');
  const [email, setEmail] = useState('');

  const handleRegister = async () => {
    if (!nombre || !apellido || !edad || !email) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    try {
      await addDoc(collection(db, 'postulados'), {
        nombre,
        apellido,
        edad: Number(edad),
        email,
        creado: new Date(),
      });
      Alert.alert('Éxito', 'Postulado registrado correctamente');
      setNombre('');
      setApellido('');
      setEdad('');
      setEmail('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el postulado');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registrar Postulado</Text>
      <TextInput
        placeholder="Nombre"
        value={nombre}
        onChangeText={setNombre}
        style={styles.input}
      />
      <TextInput
        placeholder="Apellido"
        value={apellido}
        onChangeText={setApellido}
        style={styles.input}
      />
      <TextInput
        placeholder="Edad"
        value={edad}
        onChangeText={setEdad}
        keyboardType="numeric"
        style={styles.input}
      />
      <TextInput
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <Button title="Registrar postulado" onPress={handleRegister} />
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
});