import React, { useEffect, useState } from 'react';
import { View,Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
  TextInput,
  Platform,
  KeyboardAvoidingView, StatusBar, SafeAreaView} from 'react-native';
import Modal from 'react-native-modal';
import * as Animatable from 'react-native-animatable';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { db } from '../firebase/firebaseConfig';
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';

const SPECIALTIES = [
  'Medicina General',
  'Pediatría',
  'Odontología',
  'Optometría',
  'Cardiología',
  'Ginecología',
  'Otro',
];

const DAYS = [
  { key: 'lunes', label: 'Lun' },
  { key: 'martes', label: 'Mar' },
  { key: 'miercoles', label: 'Mié' },
  { key: 'jueves', label: 'Jue' },
  { key: 'viernes', label: 'Vie' },
  { key: 'sabado', label: 'Sáb' },
  { key: 'domingo', label: 'Dom' },
];

export default function AdminDashboard({ navigation }) {
  const [medicos, setMedicos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [tabActiva, setTabActiva] = useState('medicos'); // 'medicos' | 'pacientes'
  const [busqueda, setBusqueda] = useState('');
  const [filtrados, setFiltrados] = useState([]);

  // Modales
  const [modalVisible, setModalVisible] = useState(false); // editar / agregar
  const [modalModo, setModalModo] = useState('add'); // 'add' | 'edit'
  const [modalTipo, setModalTipo] = useState('medicos'); // coleccion destino
  const [usuarioEditando, setUsuarioEditando] = useState(null);

  // Formulario
  const initialForm = {
    cedula: '',
    nombre: '',
    correo: '',
    password: '',
    rol: '', // 'medico' | 'paciente'
    especialidad: '',
    horario: {}, // objeto con dias
    diasSeleccionados: {}, // auxiliar para UI
  };
  const [formData, setFormData] = useState(initialForm);

  // Cargar datos desde Firestore
  const cargarDatos = async () => {
    try {
      setLoading(true);
      const medSnap = await getDocs(collection(db, 'medicos'));
      const pacSnap = await getDocs(collection(db, 'pacientes'));

      const medData = medSnap.docs.map(d => ({ id: d.id, ...d.data() }));
      const pacData = pacSnap.docs.map(d => ({ id: d.id, ...d.data() }));

      setMedicos(medData);
      setPacientes(pacData);

      const listaActual = tabActiva === 'medicos' ? medData : pacData;
      setFiltrados(listaActual);
    } catch (error) {
      console.error('Error cargarDatos:', error);
      mostrarAlerta('Error', 'No se pudieron cargar los datos desde Firestore.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Actualiza filtrados cuando cambian datos, tab o busqueda
  useEffect(() => {
    const listaActual = tabActiva === 'medicos' ? medicos : pacientes;
    if (!listaActual) return;
    if (busqueda.trim() === '') {
      setFiltrados(listaActual);
      return;
    }
    const q = busqueda.toLowerCase();
    const res = listaActual.filter(item =>
      (item.nombre && item.nombre.toLowerCase().includes(q)) ||
      (item.cedula && String(item.cedula).toLowerCase().includes(q)) ||
      (item.correo && item.correo.toLowerCase().includes(q))
    );
    setFiltrados(res);
  }, [busqueda, tabActiva, medicos, pacientes]);

  // Helper alert compatible web/móvil
  const mostrarAlerta = (titulo, mensaje) => {
    if (Platform.OS === 'web') {
      alert(`${titulo}\n\n${mensaje}`);
    } else {
      Alert.alert(titulo, mensaje);
    }
  };

  // Confirmación compatible
  const confirmar = (mensaje) => {
    if (Platform.OS === 'web') {
      return window.confirm(mensaje);
    } else {
      // En móvil usaremos Alert con Promise-like pattern:
      return new Promise(resolve => {
        Alert.alert(
          'Confirmar',
          mensaje,
          [
            { text: 'Cancelar', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Aceptar', onPress: () => resolve(true) },
          ],
          { cancelable: true }
        );
      });
    }
  };

  // Eliminar usuario
  const eliminarUsuario = async (id, tipo) => {
    try {
      const ok = Platform.OS === 'web' ? window.confirm('¿Deseas eliminar este registro?') : await confirmar('¿Deseas eliminar este registro?');
      if (!ok) return;
      await deleteDoc(doc(db, tipo, id));
      mostrarAlerta('Éxito', 'Registro eliminado correctamente.');
      cargarDatos();
    } catch (error) {
      console.error('Error eliminarUsuario:', error);
      mostrarAlerta('Error', 'No se pudo eliminar el registro.');
    }
  };

  // Abrir modal para agregar (según tab)
  const abrirModalAgregar = (tipo) => {
    // preset rol automático según pestaña
    const rolDefault = tipo === 'medicos' ? 'medico' : 'paciente';
    setFormData({
      ...initialForm,
      rol: rolDefault,
      especialidad: tipo === 'medicos' ? SPECIALTIES[0] : '',
      horario: {},
      diasSeleccionados: {},
    });
    setModalModo('add');
    setModalTipo(tipo);
    setUsuarioEditando(null);
    setModalVisible(true);
  };

  // Abrir modal para editar
  const abrirModalEditar = (usuario, tipo) => {
    // si usuario.horario es undefined, normalizamos
    const horario = usuario.horario || {};
    // diasSeleccionados para UI
    const diasSeleccionados = {};
    DAYS.forEach(d => {
      diasSeleccionados[d.key] = horario[d.key] ? true : false;
    });

    setFormData({
      cedula: usuario.cedula || '',
      nombre: usuario.nombre || '',
      correo: usuario.correo || '',
      password: usuario.password || '',
      rol: usuario.rol || (tipo === 'medicos' ? 'medico' : 'paciente'),
      especialidad: usuario.especialidad || (tipo === 'medicos' ? SPECIALTIES[0] : ''),
      horario: horario,
      diasSeleccionados,
    });
    setUsuarioEditando({ ...usuario, tipo });
    setModalModo('edit');
    setModalTipo(tipo);
    setModalVisible(true);
  };

  // Guardar agregado (add)
  const guardarAgregar = async () => {
    // validaciones
    if (!formData.cedula || !formData.nombre || !formData.correo || !formData.password) {
      mostrarAlerta('Error', 'Completa por favor los campos obligatorios.');
      return;
    }

    try {
      const payload = {
        cedula: formData.cedula,
        nombre: formData.nombre,
        correo: formData.correo,
        password: formData.password,
        rol: formData.rol,
      };

      const especialidadFinal = (formData.especialidad === 'Otro' && formData.especialidadOtro && formData.especialidadOtro.trim() !== '')
  ? formData.especialidadOtro.trim()
  : formData.especialidad;
  
      if (modalTipo === 'medicos') {
        payload.especialidad = especialidadFinal;
        payload.horario = formData.horario || {};
        // creamos en coleccion medicos
        await addDoc(collection(db, 'medicos'), payload);
      } else {
        // pacientes
        await addDoc(collection(db, 'pacientes'), payload);
      }

      mostrarAlerta('Éxito', `${modalTipo === 'medicos' ? 'Médico' : 'Paciente'} agregado correctamente.`);
      setModalVisible(false);
      cargarDatos();
    } catch (error) {
      console.error('Error guardarAgregar:', error);
      mostrarAlerta('Error', 'No se pudo agregar el registro.');
    }
  };

  // Guardar edición (update)
  const guardarEditar = async () => {
    if (!usuarioEditando || !usuarioEditando.id) {
      mostrarAlerta('Error', 'No hay usuario seleccionado.');
      return;
    }
    if (!formData.cedula || !formData.nombre || !formData.correo) {
      mostrarAlerta('Error', 'Completa por favor los campos obligatorios.');
      return;
    }

    try {
      const ref = doc(db, usuarioEditando.tipo, usuarioEditando.id);
      const payload = {
        cedula: formData.cedula,
        nombre: formData.nombre,
        correo: formData.correo,
        password: formData.password,
        rol: formData.rol,
      };
      const especialidadFinal = (formData.especialidad === 'Otro' && formData.especialidadOtro && formData.especialidadOtro.trim() !== '')
  ? formData.especialidadOtro.trim()
  : formData.especialidad;

      if (usuarioEditando.tipo === 'medicos') {
        payload.especialidad = especialidadFinal;
        payload.horario = formData.horario || {};
      }
      await updateDoc(ref, payload);
      mostrarAlerta('Éxito', 'Usuario actualizado correctamente.');
      setModalVisible(false);
      cargarDatos();
    } catch (error) {
      console.error('Error guardarEditar:', error);
      mostrarAlerta('Error', 'No se pudo actualizar el registro.');
    }
  };

  // Manejo días & horarios en formData
  const toggleDia = (diaKey) => {
    const nuevaSeleccion = { ...(formData.diasSeleccionados || {}) };
    nuevaSeleccion[diaKey] = !nuevaSeleccion[diaKey];

    // si se desmarca, quitar del horario
    const nuevoHorario = { ...(formData.horario || {}) };
    if (!nuevaSeleccion[diaKey]) {
      delete nuevoHorario[diaKey];
    } else {
      if (!nuevoHorario[diaKey]) {
        nuevoHorario[diaKey] = { inicio: '', fin: '' };
      }
    }

    setFormData({ ...formData, diasSeleccionados: nuevaSeleccion, horario: nuevoHorario });
  };

  const setHoraDia = (diaKey, campo, valor) => {
    const nuevoHorario = { ...(formData.horario || {}) };
    nuevoHorario[diaKey] = { ...(nuevoHorario[diaKey] || { inicio: '', fin: '' }), [campo]: valor };
    setFormData({ ...formData, horario: nuevoHorario });
  };

  // UI render tarjeta
  const renderUsuario = ({ item }, tipo) => (
    <Animatable.View animation="fadeInUp" duration={400} style={styles.card}>
      <View style={styles.cardHeader}>
        <Ionicons name={tipo === 'medicos' ? 'medkit-outline' : 'person-circle-outline'} size={28} color={tipo === 'medicos' ? '#007AFF' : '#28A745'} />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.cardTitle}>{item.nombre}</Text>
          <Text style={styles.cardSub}>{item.correo}</Text>
        </View>
      </View>

      <Text style={styles.cardText}>🆔 Cédula: {item.cedula}</Text>
      <Text style={styles.cardText}>Rol: {item.rol}</Text>
      {tipo === 'medicos' && item.especialidad ? <Text style={styles.cardText}>⭐ Especialidad: {item.especialidad}</Text> : null}

      <View style={styles.cardActions}>
        <TouchableOpacity style={styles.editButton} onPress={() => abrirModalEditar(item, tipo)}>
          <Ionicons name="create-outline" size={16} color="#fff" />
          <Text style={styles.actionText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarUsuario(item.id, tipo)}>
          <Ionicons name="trash-outline" size={16} color="#fff" />
          <Text style={styles.actionText}>Eliminar</Text>
        </TouchableOpacity>
      </View>
    </Animatable.View>
  );

  // Mostrar buscador solo si hay más de 5 registros en la lista actual
  const shouldShowSearch = () => {
    const lista = tabActiva === 'medicos' ? medicos : pacientes;
    return lista && lista.length > 5;
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={{ marginTop: 10 }}>Cargando datos...</Text>
      </View>
    );
  }

  return (
   <SafeAreaView style={{ flex: 1, backgroundColor: '#CCECFF' }}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 120 }} showsVerticalScrollIndicator={true}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Panel del Administrador</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={() => navigation.replace('Login')}>
            <Ionicons name="log-out-outline" size={20} color="#fff" />
            <Text style={styles.logoutText}>Cerrar sesión</Text>
          </TouchableOpacity>
        </View>

        {/* Agregar botón (según pestaña) */}
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => abrirModalAgregar(tabActiva)}
          >
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.actionText}>Agregar {tabActiva === 'medicos' ? 'Médico' : 'Paciente'}</Text>
          </TouchableOpacity>

          {shouldShowSearch() && (
            <View style={styles.searchContainer}>
              <Ionicons name="search-outline" size={18} color="#004AAD" style={{ marginRight: 8 }} />
              <TextInput
                placeholder="Buscar por nombre o cédula..."
                placeholderTextColor="#777"
                value={busqueda}
                onChangeText={setBusqueda}
                style={styles.searchInput}
              />
            </View>
          )}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          <TouchableOpacity style={[styles.tab, tabActiva === 'medicos' && styles.activeTab]} onPress={() => { setTabActiva('medicos'); setBusqueda(''); }}>
            <Ionicons name="medkit-outline" size={18} color="#fff" />
            <Text style={styles.tabText}>Médicos</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.tab, tabActiva === 'pacientes' && styles.activeTab]} onPress={() => { setTabActiva('pacientes'); setBusqueda(''); }}>
            <Ionicons name="people-outline" size={18} color="#fff" />
            <Text style={styles.tabText}>Pacientes</Text>
          </TouchableOpacity>
        </View>

        {/* Lista */}
        <Text style={styles.sectionTitle}>{tabActiva === 'medicos' ? '👨‍⚕️ Médicos Registrados' : '👤 Pacientes Registrados'}</Text>
        {filtrados.length === 0 ? (
          <Text style={styles.emptyText}>No hay registros.</Text>
        ) : (
          <FlatList
            data={filtrados}
            keyExtractor={(item) => item.id}
            renderItem={(props) => renderUsuario(props, tabActiva)}
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      {/* MODAL: Agregar / Editar */}
      <Modal
        isVisible={modalVisible}
        onBackdropPress={() => setModalVisible(false)}
        useNativeDriver
        hideModalContentWhileAnimating
        style={{ margin: 12 }}
      >
        <Animatable.View animation="fadeInUp" duration={300} style={styles.modal}>
          <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
            <Text style={styles.modalTitle}>{modalModo === 'add' ? `Agregar ${modalTipo === 'medicos' ? 'Médico' : 'Paciente'}` : 'Editar Usuario'}</Text>

            {/* Campos comunes */}
            <TextInput style={styles.input} placeholder="Cédula" value={formData.cedula} onChangeText={(t) => setFormData({ ...formData, cedula: t })} keyboardType="numeric" />
            <TextInput style={styles.input} placeholder="Nombre completo" value={formData.nombre} onChangeText={(t) => setFormData({ ...formData, nombre: t })} />
            <TextInput style={styles.input} placeholder="Correo" value={formData.correo} onChangeText={(t) => setFormData({ ...formData, correo: t })} keyboardType="email-address" />
            <TextInput style={styles.input} placeholder="Contraseña" secureTextEntry value={formData.password} onChangeText={(t) => setFormData({ ...formData, password: t })} />

            {/* Rol fijo según pestaña (pero mostramos por claridad) */}
            <View style={{ marginBottom: 10 }}>
              <Text style={{ color: '#666', marginBottom: 6 }}>Rol</Text>
              <View style={styles.pickerContainer}>
                <Text style={{ padding: 10 }}>{modalTipo === 'medicos' ? 'medico' : 'paciente'}</Text>
              </View>
            </View>

            {/* Si es médico, mostrar especialidad y selector de horario */}
            {modalTipo === 'medicos' && (
              <>
                <Text style={{ color: '#666', marginBottom: 6 }}>Especialidad</Text>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={formData.especialidad}
                    onValueChange={(itemVal) => setFormData({ ...formData, especialidad: itemVal })}
                    mode="dropdown"
                  >
                    {SPECIALTIES.map((s) => <Picker.Item key={s} label={s} value={s} />)}
                  </Picker>
                </View>

                {/* Si se elige 'Otro', permitimos escribir */}
{formData.especialidad === 'Otro' && (
  <TextInput
    style={styles.input}
    placeholder="Escribe la especialidad"
    value={formData.especialidadOtro || ''}
    onChangeText={(t) => setFormData({ ...formData, especialidadOtro: t })}
  />
)}

                <Text style={{ marginTop: 10, marginBottom: 6, color: '#666' }}>Horario (selecciona días y establece horas)</Text>
                {DAYS.map((d) => (
                  <View key={d.key} style={styles.dayRow}>
                    <TouchableOpacity onPress={() => toggleDia(d.key)} style={[styles.dayCheckbox, formData.diasSeleccionados && formData.diasSeleccionados[d.key] ? styles.dayChecked : null]}>
                      <Text style={{ color: formData.diasSeleccionados && formData.diasSeleccionados[d.key] ? '#fff' : '#333' }}>{d.label}</Text>
                    </TouchableOpacity>

                    {formData.diasSeleccionados && formData.diasSeleccionados[d.key] ? (
                      <View style={styles.timeInputs}>
                        <TextInput
                          placeholder="Inicio (HH:MM)"
                          value={formData.horario[d.key]?.inicio || ''}
                          onChangeText={(t) => setHoraDia(d.key, 'inicio', t)}
                          style={styles.timeInput}
                          keyboardType="numeric"
                        />
                        <TextInput
                          placeholder="Fin (HH:MM)"
                          value={formData.horario[d.key]?.fin || ''}
                          onChangeText={(t) => setHoraDia(d.key, 'fin', t)}
                          style={styles.timeInput}
                          keyboardType="numeric"
                        />
                      </View>
                    ) : (
                      <Text style={{ color: '#888', marginLeft: 10 }}>No activo</Text>
                    )}
                  </View>
                ))}
              </>
            )}

            {/* Botones */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
              <TouchableOpacity style={[styles.saveButton, { backgroundColor: '#28A745', flex: 1, marginRight: 8 }]} onPress={async () => {
                if (modalModo === 'add') {
                  // set rol automatico
                  setFormData(f => ({ ...f, rol: modalTipo === 'medicos' ? 'medico' : 'paciente' }));
                  await guardarAgregar();
                } else {
                  await guardarEditar();
                }
              }}>
                <Text style={styles.saveText}>{modalModo === 'add' ? 'Guardar' : 'Guardar cambios'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.cancelButton, { flex: 1 }]} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </Animatable.View>
      </Modal>
    </KeyboardAvoidingView>
  </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#CCECFF' },
  header: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 15,
  paddingBottom: 12,
  paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight ? StatusBar.currentHeight + 8 : 24) : 48,
},

  title: { fontSize: 22, fontWeight: 'bold', color: '#004AAD' },
  logoutButton: { flexDirection: 'row', backgroundColor: '#FF3B30', paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: '600', marginLeft: 6 },

  headerActions: { paddingHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  addButton: { backgroundColor: '#007AFF', padding: 10, borderRadius: 8, flexDirection: 'row', alignItems: 'center' },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, elevation: 3, marginLeft: 10, flex: 1 },
  searchInput: { flex: 1, fontSize: 15, color: '#000' },

  tabs: { flexDirection: 'row', backgroundColor: '#007AFF', borderRadius: 10, overflow: 'hidden', margin: 15 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10 },
  activeTab: { backgroundColor: '#005FCC' },
  tabText: { color: '#fff', fontWeight: 'bold', marginTop: 5 },

  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginVertical: 10, color: '#004AAD', paddingHorizontal: 15 },

  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginHorizontal: 15, marginBottom: 12, elevation: 3 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  cardSub: { fontSize: 13, color: '#666' },
  cardText: { fontSize: 14, color: '#555', marginTop: 3 },
  cardActions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10 },

  editButton: { backgroundColor: '#1E88E5', flexDirection: 'row', padding: 8, borderRadius: 6, alignItems: 'center', marginRight: 8 },
  deleteButton: { backgroundColor: '#FF3B30', flexDirection: 'row', padding: 8, borderRadius: 6, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: 'bold', marginLeft: 6 },

  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#CCECFF' },
  emptyText: { textAlign: 'center', color: '#555', marginVertical: 20 },

  modal: { backgroundColor: '#fff', borderRadius: 12, padding: 16, maxHeight: '90%' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#004AAD', marginBottom: 10 },

  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 10, marginBottom: 10, backgroundColor: '#fff' },

  pickerContainer: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden', marginBottom: 10, backgroundColor: '#fff' },

  dayRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dayCheckbox: { width: 44, height: 34, borderRadius: 6, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  dayChecked: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  timeInputs: { flexDirection: 'row', marginLeft: 10 },
  timeInput: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 8, width: 110, marginRight: 8 },

  saveButton: { backgroundColor: '#007AFF', padding: 12, borderRadius: 8, alignItems: 'center' },
  saveText: { color: '#fff', fontWeight: 'bold' },

  cancelButton: { backgroundColor: '#F0F0F0', padding: 12, borderRadius: 8, alignItems: 'center', marginLeft: 8 },
  cancelText: { color: '#333', fontWeight: '600' },
});

