const errorHandler = (err, req, res, next) => {
	// Determina el status code y el mensaje
	const statusCode = err.statusCode || 500;
	const message = err.message || "Error interno del servidor";
	const internalCode = err.code || 99;

	console.error(
		`[${err.name || "ServerError"} - Code: ${internalCode}]: ${
			err.stack || message
		}`,
	);

	res.status(statusCode).json({
		success: false,
		error: {
			message: message,
			code: internalCode,
		},
	});
};

export default errorHandler;
