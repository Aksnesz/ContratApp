import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Modal,
  Pressable,
  Alert,
} from 'react-native';

type User = {
  name: { first: string; last: string };
  gender: string;
  nat: string;
  dob: { age: number };
  picture: { large: string };
  skillTechnical: number;
  skillSocial: number;
  recommendation: 'Sí' | 'No' | 'Prestigiosa';
};

const NATIONALITIES: Record<string, string> = {
  AU: 'Australia',
  BR: 'Brazil',
  CA: 'Canada',
  CH: 'Switzerland',
  DE: 'Germany',
  DK: 'Denmark',
  ES: 'Spain',
  FI: 'Finland',
  FR: 'France',
  GB: 'United Kingdom',
  IE: 'Ireland',
  IR: 'Iran',
  NO: 'Norway',
  NL: 'Netherlands',
  NZ: 'New Zealand',
  TR: 'Turkey',
  US: 'United States',
  MX: 'Mexico',
  UA: 'Ukraine',
  IN: 'India',
};

const recommendations = ['Sí', 'No', 'Prestigiosa'] as const;

const jobPositions = [
  'Técnico en Soporte de Sistemas',
  'Analista de Datos',
  'Coordinador de Proyectos Sociales',
  'Trabajador Social Comunitario',
];

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const randomScore = () => Number((Math.random() * 9 + 1).toFixed(1)); // 1.0 to 10.0
  const randomRecommendation = () =>
    recommendations[Math.floor(Math.random() * recommendations.length)];

  const fetchUser = async () => {
    try {
      const response = await fetch('https://randomuser.me/api/');
      const json = await response.json();

      const newUser = {
        ...json.results[0],
        skillTechnical: randomScore(),
        skillSocial: randomScore(),
        recommendation: randomRecommendation(),
      };
      setUser(newUser);
    } catch (e) {
      console.error('Error fetching user', e);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const getFullNationality = (code: string) => NATIONALITIES[code] || code;

  const handleJobSelect = (job: string) => {
    setModalVisible(false);
    Alert.alert('Asignación de Puesto', `Se asignó el puesto: ${job}`);
    fetchUser();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Candidatos al Empleo</Text>
      </View>
      <View style={styles.container}>
        {user && (
          <>
            <Image source={{ uri: user.picture.large }} style={styles.image} />
            <Text style={styles.name}>{`${user.name.first} ${user.name.last}`}</Text>
            <Text style={styles.info}>Género: {user.gender}</Text>
            <Text style={styles.info}>Nacionalidad: {getFullNationality(user.nat)}</Text>
            <Text style={styles.info}>Edad: {user.dob.age}</Text>
            <Text style={styles.info}>
              Habilidad Técnica: {user.skillTechnical} / 10
            </Text>
            <Text style={styles.info}>Habilidad Social: {user.skillSocial} / 10</Text>
            <Text style={styles.info}>Recomendación: {user.recommendation}</Text>
            <View style={styles.buttonsContainer}>
              <TouchableOpacity style={[styles.button, styles.redButton]} onPress={fetchUser}>
                <Text style={styles.buttonText}>💀</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.greenButton]} onPress={() => setModalVisible(true)}>
                <Text style={styles.buttonText}>⛏️</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>Selecciona un puesto</Text>
              {jobPositions.map((job) => (
                <Pressable
                  key={job}
                  style={styles.modalButton}
                  onPress={() => handleJobSelect(job)}
                >
                  <Text style={styles.modalButtonText}>{job}</Text>
                </Pressable>
              ))}
              <Pressable style={styles.modalCancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  titleContainer: {
    paddingTop: 15,
    paddingBottom: 10,
    backgroundColor: 'white',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#222',
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  image: {
    width: 140,
    height: 140,
    borderRadius: 70,
    marginBottom: 15,
  },
  name: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'center',
  },
  info: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: 'center',
    color: '#333',
  },
  buttonsContainer: {
    flexDirection: 'row',
    marginTop: 25,
    width: '80%',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 12,
  },
  redButton: {
    backgroundColor: '#ff4d4d',
  },
  greenButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    fontSize: 26,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 30,
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
  },
  modalButton: {
    paddingVertical: 12,
    paddingHorizontal: 25,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    marginVertical: 8,
    width: 280,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
  modalCancelButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#888',
    width: 280,
  },
  modalCancelButtonText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
  },
});
