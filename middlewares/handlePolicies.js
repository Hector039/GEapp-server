export const handlePolicies = (policies) => (req, res, next) => {
	if (policies[0] === "PUBLIC") return next();

	if (policies[0] === "ADMIN" && req.user !== process.env.GEPASS) {
		return res
			.status(401)
			.send({ status: "Error", error: "Unautorized by administrator policies" });
	}

	if (policies[0] === "USER" && req.user === null)
		return res
			.status(401)
			.send({ status: "Error", error: "Unautorized by user policies" });

	next();
};
