export const handlePolicies = (policies) => (req, res, next) => {
	if (policies[0] === "PUBLIC") return next();
	if (req.user === null)
		return res
			.status(401)
			.send({ status: "Error", error: "Unautorized by policies" });
	next();
};
