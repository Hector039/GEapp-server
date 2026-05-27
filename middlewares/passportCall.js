import passport from "passport";
import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export const passportCall = (strategy) => {
	return async (req, res, next) => {
		passport.authenticate(strategy, (error, user, info) => {
			if (error) return next(error);
			if (!user) {
				return next(
					new CustomError(
						info?.messages || info?.toString() || "Auth fallida",
						TErrors.INVALID_TYPES,
						400,
					),
				);
			}
			req.user = user;
			next();
		})(req, res, next);
	};
};
