export default class CustomError extends Error {
	constructor(message, code = 1, statusCode = 500) {
		super(message); // Llama al constructor de Error (establece this.message)
		this.name = "CustomError";
		this.code = code; // Tu código de error interno (ej: 1, 2, 3...)
		this.statusCode = statusCode; // Código HTTP (ej: 400, 401, 404, 500)

		// Captura el stack trace para un mejor debugging
		Error.captureStackTrace(this, CustomError);
	}

	static createError({ message, code, statusCode = 500 }) {
		// En lugar de hacer 'throw new Error()', haces 'throw new CustomError()'
		throw new CustomError(message, code, statusCode);
	}
}
