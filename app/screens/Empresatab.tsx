import { collection, doc, getDocs, limit, orderBy, query, startAfter, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Button,
  Dimensions,
  FlatList,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { db } from '../../config/firebase';

const DEPARTAMENTOS = ['TI', 'Sociales'];

// Define el tipo para los postulados, incluyendo Estado (y otros campos relevantes)
type Postulado = {
  id: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  nombres?: string;
  fechaNacimiento?: any;
  experiencia?: string;
  estudios?: string;
  idiomas?: string;
  notas?: string;
  telefono?: string;
  Estado?: string;
  creado?: any;
};

export default function EmpresaTab() {
  const [view, setView] = useState<'postulados' | 'departamentos'>('postulados');
  const [postulados, setPostulados] = useState<Postulado[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPostulado, setSelectedPostulado] = useState<Postulado | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [departamentoModal, setDepartamentoModal] = useState(false);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [departamentoSeleccionado, setDepartamentoSeleccionado] = useState<string | null>(null);
  const [departamentoUsuarios, setDepartamentoUsuarios] = useState<Postulado[]>([]);

  // Fetch postulados paginated (solo los que no están eliminados ni contratados)
  const fetchPostulados = async (reset = false) => {
    setLoading(true);
    let q;
    if (reset || !lastDoc) {
      q = query(collection(db, 'postulados'), orderBy('creado', 'desc'), limit(20));
    } else {
      q = query(collection(db, 'postulados'), orderBy('creado', 'desc'), startAfter(lastDoc), limit(20));
    }
    const snap = await getDocs(q);
    // Filtrar los que no están eliminados ni contratados
    const docs = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Postulado)) // <-- asegúrate de hacer el cast a Postulado
      .filter(d => !d.Estado || d.Estado === 'Postulado');
    if (reset) {
      setPostulados(docs.slice(0, 10));
    } else {
      setPostulados(prev => [...prev, ...docs.slice(0, 10)]);
    }
    setLastDoc(snap.docs[snap.docs.length - 1]);
    setHasMore(docs.length > 10);
    setLoading(false);
  };

  // Fetch usuarios por departamento
  const fetchDepartamentoUsuarios = async (departamento: string) => {
    setLoading(true);
    const q = query(collection(db, 'postulados'), orderBy('creado', 'desc'));
    const snap = await getDocs(q);
    const docs = snap.docs
      .map(d => ({ id: d.id, ...d.data() } as Postulado)) // <-- cast explícito aquí también
      .filter(d => d.Estado === departamento);
    setDepartamentoUsuarios(docs);
    setLoading(false);
  };

  useEffect(() => {
    if (view === 'postulados') {
      fetchPostulados(true);
      setPage(1);
    }
    if (view === 'departamentos') {
      setDepartamentoSeleccionado(null);
      setDepartamentoUsuarios([]);
    }
  }, [view]);

  // Calcula edad desde fechaNacimiento (Date)
  const calcularEdad = (fechaNacimiento: any) => {
    if (!fechaNacimiento) return '';
    const fecha = fechaNacimiento.seconds
      ? new Date(fechaNacimiento.seconds * 1000)
      : new Date(fechaNacimiento);
    const diff = Date.now() - fecha.getTime();
    const edad = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    return edad;
  };

  // Modal acciones
  const handleEliminar = async () => {
    if (!selectedPostulado) return;
    await updateDoc(doc(db, 'postulados', selectedPostulado.id), { Estado: 'Eliminado' });
    setModalVisible(false);
    fetchPostulados(true);
  };

  const handleContratar = async (departamento: string) => {
    if (!selectedPostulado) return;
    await updateDoc(doc(db, 'postulados', selectedPostulado.id), { Estado: departamento });
    setDepartamentoModal(false);
    setModalVisible(false);
    fetchPostulados(true);
  };

  // Render item postulados
  const renderPostulado = ({ item }: { item: any }) => (
    <Pressable
      style={styles.listItem}
      onPress={() => {
        setSelectedPostulado(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.listText}>
        {item.apellidoPaterno} {item.nombres} - {calcularEdad(item.fechaNacimiento)} - {item.experiencia} - {item.estudios}
      </Text>
    </Pressable>
  );

  // Render item departamento usuario
  const renderDepartamentoUsuario = ({ item }: { item: any }) => (
    <Pressable
      style={styles.listItem}
      onPress={() => {
        setSelectedPostulado(item);
        setModalVisible(true);
      }}
    >
      <Text style={styles.listText}>
        {item.apellidoPaterno} {item.nombres} - {calcularEdad(item.fechaNacimiento)} - {item.experiencia} - {item.estudios}
      </Text>
    </Pressable>
  );

  // Modal de perfil (con X para cerrar)
  const PerfilModal = () => {
    if (!selectedPostulado) return null;
    // Mostrar botones de acción solo si el estado es "Postulado"
    const puedeAccionar = !selectedPostulado.Estado || selectedPostulado.Estado === 'Postulado';
    return (
      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.perfilModalContent, Platform.OS === 'web' && styles.perfilModalContentWeb]}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => setModalVisible(false)}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.fotoPerfil}>
              <View style={styles.fotoPlaceholder}>
                <Text style={styles.fotoText}>Foto</Text>
              </View>
            </View>
            <View style={styles.infoPerfil}>
              <Text style={styles.perfilNombre}>
                {selectedPostulado.apellidoPaterno} {selectedPostulado.apellidoMaterno} {selectedPostulado.nombres}
              </Text>
              <Text style={styles.perfilDato}>Edad: {calcularEdad(selectedPostulado.fechaNacimiento)}</Text>
              <Text style={styles.perfilDato}>Experiencia: {selectedPostulado.experiencia}</Text>
              <Text style={styles.perfilDato}>Estudios: {selectedPostulado.estudios}</Text>
              <Text style={styles.perfilDato}>Idiomas: {selectedPostulado.idiomas}</Text>
              <Text style={styles.perfilDato}>Notas: {selectedPostulado.notas}</Text>
              <Text style={styles.perfilDato}>Teléfono: {selectedPostulado.telefono || 'No disponible'}</Text>
              <Text style={styles.perfilDato}>Estado: {selectedPostulado.Estado || 'Postulado'}</Text>
              {puedeAccionar && (
                <View style={styles.perfilBotones}>
                  <TouchableOpacity
                    style={[styles.perfilBtn, styles.perfilBtnRojo]}
                    onPress={handleEliminar}
                  >
                    <Text style={styles.perfilBtnText}>Eliminar</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.perfilBtn, styles.perfilBtnVerde]}
                    onPress={() => setDepartamentoModal(true)}
                  >
                    <Text style={styles.perfilBtnText}>Contratar</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
          {/* Modal para elegir departamento */}
          <Modal
            visible={departamentoModal}
            transparent
            animationType="fade"
            onRequestClose={() => setDepartamentoModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.departamentoModalContent}>
                <TouchableOpacity style={styles.closeBtn} onPress={() => setDepartamentoModal(false)}>
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
                <Text style={styles.modalText}>Selecciona departamento</Text>
                {DEPARTAMENTOS.map(dep => (
                  <TouchableOpacity
                    key={dep}
                    style={styles.departamentoBtn}
                    onPress={() => handleContratar(dep)}
                  >
                    <Text style={styles.departamentoBtnText}>{dep}</Text>
                  </TouchableOpacity>
                ))}
                <Button title="Cancelar" onPress={() => setDepartamentoModal(false)} />
              </View>
            </View>
          </Modal>
        </View>
      </Modal>
    );
  };

  // Vista departamentos
  const DepartamentosView = () => (
    <View style={{ alignItems: 'center', marginTop: 30, width: '100%' }}>
      <Text style={{ fontSize: 18, marginBottom: 16 }}>Departamentos</Text>
      <View style={{ flexDirection: 'row', gap: 12, marginBottom: 18 }}>
        {DEPARTAMENTOS.map(dep => (
          <TouchableOpacity
            key={dep}
            style={styles.departamentoBtn}
            onPress={async () => {
              setDepartamentoSeleccionado(dep);
              await fetchDepartamentoUsuarios(dep);
            }}
          >
            <Text style={styles.departamentoBtnText}>{dep}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {departamentoSeleccionado && (
        <>
          <Text style={{ fontWeight: 'bold', fontSize: 16, marginBottom: 8 }}>
            {departamentoSeleccionado}
          </Text>
          <FlatList
            data={departamentoUsuarios}
            renderItem={renderDepartamentoUsuario}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No hay empleados en este departamento.</Text>}
            style={{ width: '100%' }}
          />
          <PerfilModal />
        </>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <Text style={styles.adminTitle}>Administración</Text>
      {Platform.OS === 'web' && (
        <View style={styles.switchBtns}>
          <TouchableOpacity
            style={[styles.switchBtn, view === 'postulados' && styles.switchBtnActive]}
            onPress={() => setView('postulados')}
          >
            <Text style={styles.switchBtnText}>Postulados</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.switchBtn, view === 'departamentos' && styles.switchBtnActive]}
            onPress={() => setView('departamentos')}
          >
            <Text style={styles.switchBtnText}>Departamentos</Text>
          </TouchableOpacity>
        </View>
      )}
      <View style={styles.container}>
        {view === 'postulados' ? (
          <>
            <FlatList
              data={postulados}
              renderItem={renderPostulado}
              keyExtractor={item => item.id}
              ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 40 }}>No hay postulados.</Text>}
              style={{ width: '100%' }}
            />
            <View style={styles.pagination}>
              <Button
                title="Anterior"
                disabled={page === 1}
                onPress={async () => {
                  setPage(p => Math.max(1, p - 1));
                  setLastDoc(null);
                  await fetchPostulados(true);
                }}
              />
              <Button
                title="Siguiente"
                disabled={!hasMore}
                onPress={async () => {
                  setPage(p => p + 1);
                  await fetchPostulados();
                }}
              />
            </View>
            <PerfilModal />
          </>
        ) : (
          <DepartamentosView />
        )}
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
  adminTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: '#222',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 10,
  },
  switchBtns: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 10,
    gap: 10,
  },
  switchBtn: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginHorizontal: 8,
  },
  switchBtnActive: {
    backgroundColor: '#4CAF50',
  },
  switchBtnText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    padding: 20,
    width: '100%',
  },
  listItem: {
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    width: '100%',
    cursor: Platform.OS === 'web' ? 'pointer' : undefined,
  },
  listText: {
    fontSize: 17,
    color: '#222',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    gap: 10,
  },
  // Modal perfil
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  perfilModalContent: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 320,
    maxWidth: 500,
    width: '90%',
  },
  perfilModalContentWeb: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    minWidth: 500,
    maxWidth: 700,
    width: '80%',
  },
  fotoPerfil: {
    marginBottom: Platform.OS === 'web' ? 0 : 18,
    marginRight: Platform.OS === 'web' ? 24 : 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fotoPlaceholder: {
    width: 120,
    height: 160,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fotoText: {
    color: '#888',
    fontSize: 18,
  },
  infoPerfil: {
    flex: 1,
    alignItems: Platform.OS === 'web' ? 'flex-start' : 'center',
    justifyContent: 'center',
  },
  perfilNombre: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 10,
  },
  perfilDato: {
    fontSize: 16,
    marginBottom: 4,
    color: '#333',
  },
  perfilBotones: {
    flexDirection: 'row',
    marginTop: 18,
    gap: 12,
  },
  perfilBtn: {
    paddingVertical: 10,
    paddingHorizontal: 22,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  perfilBtnRojo: {
    backgroundColor: '#ff4d4d',
  },
  perfilBtnVerde: {
    backgroundColor: '#4CAF50',
  },
  perfilBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  departamentoModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
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
  departamentoBtn: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 8,
    minWidth: 160,
    alignItems: 'center',
  },
  departamentoBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  closeBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 6,
  },
  closeBtnText: {
    fontSize: 22,
    color: '#888',
    fontWeight: 'bold',
  },
});

