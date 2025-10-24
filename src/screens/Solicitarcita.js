import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

const medicalServices = [
  {
    id: 1,
    name: 'Optometría',
    screen: 'Optometria',
    icon: 'remove-red-eye',
    description: 'Exámenes visuales, diagnóstico y tratamiento de enfermedades oculares',
    image: require('../../assets/optometria.png')
  },
  {
    id: 2,
    name: 'Odontología',
    screen: 'Odontologia',
    icon: 'medical-services',
    description: 'Cuidado dental integral, limpiezas, ortodoncia y tratamientos especializados',
    image: require('../../assets/odontologia.png')
  },
  {
    id: 3,
    name: 'Pediatría',
    screen: 'Pediatria',
    icon: 'child-friendly',
    description: 'Atención médica especializada para niños y adolescentes',
    image: require('../../assets/pediatria.png')
  }
];

export default function Solicitarcita({ navigation }) {
  return (
    <View style={styles.container}>
     

      {/* Contenido principal */}
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.subtitle}>Selecciona la especialidad médica que necesitas:</Text>
        
        {medicalServices.map((service) => (
          <TouchableOpacity 
            key={service.id}
            style={styles.serviceCard}
            onPress={() => navigation.navigate(service.screen)}
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

        {/* Información adicional */}
        <View style={styles.infoCard}>
        <MaterialIcons name="info" size={24} color="#0E8CA4" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={styles.infoText}>
            Recuerda que para solicitar una cita necesitas tener tu documento de identidad a mano. Las citas están sujetas a disponibilidad médica.
          </Text>
        </View>
      </View>
        
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
  },
  header: {
    backgroundColor: '#0E8CA4',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  headerText: {
    fontSize: 20,
    color: '#FFF',
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  backButton: {
    padding: 5,
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
});