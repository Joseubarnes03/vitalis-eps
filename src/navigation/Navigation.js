import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginMedico from '../screens/LoginMedico';
import LoginPaciente from '../screens/LoginPaciente';
import LoginAdmin from '../screens/LoginAdmin';

navigation.navigate('HistorialScreen', { auth: userAuthData });
const Stack = createStackNavigator();

const Navigation = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginMedico">
        <Stack.Screen name="LoginMedico" component={LoginMedico} />
        <Stack.Screen name="LoginPaciente" component={LoginPaciente} />
        <Stack.Screen name="LoginAdmin" component={LoginAdmin} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};



export default Navigation;
