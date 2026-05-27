import sharp from "sharp";
import fs from "fs";

export const resizeAvatar = async (req, res, next) => {
	// Si no se subió ningún archivo, pasamos al siguiente controlador
	if (!req.file) return next();

	const dirProfile = "public/data/avatar";
	if (!fs.existsSync(dirProfile)) {
		fs.mkdirSync(dirProfile, { recursive: true });
	}

	const uniqueSuffix = Date.now();
	const userId = req.user || "anonymous";
	// Forzamos a que todos los avatares guardados sean .jpg para estandarizar
	const fileName = `${userId}_${uniqueSuffix}.jpg`;
	const outputPath = `${dirProfile}/${fileName}`;

	try {
		await sharp(req.file.buffer)
			.resize(400, 400, {
				fit: "cover", // Recorta la imagen para que sea un cuadrado perfecto sin deformarse
				position: "center", // Se enfoca en el centro de la foto
			})
			.jpeg({ quality: 80 }) // Convierte a JPEG y aplica una compresión del 80% (es imperceptible pero reduce drásticamente el peso)
			.toFile(outputPath);

		// Guardamos el nuevo nombre del archivo en req.file para que tu controlador final sepa cómo se llama
		req.file.filename = fileName;
		req.file.path = outputPath;

		next();
	} catch (error) {
		return res.status(500).json({
			status: "error",
			message: "Error al procesar la imagen de perfil.",
		});
	}
};
