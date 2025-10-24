import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Modal,
  Alert 
} from 'react-native';
import { MaterialIcons, Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistorialScreen({ navigation }) {
  // Estados
  const [medicalHistory, setMedicalHistory] = useState([]);
  const [filter, setFilter] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: '',
    type: 'Consulta',
    doctor: '',
    specialty: '',
    diagnosis: '',
    treatment: ''
  });

  // Tipos de registros médicos
  const recordTypes = ['Todos', 'Consulta', 'Examen', 'Procedimiento', 'Urgencias'];

  // Cargar datos al iniciar
  useEffect(() => {
    loadMedicalHistory();
  }, []);

  // Cargar historial desde AsyncStorage
  const loadMedicalHistory = async () => {
    try {
      const savedHistory = await AsyncStorage.getItem('medicalHistory');
      if (savedHistory) {
        setMedicalHistory(JSON.parse(savedHistory));
      } else {
        // Datos de ejemplo si no hay nada guardado
        const exampleData = [
          {
            id: Date.now(),
            date: '10/11/2023',
            type: 'Consulta',
            doctor: 'Dr. Juan Pérez',
            specialty: 'Medicina General',
            diagnosis: 'Hipertensión arterial',
            treatment: 'Cambios en estilo de vida y medicación'
          },
          {
            id: Date.now() + 1,
            date: '25/10/2023',
            type: 'Examen',
            doctor: 'Dra. Laura Martínez',
            specialty: 'Laboratorio Clínico',
            diagnosis: 'Perfil lipídico',
            treatment: 'Colesterol LDL elevado (130 mg/dL)'
          }
        ];
        setMedicalHistory(exampleData);
        await AsyncStorage.setItem('medicalHistory', JSON.stringify(exampleData));
      }
    } catch (error) {
      console.error('Error al cargar historial médico:', error);
    }
  };

  // Guardar historial en AsyncStorage
  const saveMedicalHistory = async (history) => {
    try {
      await AsyncStorage.setItem('medicalHistory', JSON.stringify(history));
    } catch (error) {
      console.error('Error al guardar historial médico:', error);
    }
  };

  // Filtrar registros
  const filteredRecords = medicalHistory.filter(record => {
    const matchesFilter = filter === 'Todos' || record.type === filter;
    const matchesSearch = record.doctor.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         record.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         record.diagnosis.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Agregar nuevo registro
  const addNewRecord = async () => {
    if (!newRecord.date || !newRecord.doctor || !newRecord.diagnosis) {
      Alert.alert('Error', 'Por favor complete los campos obligatorios');
      return;
    }

    const recordToAdd = {
      id: Date.now(),
      ...newRecord
    };

    const updatedHistory = [...medicalHistory, recordToAdd];
    setMedicalHistory(updatedHistory);
    await saveMedicalHistory(updatedHistory);
    setModalVisible(false);
    setNewRecord({
      date: '',
      type: 'Consulta',
      doctor: '',
      specialty: '',
      diagnosis: '',
      treatment: ''
    });
  };

  // Eliminar registro
  const deleteRecord = async (id) => {
    Alert.alert(
      'Confirmar',
      '¿Está seguro que desea eliminar este registro?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            const updatedHistory = medicalHistory.filter(record => record.id !== id);
            setMedicalHistory(updatedHistory);
            await saveMedicalHistory(updatedHistory);
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <Text style={styles.title}>Historial Médico</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Feather name="plus" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Barra de búsqueda */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar en historial..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filtros */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {recordTypes.map((type) => (
          <TouchableOpacity 
            key={type}
            style={[
              styles.filterButton,
              filter === type && styles.filterButtonActive
            ]}
            onPress={() => setFilter(type)}
          >
            <Text style={[
              styles.filterButtonText,
              filter === type && styles.filterButtonActiveText
            ]}>
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Lista de registros */}
      <ScrollView style={styles.content}>
        {filteredRecords.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialIcons name="folder" size={50} color="#E0E0E0" />
            <Text style={styles.emptyStateText}>No se encontraron registros</Text>
          </View>
        ) : (
          filteredRecords.map((record) => (
            <View key={record.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardDate}>{record.date}</Text>
                <View style={styles.typeBadge}>
                  <Text style={styles.typeText}>{record.type}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => deleteRecord(record.id)}
                >
                  <MaterialIcons name="delete" size={18} color="#F44336" />
                </TouchableOpacity>
              </View>
              
              <Text style={styles.cardTitle}>{record.doctor}</Text>
              <Text style={styles.cardSubtitle}>{record.specialty}</Text>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Diagnóstico:</Text>
                <Text style={styles.sectionContent}>{record.diagnosis}</Text>
              </View>
              
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Tratamiento:</Text>
                <Text style={styles.sectionContent}>{record.treatment}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.detailsButton}
                 onPress={() => navigation.navigate('HistorialMedico')}
              >
                <Text style={styles.detailsButtonText}>Ver detalles completos</Text>
                <MaterialIcons name="chevron-right" size={20} color="#007AFF" />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal para agregar nuevo registro */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Agregar Registro Médico</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Fecha*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="DD/MM/AAAA"
                  value={newRecord.date}
                  onChangeText={(text) => setNewRecord({...newRecord, date: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tipo*</Text>
                <View style={styles.typeSelector}>
                  {['Consulta', 'Examen', 'Procedimiento', 'Urgencias'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeOption,
                        newRecord.type === type && styles.typeOptionSelected
                      ]}
                      onPress={() => setNewRecord({...newRecord, type})}
                    >
                      <Text style={[
                        styles.typeOptionText,
                        newRecord.type === type && styles.typeOptionTextSelected
                      ]}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Médico*</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del médico"
                  value={newRecord.doctor}
                  onChangeText={(text) => setNewRecord({...newRecord, doctor: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Especialidad</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Especialidad médica"
                  value={newRecord.specialty}
                  onChangeText={(text) => setNewRecord({...newRecord, specialty: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Diagnóstico*</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Descripción del diagnóstico"
                  multiline
                  value={newRecord.diagnosis}
                  onChangeText={(text) => setNewRecord({...newRecord, diagnosis: text})}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tratamiento</Text>
                <TextInput
                  style={[styles.input, styles.multilineInput]}
                  placeholder="Tratamiento indicado"
                  multiline
                  value={newRecord.treatment}
                  onChangeText={(text) => setNewRecord({...newRecord, treatment: text})}
                />
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={addNewRecord}
              >
                <Text style={styles.saveButtonText}>Guardar Registro</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de detalles */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={!!selectedRecord}
        onRequestClose={() => setSelectedRecord(null)}
      >
        {selectedRecord && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Detalles del Registro</Text>
                <TouchableOpacity onPress={() => setSelectedRecord(null)}>
                  <MaterialIcons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Fecha:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.date}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Tipo:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.type}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Médico:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.doctor}</Text>
                </View>

                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Especialidad:</Text>
                  <Text style={styles.detailValue}>{selectedRecord.specialty}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Diagnóstico:</Text>
                  <Text style={styles.detailText}>{selectedRecord.diagnosis}</Text>
                </View>

                <View style={styles.detailSection}>
                  <Text style={styles.detailLabel}>Tratamiento:</Text>
                  <Text style={styles.detailText}>{selectedRecord.treatment}</Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={() => setSelectedRecord(null)}
                >
                  <Text style={styles.closeButtonText}>Cerrar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: 'white',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0E8CA4',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 15,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  filterContainer: {
    marginHorizontal: 15,
    marginBottom: 15,
  },
  filterContent: {
    paddingRight: 15,
  },
  filterButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterButtonText: {
    color: '#666',
    fontSize: 12,
  },
  filterButtonActiveText: {
    color: 'white',
  },
  content: {
    paddingHorizontal: 15,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyStateText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardDate: {
    fontWeight: 'bold',
    color: '#333',
  },
  typeBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  typeText: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    padding: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0E8CA4',
    marginBottom: 5,
  },
  cardSubtitle: {
    color: '#666',
    marginBottom: 15,
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionContent: {
    color: '#666',
    lineHeight: 20,
  },
  detailsButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  detailsButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  // Estilos para modales
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E8CA4',
  },
  modalBody: {
    padding: 15,
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    marginBottom: 5,
    fontWeight: 'bold',
    color: '#333',
  },
  input: {
    backgroundColor: '#F5F5F5',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  typeOption: {
    backgroundColor: '#E0E0E0',
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8,
  },
  typeOptionSelected: {
    backgroundColor: '#007AFF',
  },
  typeOptionText: {
    color: '#666',
    fontSize: 12,
  },
  typeOptionTextSelected: {
    color: 'white',
  },
  cancelButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  cancelButtonText: {
    color: '#666',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingHorizontal: 15,
    paddingVertical: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#007AFF',
    borderRadius: 5,
    paddingHorizontal: 20,
    paddingVertical: 8,
  },
  closeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailLabel: {
    fontWeight: 'bold',
    color: '#333',
  },
  detailValue: {
    color: '#666',
  },
  detailSection: {
    marginBottom: 20,
  },
  detailText: {
    color: '#666',
    lineHeight: 22,
    marginTop: 5,
  },
});