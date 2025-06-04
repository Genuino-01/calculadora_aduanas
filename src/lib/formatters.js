// Formatear números en formato de moneda
export const formatUSD = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const formatDOP = (amount) => {
  return new Intl.NumberFormat('es-DO', {
    style: 'currency',
    currency: 'DOP'
  }).format(amount);
};

// Limpiar entrada del usuario para convertirla a número
export const parseNumber = (input) => {
  if (typeof input === 'number') {
    return input;
  }
  if (typeof input === 'string') {
    // Remover caracteres no numéricos excepto el punto decimal y el signo negativo
    const cleanedInput = input.replace(/[^0-9.-]+/g,"");
    // Considerar el caso de múltiples puntos decimales o signos negativos mal ubicados
    // Esta es una simplificación; una regex más robusta podría ser necesaria.
    const parts = cleanedInput.split('.');
    let number;
    if (parts.length > 2) { // Más de un punto decimal
        number = parseFloat(parts[0] + '.' + parts.slice(1).join(''));
    } else {
        number = parseFloat(cleanedInput);
    }
    return isNaN(number) ? 0 : number; // Devolver 0 si no es un número válido
  }
  return 0; // Devolver 0 para otros tipos o si la conversión falla
};

// Validar montos (ejemplo básico)
export const validateAmount = (amount) => {
  // Usamos parseNumber para asegurar que estamos trabajando con un número limpio
  const number = parseNumber(String(amount)); // Convertir a string por si acaso es un número
  
  if (isNaN(number)) { // Si parseNumber devolvió NaN (o 0 por NaN)
    return false;
  }
  // Permitimos números positivos y cero. Ajustar si se permiten negativos.
  return number >= 0; 
};
