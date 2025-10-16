export const isSessionOn = () => {
	return async (req, res, next) => {
		const token = req.headers["authorization"]?.split(" ")[1];
		if (token === undefined) return next();
	};
};
