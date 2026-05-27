import multer from "multer";
import path from "path";

const fileExtFilter = function (req, file, cb) {
	const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
	const allowedExtensions = [".jpg", ".jpeg", ".png"];

	if (file.fieldname === "avatar") {
		const fileExt = path.extname(file.originalname).toLowerCase();
		const mimeType = file.mimetype.toLowerCase();

		if (
			!allowedMimeTypes.includes(mimeType) ||
			!allowedExtensions.includes(fileExt)
		) {
			return cb(
				new Error("Formato inválido. Solo se permiten .jpg, .jpeg o .png"),
				false,
			);
		}
	}
	cb(null, true);
};

// Configuramos Multer para guardar temporalmente en MEMORIA
export const uploads = multer({
	storage: multer.memoryStorage(),
	fileFilter: fileExtFilter,
	limits: {
		fileSize: 2 * 1024 * 1024, // Límite estricto de 2 MB
		files: 1,
	},
});
