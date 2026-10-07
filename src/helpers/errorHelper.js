export function getErrorMessage(error) {
  if (!error.response) {
    return "No fue posible conectar con Drakios. Inténtalo nuevamente más tarde.";
  }

  const status = error.response.status;
  const data = error.response.data;

  const message = Array.isArray(data?.message)
    ? data.message.join("\n")
    : data?.message;

  if (status === 400) {
    return message || "Datos inválidos. Revisa los campos del formulario.";
  }

  if (status === 401) {
    return message || "No autorizado. Inicia sesión nuevamente.";
  }

  if (status === 404) {
    return message || "Recurso no encontrado.";
  }

  if (status === 409) {
    return message || "El correo ya se encuentra registrado.";
  }

  if (status === 500) {
    return message || "Error interno del servidor.";
  }

  return message || "Ocurrió un error inesperado.";
}
