import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RecuperarTemp = ({ navigation }) => {
  const [correo, setCorreo] = useState('');
  const [codigoVerificacion, setCodigoVerificacion] = useState('');
  const [nuevaContrasena, setNuevaContrasena] = useState('');
  const [step, setStep] = useState(1); // 1: Ingresar correo, 2: Ingresar código y nueva contraseña

  const enviarCodigoVerificacion = async () => {
    if (!correo) {
      Alert.alert('Campo vacío', 'Por favor ingresa tu correo.');
      return;
    }

    try {
      let usuarioEncontrado = null;
      const keys = await AsyncStorage.getAllKeys();
      for (const key of keys) {
        if (key.startsWith('usuario_')) {
          const datos = await AsyncStorage.getItem(key);
          const usuario = JSON.parse(datos);
          if (usuario.correo === correo) {
            usuarioEncontrado = { ...usuario, key };
            break;
          }
        }
      }

      if (!usuarioEncontrado) {
        Alert.alert('Correo no registrado', 'El correo ingresado no está registrado.');
        return;
      }

      // Aquí se puede agregar el envío de un código de verificación por correo (simulado aquí)
      Alert.alert('Código enviado', 'Te hemos enviado un código de verificación al correo.');

      // Paso 2: Mostrar el formulario para ingresar el código
      setStep(2);
    } catch (error) {
      console.error('Error al enviar código:', error);
      Alert.alert('Error', 'No se pudo enviar el código. Intenta nuevamente.');
    }
  };

  const actualizarContrasena = async () => {
    if (!codigoVerificacion || !nuevaContrasena) {
      Alert.alert('Campos vacíos', 'Por favor completa todos los campos.');
      return;
    }

    try {
      // Verificar el código (simulado, en un sistema real se validaría el código enviado)
      if (codigoVerificacion !== '1234') { // Simulación de código
        Alert.alert('Código incorrecto', 'El código de verificación es incorrecto.');
        return;
      }

      // Cambiar la contraseña
      let usuarioEncontrado = null;
      const keys = await AsyncStorage.getAllKeys();
      for (const key of keys) {
        if (key.startsWith('usuario_')) {
          const datos = await AsyncStorage.getItem(key);
          const usuario = JSON.parse(datos);
          if (usuario.correo === correo) {
            usuarioEncontrado = { ...usuario, key };
            break;
          }
        }
      }

      if (!usuarioEncontrado) {
        Alert.alert('Correo no registrado', 'El correo ingresado no está registrado.');
        return;
      }

      usuarioEncontrado.password = nuevaContrasena;
      await AsyncStorage.setItem(usuarioEncontrado.key, JSON.stringify(usuarioEncontrado));

      Alert.alert('Contraseña actualizada', 'Tu contraseña ha sido cambiada correctamente.', [
        {
          text: 'OK',
          onPress: () => navigation.replace('Login'),
        },
      ]);
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      Alert.alert('Error', 'No se pudo actualizar la contraseña. Intenta nuevamente.');
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../../assets/email-lock.png')} style={styles.image} />
      <Text style={styles.title}>Recuperar Contraseña</Text>

      {step === 1 ? (
        <>
          <TextInput
            placeholder="Correo registrado"
            value={correo}
            onChangeText={setCorreo}
            style={styles.input}
            keyboardType="email-address"
          />

          <TouchableOpacity style={styles.button} onPress={enviarCodigoVerificacion}>
            <Text style={styles.buttonText}>Enviar código</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <TextInput
            placeholder="Código de verificación"
            value={codigoVerificacion}
            onChangeText={setCodigoVerificacion}
            style={styles.input}
            keyboardType="numeric"
          />
          <TextInput
            placeholder="Nueva contraseña"
            value={nuevaContrasena}
            onChangeText={setNuevaContrasena}
            style={styles.input}
            secureTextEntry
          />

          <TouchableOpacity style={styles.button} onPress={actualizarContrasena}>
            <Text style={styles.buttonText}>Actualizar contraseña</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#E8F4FF',
    alignItems: 'center', // Centra los elementos horizontalmente
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
    marginBottom: 25,
  },
  input: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 15,
    borderRadius: 10,
    paddingLeft: 10,
    backgroundColor: '#fff',
    width: '100%', // Hace que el input ocupe el 100% del contenedor pero de manera controlada
    maxWidth: 400, // Limita el ancho máximo para evitar que ocupe demasiado espacio en pantallas grandes
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    width: '100%', // Hace que el botón ocupe el 100% del contenedor pero de manera controlada
    maxWidth: 400, // Limita el ancho máximo para evitar que ocupe demasiado espacio en pantallas grandes
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  image: {
    width: 140,
    height: 140,
    alignSelf: 'center',
    marginBottom: 20,
  },
});

export default RecuperarTemp;


