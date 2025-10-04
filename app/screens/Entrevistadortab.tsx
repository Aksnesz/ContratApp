import DateTimePicker from '@react-native-community/datetimepicker';
import { addDoc, collection } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, Button, Modal, Platform, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { db } from '../../config/firebase';

export default function EntrevistadorTab() {
  const [apellidoPaterno, setApellidoPaterno] = useState('');
  const [apellidoMaterno, setApellidoMaterno] = useState('');
  const [nombres, setNombres] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [fechaNacimientoDate, setFechaNacimientoDate] = useState<Date | null>(null);
  const [idiomas, setIdiomas] = useState('');
  const [estudios, setEstudios] = useState('');
  const [experiencia, setExperiencia] = useState('');
  const [notas, setNotas] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async () => {
    if (isSubmitting) return; // Evita envíos múltiples
    if (
      !apellidoPaterno ||
      !apellidoMaterno ||
      !nombres ||
      !fechaNacimiento ||
      !idiomas ||
      !estudios ||
      !experiencia
    ) {
      Alert.alert('Error', 'Por favor completa todos los campos obligatorios');
      return;
    }
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'postulados'), {
        apellidoPaterno,
        apellidoMaterno,
        nombres,
        fechaNacimiento: fechaNacimientoDate ? fechaNacimientoDate : null, // Guardar como Date
        idiomas,
        estudios,
        experiencia,
        notas,
        creado: new Date(),
        fechaRegistro: new Date().toISOString(), // <-- Agregado
      });
      setModalVisible(true); // Mostrar modal de éxito
      setApellidoPaterno('');
      setApellidoMaterno('');
      setNombres('');
      setFechaNacimiento('');
      setFechaNacimientoDate(null);
      setIdiomas('');
      setEstudios('');
      setExperiencia('');
      setNotas('');
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar el postulado');
    }
    setIsSubmitting(false);
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const year = selectedDate.getFullYear();
      setFechaNacimiento(`${day}/${month}/${year}`);
      setFechaNacimientoDate(selectedDate); // Guardar el objeto Date
    }
  };

  return (
    <View style={styles.outerContainer}>
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>¡Postulado registrado exitosamente!</Text>
            <Button title="Cerrar" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>
      <View style={styles.container}>
        <Text style={styles.title}>Registrar Postulado</Text>
        <TextInput
          placeholder="Apellido Paterno"
          value={apellidoPaterno}
          onChangeText={setApellidoPaterno}
          style={styles.input}
        />
        <TextInput
          placeholder="Apellido Materno"
          value={apellidoMaterno}
          onChangeText={setApellidoMaterno}
          style={styles.input}
        />
        <TextInput
          placeholder="Nombre(s)"
          value={nombres}
          onChangeText={setNombres}
          style={styles.input}
        />
        {Platform.OS === 'web' ? (
          <TextInput
            placeholder="Fecha de Nacimiento (DD/MM/AAAA)"
            value={fechaNacimiento}
            onChangeText={text => {
              setFechaNacimiento(text);
              // Intentar convertir a Date si el formato es correcto
              const [day, month, year] = text.split('/');
              if (day && month && year && !isNaN(Number(day)) && !isNaN(Number(month)) && !isNaN(Number(year))) {
                const d = new Date(Number(year), Number(month) - 1, Number(day));
                if (!isNaN(d.getTime())) setFechaNacimientoDate(d);
                else setFechaNacimientoDate(null);
              } else {
                setFechaNacimientoDate(null);
              }
            }}
            style={styles.input}
          />
        ) : (
          <>
            <Pressable onPress={() => setShowDatePicker(true)} style={styles.input}>
              <Text style={{ color: fechaNacimiento ? '#222' : '#888', fontSize: 16 }}>
                {fechaNacimiento ? fechaNacimiento : 'Fecha de Nacimiento'}
              </Text>
            </Pressable>
            {showDatePicker && (
              <DateTimePicker
                value={fechaNacimientoDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
          </>
        )}
        <TextInput
          placeholder="Idioma(s)"
          value={idiomas}
          onChangeText={setIdiomas}
          style={styles.input}
        />
        <TextInput
          placeholder="Estudios"
          value={estudios}
          onChangeText={setEstudios}
          style={styles.input}
        />
        <TextInput
          placeholder="Experiencia"
          value={experiencia}
          onChangeText={setExperiencia}
          style={styles.input}
        />
        <TextInput
          placeholder="Notas"
          value={notas}
          onChangeText={setNotas}
          style={[styles.input, { height: 80 }]}
          multiline
        />
        <View style={styles.fotoContainer}>
          <View style={styles.fotoPlaceholder}>
            <Text style={styles.fotoText}>Foto</Text>
          </View>
          <TouchableOpacity style={styles.fotoButton} disabled>
            <Text style={styles.fotoButtonText}>Subir Foto</Text>
          </TouchableOpacity>
        </View>
        <Button title="Registrar postulado" onPress={handleRegister} disabled={isSubmitting} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  container: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: '#fff',
    padding: 18,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    // Sombra para web/PC
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 12,
    fontSize: 16,
    backgroundColor: '#fafafa',
    width: '100%',
    minWidth: 200,
  },
  fotoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    width: '100%',
  },
  fotoPlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  fotoText: {
    color: '#888',
    fontSize: 18,
  },
  fotoButton: {
    backgroundColor: '#bdbdbd',
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  fotoButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 28,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 220,
    elevation: 5,
  },
  modalText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 18,
    textAlign: 'center',
  },
});