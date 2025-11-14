import React, { useState, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  ScrollView, Image, ActivityIndicator, FlatList 
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const medicalServices = [
  {
    id: 1,
    name: 'Optometría',
    icon: 'remove-red-eye',
    description: 'Exámenes visuales, diagnóstico y tratamiento de enfermedades oculares',
    image: require('../../assets/optometria.png')
  },
  {
    id: 2,
    name: 'Odontología', 
    icon: 'medical-services',
    description: 'Cuidado dental integral, limpiezas, ortodoncia y tratamientos especializados',
    image: require('../../assets/odontologia.png')
  },
  {
    id: 3,
    name: 'Pediatría',
    icon: 'child-friendly',
    description: 'Atención médica especializada para niños y adolescentes',
    image: require('../../assets/pediatria.png')
  },
  {
    id: 4,
    name: 'Ginecología',
    icon: 'pregnant-woman', 
    description: 'Atención especializada en salud femenina',
    image: require('../../assets/pediatria.png')
  },
  {
    id: 5,
    name: 'Neurologia',
    icon: 'psychology',
    description: 'Especialistas en enfermedades del sistema nervioso',
    image: require('../../assets/pediatria.png')
  }
];

export default function Solicitarcita({ navigation, route }) {
  const [selectedService, setSelectedService] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [pacienteData, setPacienteData] = useState(null);

  // Recibir datos del paciente desde el dashboard
  useEffect(() => {
    if (route.params?.pacienteData) {
      setPacienteData(route.params.pacienteData);
    }
  }, [route.params]);

  // Cargar médicos cuando se selecciona una especialidad
  useEffect(() => {
    if (selectedService) {
      loadDoctorsBySpecialty(selectedService.name);
    }
  }, [selectedService]);

  const loadDoctorsBySpecialty = async (specialty) => {
    setLoading(true);
    try {
      console.log("Buscando médicos de especialidad:", specialty);
      
      const q = query(
        collection(db, 'medicos'),
        where('especialidad', '==', specialty)
      );
      const querySnapshot = await getDocs(q);
      const doctorsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log("Médicos encontrados:", doctorsData);
      setDoctors(doctorsData);
    } catch (error) {
      console.error('Error loading doctors:', error);
      alert('Error al cargar los médicos');
    } finally {
      setLoading(false);
    }
  };

  const handleDoctorSelect = (doctor) => {
    setSelectedDoctor(doctor);
  };

  const generateTimeSlots = (doctor) => {
    if (!doctor.horario) return [];
    
    const slots = [];
    const days = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
    
    days.forEach(day => {
      if (doctor.horario[day]) {
        const { inicio, fin } = doctor.horario[day];
        if (inicio && fin) {
          slots.push({
            day,
            time: `${inicio} - ${fin}`,
            display: `${getDayName(day)}: ${inicio} - ${fin}`
          });
        }
      }
    });
    
    return slots;
  };

  const getDayName = (dayKey) => {
    const days = {
      lunes: 'Lunes',
      martes: 'Martes', 
      miercoles: 'Miércoles',
      jueves: 'Jueves',
      viernes: 'Viernes',
      sabado: 'Sábado',
      domingo: 'Domingo'
    };
    return days[dayKey] || dayKey;
  };

  const handleTimeSlotSelect = async (slot) => {
    try {
      // USAR DATOS REALES DEL PACIENTE
      if (!pacienteData) {
        alert('Error: No se encontraron datos del paciente');
        return;
      }

      const appointmentData = {
        pacienteId: pacienteData.id,
        pacienteNombre: pacienteData.nombre,
        pacienteCedula: pacienteData.cedula,
        pacienteCorreo: pacienteData.correo,
        doctorId: selectedDoctor.id,
        doctorNombre: selectedDoctor.nombre,
        doctorEspecialidad: selectedDoctor.especialidad,
        especialidad: selectedService.name,
        fecha: new Date().toISOString().split('T')[0],
        horario: slot.display,
        estado: 'pendiente',
        fechaCreacion: new Date(),
        nota: `Cita agendada por ${pacienteData.nombre}`
      };

      console.log("Creando cita con datos reales:", appointmentData);
      
      // Crear la cita en Firestore
      await addDoc(collection(db, 'citas'), appointmentData);
      
      alert(`✅ Cita agendada exitosamente para ${pacienteData.nombre}`);
      
      // Regresar al dashboard del paciente
      navigation.navigate('PacienteDashboard');
      
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Error al agendar la cita: ' + error.message);
    }
  };

  // Pantalla de selección de especialidad
  if (!selectedService && !selectedDoctor) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#0E8CA4" />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Solicitar Cita</Text>
          <View style={{ width: 80 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.subtitle}>
            {pacienteData ? `Hola ${pacienteData.nombre}, selecciona la especialidad:` : 'Selecciona la especialidad médica:'}
          </Text>
          
          {medicalServices.map((service) => (
            <TouchableOpacity 
              key={service.id}
              style={styles.serviceCard}
              onPress={() => setSelectedService(service)}
              activeOpacity={0.8}
            >
              <Image source={service.image} style={styles.serviceImage} />
              <View style={styles.serviceInfo}>
                <View style={styles.serviceHeader}>
                  <MaterialIcons name={service.icon} size={24} color="#0E8CA4" />
                  <Text style={styles.serviceName}>{service.name}</Text>
                </View>
                <Text style={styles.serviceDescription}>{service.description}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={24} color="#0E8CA4" />
            </TouchableOpacity>
          ))}

          <View style={styles.infoCard}>
            <MaterialIcons name="info" size={24} color="#0E8CA4" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.infoText}>
                Recuerda que para solicitar una cita necesitas tener tu documento de identidad a mano. 
                Las citas están sujetas a disponibilidad médica.
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Loading */}
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#0E8CA4" />
            <Text style={styles.loadingText}>Cargando médicos disponibles...</Text>
          </View>
        )}
      </View>
    );
  }

  // Pantalla de selección de médico
  if (selectedService && !selectedDoctor) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedService(null)} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#0E8CA4" />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Médicos de {selectedService.name}</Text>
          <View style={{ width: 80 }} />
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#0E8CA4" />
            <Text style={styles.loadingText}>Cargando médicos disponibles...</Text>
          </View>
        ) : (
          <FlatList
            data={doctors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.doctorCard}
                onPress={() => handleDoctorSelect(item)}
              >
                <View style={styles.doctorInfo}>
                  <Text style={styles.doctorName}>{item.nombre}</Text>
                  <Text style={styles.doctorSpecialty}>{item.especialidad}</Text>
                  <Text style={styles.doctorEmail}>{item.correo}</Text>
                  <Text style={styles.doctorSchedule}>
                    Horario: {Object.keys(item.horario || {}).length} días/semana
                  </Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#0E8CA4" />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.noDoctorsText}>
                  No hay médicos disponibles para esta especialidad
                </Text>
              </View>
            }
          />
        )}
      </View>
    );
  }

  // Pantalla de selección de horario
  if (selectedDoctor) {
    const timeSlots = generateTimeSlots(selectedDoctor);
    
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setSelectedDoctor(null)} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={24} color="#0E8CA4" />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Horarios del Dr. {selectedDoctor.nombre}</Text>
          <View style={{ width: 80 }} />
        </View>

        <Text style={styles.scheduleTitle}>Horarios disponibles:</Text>
        
        <FlatList
          data={timeSlots}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.timeSlotCard}
              onPress={() => handleTimeSlotSelect(item)}
            >
              <MaterialIcons name="schedule" size={24} color="#0E8CA4" />
              <Text style={styles.timeSlotText}>{item.display}</Text>
              <MaterialIcons name="event-available" size={20} color="#4CAF50" />
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.noSlotsText}>
                No hay horarios disponibles para este médico
              </Text>
            </View>
          }
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backText: {
    color: '#0E8CA4',
    marginLeft: 5,
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E8CA4',
    textAlign: 'center',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 25,
    textAlign: 'center',
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  serviceImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 15,
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E8CA4',
    marginLeft: 10,
  },
  serviceDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E6F7FF',
    borderRadius: 12,
    padding: 15,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    color: '#0E8CA4',
    marginLeft: 10,
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    color: '#0E8CA4',
    fontSize: 16,
  },
  doctorCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
  },
  doctorInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  doctorSpecialty: {
    fontSize: 14,
    color: '#0E8CA4',
    marginTop: 2,
  },
  doctorEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  doctorSchedule: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  noDoctorsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
  scheduleTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    margin: 20,
    marginBottom: 10,
  },
  timeSlotCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
  },
  timeSlotText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
  },
  noSlotsText: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
  },
});