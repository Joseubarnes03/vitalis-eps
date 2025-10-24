import React from 'react';
import LoginForm from '../components/LoginForm';

const LoginMedico = ({ navigation }) => {
  return (
    <LoginForm 
      title="Inicio de Sesion" 
      navigation={navigation} 
      destino="MedicoDashboard" 
      rolEsperado="medico"
    />
  );
};

export default LoginMedico;
