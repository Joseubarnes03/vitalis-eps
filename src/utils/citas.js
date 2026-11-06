// Funciones compartidas por las pantallas de citas (Odontología, Optometría y Pediatría)

// Validación de correo sin expresiones regulares costosas (evita backtracking)
export const esCorreoValido = (correo) => {
  const arroba = correo.indexOf('@');
  const punto = correo.lastIndexOf('.');
  return arroba > 0 && punto > arroba + 1 && punto < correo.length - 1 && !/\s/.test(correo);
};

export const textoVisitado = (visitado) => {
  if (visitado === true) return 'Sí';
  if (visitado === false) return 'No';
  return 'No especificado';
};
