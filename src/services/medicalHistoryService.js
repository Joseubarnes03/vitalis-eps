import { db } from '../firebase/firebaseConfig';
import { collection, addDoc, getDocs } from 'firebase/firestore';

// Función para guardar un historial médico
export const saveMedicalHistory = async (data) => {
  try {
    const docRef = await addDoc(collection(db, 'medicalHistory'), data);
    console.log('Historial médico guardado con ID: ', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('Error al guardar historial médico: ', error);
    throw error;
  }
};

// Función para obtener todos los historiales médicos
export const getMedicalHistory = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'medicalHistory'));
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    return data;
  } catch (error) {
    console.error('Error al obtener historiales médicos: ', error);
    throw error;
  }
};
