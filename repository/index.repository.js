import models from "../models/index.model.js";

export let usersRepository, orgsRepository, sessionsRepository;

const { default: usersDB } = await import("./users.repository.js");
usersRepository = new usersDB(models.users);

const { default: orgsDB } = await import("./orgs.repository.js");
orgsRepository = new orgsDB(models.orgs);

const { default: sessionsDB } = await import("./sessions.repository.js");
sessionsRepository = new sessionsDB(models.sessions);
