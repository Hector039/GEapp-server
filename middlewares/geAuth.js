export const geAuth = () => {
	return async (req, res, next) => {
		const user = req.headers["username"];
		const pass = req.headers["password"];
		if (user !== undefined || pass !== undefined) {
			if (process.env.GEUSER === user && process.env.GEPASS === pass) {
				req.user = process.env.GEPASS;
				next();
			} else {
				req.user = null;
				next();
			}
		} else {
			req.user = null;
			next();
		}
	};
};
