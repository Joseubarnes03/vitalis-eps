import React from 'react';
import LoginForm from '../components/LoginForm';


const LoginPaciente = ({ navigation }) => {

 
    return ( 
      <LoginForm
    
        title="Inicio de Sesion"
        navigation={navigation}
        destino="PacienteDashboard"
        rolEsperado="paciente"
      />
    );
  
  
};


export default LoginPaciente;


