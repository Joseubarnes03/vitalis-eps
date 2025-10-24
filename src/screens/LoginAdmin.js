import React from 'react';
import LoginForm from '../components/LoginForm';

const LoginAdmin = ({ navigation }) => {
  return (
    <LoginForm
      title="Inicio de Sesion"
      navigation={navigation}
      destino="AdminDashboard"
      rolEsperado="admin" // ¡Esta línea es clave!
    />
  );
};

export default LoginAdmin;



