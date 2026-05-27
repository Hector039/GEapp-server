import { generateToken, createHash, isValidPass } from "../tools/utils.js";
import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";
import {
	RECOMMENDED_DAILY_STEPS,
	HOURS_TO_COUNT_STEPS,
	SESSION_REWARD,
	STREAK_REWARD,
} from "../constants/constants.js";
import {
	deactivateUserMailer,
	passRestorationMailer,
	welcomeMailer,
} from "../tools/mailer.js";

export default class UsersController {
	constructor(repo) {
		this.usersRepo = repo;
	}

	userSignin = async (req, res, next) => {
		/* const user = req.user;
		if (user) {
			await welcomeMailer(user);
		} */
		res.status(200).json({
			ok: true,
		});
	};

	userLogin = async (req, res, next) => {
		try {
			const user = req.user;
			const {
				orgEventId: { projectId, ...orgEvent },
				...userData
			} = user;

			// console.log("project in controller: ", projectId);
			// console.log("orgEvent in controller: ", orgEvent);
			// console.log("user in controller: ", userData);

			let token = generateToken({ id: userData._id });
			res.status(200).send({
				user: {
					id: userData._id,
					email: userData.email,
					avatar: userData.avatar,
					totalSteps: userData.totalSteps,
					registerDate: userData.registerDate,
					status: userData.status,
					streak: userData.streak,
					token,
					lastCheckReward: userData.lastCheckReward,
					hasSeenOnBoarding: userData.hasSeenOnBoarding,
					RECOMMENDED_DAILY_STEPS,
					HOURS_TO_COUNT_STEPS,
					SESSION_REWARD,
					STREAK_REWARD,
				},
				orgEvent,
				project: projectId,
			});
		} catch (error) {
			next(error);
		}
	};

	updateUserPassword = async (req, res, next) => {
		const { oldPassword, newPassword } = req.body;
		try {
			const user = await this.usersRepo.getUserWithPassword(req.user);
			if (!user) {
				CustomError.createError({
					message: `Usuario no encontrado.`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}

			if (!isValidPass(oldPassword, user.password)) {
				CustomError.createError({
					message: "La contraseña anterior es incorrecta.",
					code: TErrors.INVALID_TYPES,
					statusCode: 409,
				});
			}

			if (isValidPass(newPassword, user.password)) {
				CustomError.createError({
					message: "La contraseña debe ser diferente a la anterior.",
					code: TErrors.INVALID_TYPES,
					statusCode: 409,
				});
			}
			await this.usersRepo.updateUserField(
				req.user,
				"password",
				createHash(newPassword),
			);
			res.status(200).json({
				ok: true,
			});
		} catch (error) {
			next(error);
		}
	};

	updateUserEmail = async (req, res, next) => {
		const { newEmail } = req.body;
		try {
			const user = await this.usersRepo.getUser(req.user);
			if (!user) {
				CustomError.createError({
					message: `Usuario no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			const isEmailTaken = await this.usersRepo.isEmailTaken(newEmail);
			if (isEmailTaken) {
				CustomError.createError({
					message: `El email ${newEmail} ya está en uso.`,
					code: TErrors.CONFLICT,
					statusCode: 409,
				});
			}
			await this.usersRepo.updateUserField(req.user, "email", newEmail);
			res.status(200).json({
				ok: true,
			});
		} catch (error) {
			next(error);
		}
	};

	updateUserAvatar = async (req, res, next) => {
		const avatar = req.file;
		try {
			if (!avatar) {
				CustomError.createError({
					message: "No se recibió ningún archivo.",
					code: TErrors.INVALID_TYPES,
					statusCode: 409,
				});
			}
			const avatarPath = `http://${process.env.LOCAL_IP}:${process.env.PORT}/${avatar.filename}`;
			await this.usersRepo.updateUserField(req.user, "avatar", avatarPath);
			res.status(200).send(avatarPath);
		} catch (error) {
			next(error);
		}
	};

	updateUserStatus = async (req, res, next) => {
		try {
			const user = await this.usersRepo.getUser(req.user);
			if (!user) {
				CustomError.createError({
					message: `Usuario no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			/* if (user.status) {
				await deactivateUserMailer(user);
			} else {
				await welcomeMailer(user);
			} */
			await this.usersRepo.updateUserField(req.user, "status", !user.status);
			res.status(200).json({
				ok: true,
			});
		} catch (error) {
			next(error);
		}
	};

	reactivateUserStatus = async (req, res, next) => {
		try {
			const user = await this.usersRepo.getUser(req.user);
			if (!user) {
				CustomError.createError({
					message: `Usuario email no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}

			await this.usersRepo.updateUserField(req.user, "status", !user.status);
			res.status(200).json({
				ok: true,
			});
		} catch (error) {
			next(error);
		}
	};

	updateUserTotalSteps = async (req, res, next) => {
		const { steps } = req.body;
		try {
			if (!steps) {
				CustomError.createError({
					message: `Faltan datos o están erróneos.`,
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}

			const newSteps = Number(steps);
			if (!Number.isInteger(newSteps) || newSteps < 0 || newSteps > 80000) {
				CustomError.createError({
					message: `Pasos inválidos.`,
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}

			const user = await this.usersRepo.getUser(req.user);
			if (!user) {
				CustomError.createError({
					message: `Usuario no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			await this.usersRepo.updateUserField(req.user, "totalSteps", newSteps);
			res.status(200).send({ newTotalSteps: user.totalSteps + newSteps });
		} catch (error) {
			next(error);
		}
	};

	sendRestorationEmail = async (req, res, next) => {
		const { email } = req.params;
		try {
			const user = await this.usersRepo.getUser(email);
			if (user === null) {
				CustomError.createError({
					message: `Usuario con email ${email} no encontrado`,
					code: TErrors.INVALID_TYPES,
					statusCode: 404,
				});
			}

			const recoveryCode = Math.floor(100000 + Math.random() * 900000).toString();
			const expires = new Date(Date.now() + 15 * 60 * 1000);

			await this.usersRepo.updateUserField(user._id, "recovery", {
				code: recoveryCode,
				expires: expires,
			});

			await passRestorationMailer(user, recoveryCode);
			res.status(200).json({
				ok: true,
			});
		} catch (error) {
			next(error);
		}
	};

	restorePass = async (req, res, next) => {
		const { email, restorationCode, password } = req.body;
		try {
			if (!email || !restorationCode || !password) {
				CustomError.createError({
					message: "Faltan datos.",
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}
			const user = await this.usersRepo.getUser(email);
			if (user === null) {
				CustomError.createError({
					message: "Usuario no encontrado.",
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			if (
				!user.recovery ||
				!user.recovery.code ||
				user.recovery.code !== restorationCode
			) {
				CustomError.createError({
					message: "Código de verificación inválido.",
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}
			if (new Date() > user.recovery.expires) {
				CustomError.createError({
					message: "El código ha expirado. Solicita uno nuevo.",
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}

			const hashedPassword = createHash(password);
			await this.usersRepo.updateUserField(user._id, "password", hashedPassword);

			await this.usersRepo.updateUserField(user._id, "recovery", {
				code: null,
				expires: null,
			});

			res.status(200).json({
				ok: true,
			});
		} catch (error) {
			next(error);
		}
	};

	getUserTotalSteps = async (req, res, next) => {
		try {
			const user = await this.usersRepo.getUser(req.user);
			if (user === null) {
				CustomError.createError({
					message: `Usuario no encontrado`,
					code: TErrors.INVALID_TYPES,
					statusCode: 404,
				});
			}
			res.status(200).send({ totalSteps: user.totalSteps });
		} catch (error) {
			next(error);
		}
	};

	getUserStreak = async (req, res, next) => {
		try {
			const user = await this.usersRepo.getUser(req.user);
			if (!user) {
				CustomError.createError({
					message: `Usuario no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			const userStreak = await this.usersRepo.getUserStreak(req.user);
			res.status(200).json(userStreak.streak);
		} catch (error) {
			next(error);
		}
	};

	updateUserStreak = async (req, res, next) => {
		const { newStreak } = req.body;
		try {
			const user = await this.usersRepo.getUser(req.user);
			if (!user) {
				CustomError.createError({
					message: `Usuario no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			await this.usersRepo.updateUserField(
				req.user,
				"streak",
				parseInt(newStreak),
			);
			res.status(200).json({
				ok: true,
			});
		} catch (error) {
			next(error);
		}
	};

	markHasSeenOnboarding = async (req, res, next) => {
		try {
			const user = await this.usersRepo.getUser(req.user);
			if (!user) {
				CustomError.createError({
					message: `Usuario no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}

			await this.usersRepo.updateUserField(
				req.user,
				"hasSeenOnBoarding",
				!user.hasSeenOnBoarding,
			);
			res.status(200).json();
		} catch (error) {
			next(error);
		}
	};
}
