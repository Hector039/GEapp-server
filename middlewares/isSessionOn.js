export const isSessionOn = () => {
	return async (req, res, next) => {
		const token = req.headers["authorization"]?.split(" ")[1];
		if (token === undefined) return next();
		return res.status(403).json({
			status: "error",
			message: "Ya has iniciado sesión. No puedes acceder a este recurso.",
		});
	};
};
