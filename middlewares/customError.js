// Este es el middleware de manejo de errores de Express.
// Siempre debe tener 4 argumentos: (err, req, res, next).
const errorHandler = (err, req, res, next) => {
	// Determina el status code y el mensaje
	const statusCode = err.statusCode || 500;
	const message = err.message || "Error interno del servidor";
	const internalCode = err.code || 99; // Código de error customizado

	// Opcional: Loguear el error en el servidor para debugging
	console.error(
		`[${err.name || "ServerError"} - Code: ${internalCode}]: ${
			err.stack || message
		}`
	);

	// Envía la respuesta en formato JSON
	res.status(statusCode).json({
		success: false,
		error: {
			message: message,
			code: internalCode,
		},
	});
};

export default errorHandler;
