import multer from "multer";

const storageUploads = multer.diskStorage({
	destination: function (req, file, cb) {
		const dirProfile = `public/data`;
		if (file.fieldname === "avatar") return cb(null, dirProfile);
	},
	filename: function (req, file, cb) {
		const date = new Date().getTime();
		const fileName = file.originalname.slice(-5);
		cb(null, req.user.id + "_" + date + "_" + fileName);
	},
});

const fileExtFilter = function (req, file, cb) {
	try {
		const ext = file.mimetype.slice(-4);
		if (file && file.fieldname === "avatar" && ext !== "/jpg" && ext !== "jpeg") {
			cb(new Error("Imagen no reconocida. Solo jpg, jpeg son permitidos"), null);
			return;
		}
		cb(null, true);
	} catch (error) {
		cb(error, null);
	}
};

export const uploads = multer({
	fileFilter: fileExtFilter,
	storage: storageUploads,
});
