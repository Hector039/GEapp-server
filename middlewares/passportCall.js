import passport from "passport";
import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";

export const passportCall = (strategy) => {
	return async (req, res, next) => {
		passport.authenticate(strategy, (error, user, info) => {
			if (error) return next(error);
			if (!user) {
				CustomError.createError({
					message: info.messages ? info.messages : info.toString(),
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}
			req.user = user;
			next();
		})(req, res, next);
	};
};
