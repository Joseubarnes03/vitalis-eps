import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, Image } from 'react-native';
import * as Animatable from 'react-native-animatable';
import { getFirestore, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

const LoginForm = ({ title, navigation, rolEsperado }) => {
  const [cedula, setCedula] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!cedula || !password) {
      Alert.alert('Error', 'Por favor ingresa la cédula y la contraseña.');
      return;
    }

    try {
      setLoading(true);

      // Determinar la colección según el rol
      let coleccion = '';
      if (rolEsperado === 'medico') coleccion = 'medicos';
      else if (rolEsperado === 'paciente') coleccion = 'pacientes';
      else if (rolEsperado === 'admin') coleccion = 'administradores';
      else {
        Alert.alert('Error', 'Rol no reconocido.');
        return;
      }

      // Buscar el usuario por cédula en la colección correspondiente
      const q = query(collection(db, coleccion), where('cedula', '==', cedula.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert('Error', 'Usuario no encontrado en la base de datos.');
        setLoading(false);
        return;
      }

      // Validar contraseña
      let usuarioEncontrado = null;
      querySnapshot.forEach((doc) => {
        usuarioEncontrado = doc.data();
      });

      if (usuarioEncontrado.password !== password) {
        Alert.alert('Error', 'Contraseña incorrecta.');
        setLoading(false);
        return;
      }

      // Navegación según el rol
      if (rolEsperado === 'admin') navigation.navigate('AdminDashboard');
      else if (rolEsperado === 'medico') navigation.navigate('MedicoDashboard');
      else if (rolEsperado === 'paciente') navigation.navigate('PacienteDashboard');

      Alert.alert('Bienvenido', `Hola ${usuarioEncontrado.nombre}`);

    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      Alert.alert('Error', 'Ocurrió un problema al iniciar sesión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/doctor.png')} style={styles.image} />
      <Animatable.Text animation="fadeInDown" style={styles.title}>
        {title || 'Iniciar Sesión'}
      </Animatable.Text>

      <TextInput
        style={styles.input}
        placeholder="Cédula"
        keyboardType="numeric"
        value={cedula}
        onChangeText={setCedula}
      />

      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Ingresando...' : 'Entrar'}</Text>
      </TouchableOpacity>

      {rolEsperado === 'medico' && (
        <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
          <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('RecuperarContrasena')}>
        <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#CCECFF',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#004AAD',
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 18,
    borderRadius: 8,
    paddingLeft: 15,
    backgroundColor: '#fff',
    width: '80%',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 150,
    height: 150,
    marginBottom: 25,
  },
  link: {
    color: '#007AFF',
    marginTop: 15,
    textAlign: 'center',
  },
});

export default LoginForm;


