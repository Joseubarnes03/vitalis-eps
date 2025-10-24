import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'RESULTADOS_MEDICOS';

export default function ResultadosMe({ navigation }) {
  const [nombre, setNombre] = useState('');
  const [cedula, setCedula] = useState('');
  const [resultados, setResultados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Cargar resultados de ejemplo al iniciar
  useEffect(() => {
    const cargarResultadosEjemplo = async () => {
      try {
        const data = await AsyncStorage.getItem(STORAGE_KEY);
        if (!data) {
          const resultadosIniciales = [
            { id: 1, nombre: 'Juan Pérez', cedula: '123456789', tipo: 'Hematología', fecha: '2023-05-15', archivo: 'hemograma_juan.pdf' },
            { id: 2, nombre: 'María Gómez', cedula: '987654321', tipo: 'Radiología', fecha: '2023-06-20', archivo: 'radiografia_maria.pdf' },
          ];
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(resultadosIniciales));
        }
      } catch (error) {
        console.error('Error al cargar resultados iniciales:', error);
      }
    };

    cargarResultadosEjemplo();
  }, []);

  const buscarResultados = async () => {
    if (!nombre.trim() || !cedula.trim()) {
      Alert.alert('Error', 'Por favor ingresa nombre y cédula');
      return;
    }

    setLoading(true);
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const todosResultados = data ? JSON.parse(data) : [];
      
      // Filtrar resultados por nombre y cédula (búsqueda aproximada)
      const encontrados = todosResultados.filter(r => 
        r.nombre.toLowerCase().includes(nombre.toLowerCase()) && 
        r.cedula.includes(cedula)
      );

      setResultados(encontrados);
      setSearchPerformed(true);
    } catch (error) {
      console.error('Error al buscar resultados:', error);
      Alert.alert('Error', 'No se pudieron cargar los resultados');
    } finally {
      setLoading(false);
    }
  };

  const descargarResultado = async (archivo) => {
    // En una app real, aquí se descargaría de un servidor
    // Simulamos la descarga creando un archivo temporal
    
    try {
      setLoading(true);
      const fileUri = FileSystem.documentDirectory + archivo;
      
      // Crear un archivo de ejemplo (en producción sería la descarga real)
      await FileSystem.writeAsStringAsync(fileUri, `Resultados médicos para ${archivo}\n\nEsto es un ejemplo de resultados médicos.`, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Compartir resultados médicos',
        UTI: 'com.adobe.pdf'
      });
    } catch (error) {
      console.error('Error al descargar:', error);
      Alert.alert('Error', 'No se pudo descargar el archivo');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
     
      {/* Formulario de búsqueda */}
      <View style={styles.searchContainer}>
        <Text style={styles.sectionTitle}>Buscar Resultados</Text>
        
        <Text style={styles.label}>Nombre del Paciente</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu nombre completo"
          value={nombre}
          onChangeText={setNombre}
        />

        <Text style={styles.label}>Número de Cédula</Text>
        <TextInput
          style={styles.input}
          placeholder="Ingresa tu cédula"
          keyboardType="numeric"
          value={cedula}
          onChangeText={setCedula}
        />

        <TouchableOpacity 
          style={styles.searchButton} 
          onPress={buscarResultados}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <>
              <MaterialIcons name="search" size={20} color="#FFF" />
              <Text style={styles.buttonText}>Buscar Resultados</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Resultados */}
      <View style={styles.resultsContainer}>
        <Text style={styles.sectionTitle}>
          {searchPerformed ? `Resultados encontrados (${resultados.length})` : 'Ingresa tus datos para buscar'}
        </Text>

        {loading ? (
          <ActivityIndicator size="large" color="#0E8CA4" />
        ) : resultados.length > 0 ? (
          resultados.map((resultado) => (
            <View key={resultado.id} style={styles.resultCard}>
              <View style={styles.resultInfo}>
                <Text style={styles.resultType}>{resultado.tipo}</Text>
                <Text style={styles.resultDate}>{resultado.fecha}</Text>
              </View>
              
              <TouchableOpacity 
                style={styles.downloadButton}
                onPress={() => descargarResultado(resultado.archivo)}
              >
                <MaterialIcons name="cloud-download" size={20} color="#0E8CA4" />
                <Text style={styles.downloadText}>Descargar</Text>
              </TouchableOpacity>
            </View>
          ))
        ) : searchPerformed ? (
          <Text style={styles.noResultsText}>No se encontraron resultados</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F9FF',
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
  searchContainer: {
    padding: 20,
    backgroundColor: '#FFF',
    margin: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0E8CA4',
    marginBottom: 15,
    textAlign: 'center',
  },
  label: {
    fontSize: 14,
    color: '#555',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    marginBottom: 10,
  },
  searchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E8CA4',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  buttonText: {
    color: '#FFF',
    fontWeight: 'bold',
    marginLeft: 10,
    fontSize: 16,
  },
  resultsContainer: {
    flex: 1,
    padding: 20,
  },
  resultCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  resultInfo: {
    flex: 1,
  },
  resultType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  resultDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  downloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E6F7FF',
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0E8CA4',
  },
  downloadText: {
    color: '#0E8CA4',
    fontWeight: 'bold',
    marginLeft: 5,
  },
  noResultsText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
    fontSize: 16,
  },
});