import CustomError from "../tools/customErrors/customError.js";
import TErrors from "../tools/customErrors/enum.js";
import fs from "fs";

export default class TicController {
	getTic = async (req, res, next) => {
		try {
			fs.readFile("public/data/tic.md", (err, data) => {
				if (err) {
					CustomError.createError({
						message: err,
						code: TErrors.NOT_FOUND,
						statusCode: 404,
					});
				}
				const textoMarkdown = data.toString();
				res.status(200).send(textoMarkdown);
			});
		} catch (error) {
			next(error);
		}
	};
}
