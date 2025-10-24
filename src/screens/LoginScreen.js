import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ImageBackground, Image, ScrollView } from 'react-native';

export default function LoginScreen({ navigation }) {
  console.log("LoginScreen se está renderizando");

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <ImageBackground
        source={require('../../assets/bg.png')} // Usa tu imagen de fondo aquí
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <Image source={require('../../assets/vit.png')} style={styles.logo} />

          <Text style={styles.title}>¡Bienvenido a Vitalis EPS!</Text>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginMedico')}>
            <Text style={styles.buttonText}>Soy médico</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginPaciente')}>
            <Text style={styles.buttonText}>Soy paciente</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('LoginAdmin')}>
            <Text style={styles.buttonText}>Soy administrador</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Registro')}>
            <Text style={styles.link}>¿No tienes cuenta? Regístrate</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('RecuperarContrasena')}>
            <Text style={styles.link}>¿Olvidaste tu contraseña?</Text>
          </TouchableOpacity>
        </View>
      </ImageBackground>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(204, 236, 255, 0.7)', // Capa semitransparente para que no se pierda el texto
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  logo: {
    width: 130,
    height: 130,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    paddingHorizontal: 40,
    marginVertical: 10,
    borderRadius: 12,
    width: '80%',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  link: {
    color: '#007AFF',
    marginTop: 20,
    fontSize: 14,
    textAlign: 'center',
  },
});
