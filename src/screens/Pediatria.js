import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Platform, ScrollView } from 'react-native';
import { MaterialIcons, FontAwesome } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

const STORAGE_KEY = 'CITAS';
const MEDICOS_PEDIATRIA = [
  'Dra. María Fernández - Pediatría General',
  'Dr. Carlos Gómez - Neonatología',
  'Dra. Laura Vargas - Cardiología Pediátrica',
  'Dr. Javier Ramírez - Neurología Pediátrica'
];

export default function AgendaCitaPediatria({ navigation }) {
  const [form, setForm] = useState({
    dia: '',
    hora: '',
    nombre: '',
    apellido: '',
    cedula: '',
    correo: '',
    medico: '',
    visitado: null,
    tipoCita: 'Pediatría',
    motivo: '',
    edadPaciente: ''
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [activeField, setActiveField] = useState(null);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
  };

  const handleFocus = (field) => {
    setActiveField(field);
  };

  const handleBlur = () => {
    setActiveField(null);
  };

  const showDate = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const dateString = selectedDate.toISOString().split('T')[0];
      handleChange('dia', dateString);
    }
  };

  const showTime = (event, selectedTime) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const hours = selectedTime.getHours().toString().padStart(2, '0');
      const minutes = selectedTime.getMinutes().toString().padStart(2, '0');
      handleChange('hora', `${hours}:${minutes}`);
    }
  };

  const getCitas = async () => {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error al obtener las citas:', error);
      Alert.alert('Error', 'No se pudieron cargar las citas existentes');
      return [];
    }
  };

  const agregarCita = async (cita) => {
    try {
      const citas = await getCitas();
      const nuevasCitas = [...citas, cita];
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasCitas));
      return true;
    } catch (error) {
      console.error('Error al agregar la cita:', error);
      Alert.alert('Error', 'No se pudo guardar la cita');
      return false;
    }
  };

  const validarFormulario = () => {
    const { dia, hora, nombre, apellido, cedula, correo, medico, motivo, edadPaciente } = form;
    const errores = [];

    if (!nombre) errores.push('Nombre es requerido');
    if (!apellido) errores.push('Apellido es requerido');
    if (!cedula) errores.push('Cédula es requerida');
    if (!correo || !/^\S+@\S+\.\S+$/.test(correo)) errores.push('Correo electrónico no válido');
    if (!dia) errores.push('Fecha es requerida');
    if (!hora) errores.push('Hora es requerida');
    if (!medico) errores.push('Médico es requerido');
    if (!motivo) errores.push('Motivo de consulta es requerido');
    if (!edadPaciente || isNaN(edadPaciente)) errores.push('Edad del paciente no válida');

    return errores;
  };

  const handleSubmit = async () => {
    const errores = validarFormulario();
    
    if (errores.length > 0) {
      Alert.alert('Error en el formulario', errores.join('\n'));
      return;
    }

    const cita = { 
      ...form, 
      id: Date.now(),
      fechaCreacion: new Date().toISOString()
    };

    const success = await agregarCita(cita);
    
    if (success) {
      Alert.alert(
        'Cita Confirmada', 
        `Tu cita de pediatría ha sido agendada para el ${form.dia} a las ${form.hora} con ${form.medico.split(' - ')[0]}`,
        [
          { 
            text: 'OK', 
            onPress: () => {
              setForm({
                dia: '',
                hora: '',
                nombre: '',
                apellido: '',
                cedula: '',
                correo: '',
                medico: '',
                visitado: null,
                tipoCita: 'Pediatría',
                motivo: '',
                edadPaciente: ''
              });
              navigation.navigate('PacienteDashboard');
            }
          }
        ]
      );
    }
  };

  const seleccionarMedico = () => {
    Alert.alert(
      'Seleccionar Pediatra',
      'Elija un especialista para su cita',
      [
        ...MEDICOS_PEDIATRIA.map(medico => ({
          text: medico,
          onPress: () => handleChange('medico', medico)
        })),
        { text: 'Cancelar', style: 'cancel' },
      ],
      { cancelable: true }
    );
  };

  const exportarCitas = async () => {
    try {
      const citas = await getCitas();
      const citasPediatria = citas.filter(c => c.tipoCita === 'Pediatría');

      if (!citasPediatria.length) {
        Alert.alert('No hay citas', 'No hay citas de pediatría para exportar.');
        return;
      }

      const contenido = citasPediatria.map(cita => 
        `Paciente: ${cita.nombre} ${cita.apellido} (${cita.edadPaciente} años)
Cédula: ${cita.cedula}
Fecha: ${cita.dia} ${cita.hora}
Médico: ${cita.medico}
Motivo: ${cita.motivo}
Visitado antes: ${cita.visitado ? 'Sí' : 'No'}
Correo: ${cita.correo}
Fecha registro: ${new Date(cita.fechaCreacion).toLocaleString()}\n`
      ).join('\n');

      const fileUri = FileSystem.documentDirectory + 'citas_pediatria.txt';
      await FileSystem.writeAsStringAsync(fileUri, contenido);

      await Sharing.shareAsync(fileUri, {
        mimeType: 'text/plain',
        dialogTitle: 'Exportar citas de pediatría',
        UTI: 'public.plain-text'
      });
    } catch (error) {
      console.error('Error al exportar citas:', error);
      Alert.alert('Error', 'No se pudo exportar las citas.');
    }
  };

  const mostrarResumen = () => {
    if (!form.nombre && !form.apellido) {
      Alert.alert('Información incompleta', 'Complete los datos primero');
      return;
    }

    Alert.alert(
      'Resumen de Cita',
      `Paciente: ${form.nombre} ${form.apellido}
Edad: ${form.edadPaciente || 'No especificada'} años
Fecha: ${form.dia || 'No especificada'} ${form.hora || ''}
Médico: ${form.medico || 'No seleccionado'}
Motivo: ${form.motivo || 'No especificado'}
Visitado antes: ${form.visitado === true ? 'Sí' : form.visitado === false ? 'No' : 'No especificado'}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.scrollContainer}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.container}>
        

        <View style={styles.formContainer}>
          {/* Información del paciente */}
          <Text style={styles.sectionTitle}>Datos del Paciente</Text>
          
          <View style={styles.inputRow}>
            <TextInput
              placeholder="Nombre"
              style={[styles.input, activeField === 'nombre' && styles.activeInput]}
              value={form.nombre}
              onChangeText={(text) => handleChange('nombre', text)}
              onFocus={() => handleFocus('nombre')}
              onBlur={handleBlur}
            />
            
          </View>

          <View style={styles.inputRow}>
            <TextInput
              placeholder="CC O TI"
              style={[styles.input, activeField === 'cedula' && styles.activeInput]}
              value={form.cedula}
              onChangeText={(text) => handleChange('cedula', text)}
              keyboardType="numeric"
              onFocus={() => handleFocus('cedula')}
              onBlur={handleBlur}
            />
            <TextInput
              placeholder="Edad del paciente"
              style={[styles.input, activeField === 'edadPaciente' && styles.activeInput]}
              value={form.edadPaciente}
              onChangeText={(text) => handleChange('edadPaciente', text)}
              keyboardType="numeric"
              onFocus={() => handleFocus('edadPaciente')}
              onBlur={handleBlur}
            />
          </View>

          <TextInput
            placeholder="Correo electrónico"
            style={[styles.input, activeField === 'correo' && styles.activeInput]}
            value={form.correo}
            onChangeText={(text) => handleChange('correo', text)}
            keyboardType="email-address"
            autoCapitalize="none"
            onFocus={() => handleFocus('correo')}
            onBlur={handleBlur}
          />

          <TextInput
            placeholder="Motivo de la consulta"
            style={[styles.input, styles.multilineInput, activeField === 'motivo' && styles.activeInput]}
            value={form.motivo}
            onChangeText={(text) => handleChange('motivo', text)}
            multiline
            numberOfLines={3}
            onFocus={() => handleFocus('motivo')}
            onBlur={handleBlur}
          />

          {/* Fecha y hora */}
          <Text style={styles.sectionTitle}>Fecha y Hora</Text>
          
          <View style={styles.inputRow}>
            <TouchableOpacity 
              style={[styles.input, styles.dateInput]}
              onPress={() => setShowDatePicker(true)}
            >
              <MaterialIcons name="calendar-today" size={18} color="#0E8CA4" />
              <Text style={[styles.dateText, !form.dia && styles.placeholderText]}>
                {form.dia || 'Seleccionar fecha'}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.input, styles.dateInput]}
              onPress={() => setShowTimePicker(true)}
            >
              <MaterialIcons name="access-time" size={18} color="#0E8CA4" />
              <Text style={[styles.dateText, !form.hora && styles.placeholderText]}>
                {form.hora || 'Seleccionar hora'}
              </Text>
            </TouchableOpacity>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={form.dia ? new Date(form.dia) : new Date()}
              mode="date"
              minimumDate={new Date()}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={showDate}
            />
          )}

          {showTimePicker && (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={true}
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={showTime}
            />
          )}

          {/* Selección de médico */}
          <Text style={styles.sectionTitle}>Especialista</Text>
          
          <TouchableOpacity 
            style={[styles.input, styles.medicoInput]}
            onPress={seleccionarMedico}
          >
            <MaterialIcons name="medical-services" size={18} color="#0E8CA4" />
            <Text style={[styles.medicoText, !form.medico && styles.placeholderText]}>
              {form.medico || 'Seleccionar pediatra'}
            </Text>
            <MaterialIcons name="arrow-drop-down" size={24} color="#0E8CA4" />
          </TouchableOpacity>

          {/* Visitado antes */}
          <Text style={styles.sectionTitle}>¿Nos ha visitado antes?</Text>
          
          <View style={styles.visitadoContainer}>
            <TouchableOpacity 
              style={[styles.visitadoButton, form.visitado === true && styles.visitadoSelected]}
              onPress={() => handleChange('visitado', true)}
            >
              <MaterialIcons name="check" size={20} color={form.visitado === true ? '#FFF' : '#0E8CA4'} />
              <Text style={[styles.visitadoText, form.visitado === true && styles.visitadoSelectedText]}>Sí</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.visitadoButton, form.visitado === false && styles.visitadoSelected]}
              onPress={() => handleChange('visitado', false)}
            >
              <MaterialIcons name="close" size={20} color={form.visitado === false ? '#FFF' : '#0E8CA4'} />
              <Text style={[styles.visitadoText, form.visitado === false && styles.visitadoSelectedText]}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Botones de acción */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.resumeButton]}
            onPress={mostrarResumen}
          >
            <MaterialIcons name="visibility" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Ver Resumen</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.exportButton]}
            onPress={exportarCitas}
          >
            <MaterialIcons name="file-download" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Exportar</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.submitButton]}
            onPress={handleSubmit}
          >
            <MaterialIcons name="check-circle" size={20} color="#FFF" />
            <Text style={styles.buttonText}>Confirmar Cita</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F5F9FF',
  },
  container: {
    flex: 1,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E8CA4',
    paddingVertical: 15,
    paddingHorizontal: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  backButton: {
    marginRight: 15,
  },
  headerText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  formContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0E8CA4',
    marginBottom: 10,
    marginTop: 15,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  input: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeInput: {
    borderColor: '#0E8CA4',
    backgroundColor: '#F0F9FF',
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  dateInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  dateText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  medicoInput: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  medicoText: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#888',
  },
  visitadoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  visitadoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0E8CA4',
    backgroundColor: '#FFF',
    width: '45%',
    justifyContent: 'center',
  },
  visitadoSelected: {
    backgroundColor: '#0E8CA4',
    borderColor: '#0E8CA4',
  },
  visitadoText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#0E8CA4',
    fontWeight: '500',
  },
  visitadoSelectedText: {
    color: '#FFF',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  resumeButton: {
    backgroundColor: '#4DA6FF',
  },
  exportButton: {
    backgroundColor: '#6c757d',
  },
  submitButton: {
    backgroundColor: '#28a745',
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});