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
		const user = req.user;
		if (user) {
			await welcomeMailer(user);
		}
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
					token,
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
		const { uid, oldPassword, newPassword } = req.body;
		try {
			const user = await this.usersRepo.getUser(uid);
			if (!user) {
				CustomError.createError({
					message: `Usuario con ID ${uid} no encontrado.`,
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
				uid,
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
		const { uid, newEmail } = req.body;
		try {
			const user = await this.usersRepo.getUser(uid);
			if (!user) {
				CustomError.createError({
					message: `Usuario ID ${uid} no encontrado`,
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
			await this.usersRepo.updateUserField(uid, "email", newEmail);
			res.status(200).json({
				ok: true,
			});
		} catch (error) {
			next(error);
		}
	};

	updateUserAvatar = async (req, res, next) => {
		const { uid } = req.params;
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
			await this.usersRepo.updateUserField(uid, "avatar", avatarPath);
			res.status(200).send(avatarPath);
		} catch (error) {
			next(error);
		}
	};

	updateUserStatus = async (req, res, next) => {
		const { uid } = req.params;
		try {
			const user = await this.usersRepo.getUser(uid);
			if (!user) {
				CustomError.createError({
					message: `Usuario ID ${uid} no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			if (user.status) {
				await deactivateUserMailer(user);
			} else {
				await welcomeMailer(user);
			}
			await this.usersRepo.updateUserField(uid, "status", !user.status);
			res.status(200).json({
				ok: true,
			});
		} catch (error) {
			next(error);
		}
	};

	updateUserTotalSteps = async (req, res, next) => {
		const { uid, steps } = req.body;
		try {
			if (!uid || !steps) {
				CustomError.createError({
					message: `Faltan datos o están erróneos.`,
					code: TErrors.INVALID_TYPES,
					statusCode: 400,
				});
			}
			const user = await this.usersRepo.getUser(uid);
			if (!user) {
				CustomError.createError({
					message: `Usuario ID ${uid} no encontrado`,
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			await this.usersRepo.updateUserField(uid, "totalSteps", parseInt(steps));
			res.status(200).send({ newTotalSteps: user.totalSteps + parseInt(steps) });
		} catch (error) {
			next(error);
		}
	};

	passRestoration = async (req, res, next) => {
		const { email, password } = req.params;
		try {
			const user = await this.usersRepo.getUser(email);
			if (user === null) {
				CustomError.createError({
					message: `Usuario con email ${email} no encontrado`,
					code: TErrors.INVALID_TYPES,
					statusCode: 404,
				});
			}
			await passRestorationMailer(user, createHash(password));
			res.status(200).json({
				ok: true,
			});
		} catch (error) {
			next(error);
		}
	};

	userForgotPass = async (req, res, next) => {
		const { uid, password } = req.params;
		try {
			const user = await this.usersRepo.getUser(uid);
			if (user === null) {
				CustomError.createError({
					message: "Usuario no encontrado.",
					code: TErrors.NOT_FOUND,
					statusCode: 404,
				});
			}
			await this.usersRepo.updateUserField(user._id, "password", password);
			res.status(200).send("Se cambió la contraseña correctamente.");
		} catch (error) {
			next(error);
		}
	};

	getUserTotalSteps = async (req, res, next) => {
		const { uid } = req.params;
		try {
			const user = await this.usersRepo.getUser(uid);
			if (user === null) {
				CustomError.createError({
					message: `Usuario con ID ${uid} no encontrado`,
					code: TErrors.INVALID_TYPES,
					statusCode: 404,
				});
			}
			res.status(200).send({ totalSteps: user.totalSteps });
		} catch (error) {
			next(error);
		}
	};
}
