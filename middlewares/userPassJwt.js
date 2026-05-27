import jwt from "jsonwebtoken";

export const userPassJwt = () => {
	return async (req, res, next) => {
		const token = req.headers["authorization"]?.split(" ")[1];
		if (token !== undefined) {
			try {
				const user = jwt.verify(token, process.env.USERCOOKIESECRET);
				//console.log("token in userPassJWT: ", token);

				req.user = user.id;
			} catch (error) {
				req.user = null;
			}
		} else {
			const user = req.headers["username"];
			const pass = req.headers["password"];

			if (user !== undefined || pass !== undefined) {
				if (process.env.GEUSER === user && process.env.GEPASS === pass) {
					req.user = process.env.GEPASS;
				} else {
					req.user = null;
				}
			} else {
				req.user = null;
			}
		}

		next();
	};
};
