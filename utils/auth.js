import bcrypt from "bcrypt";

const BCRYPT_SALT_ROUNDS = 10; // its good to seperate your constants from the functions

export async function hashPassword(password) {
	return await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
}

export async function comparePassword(password, hash) {
	return await bycrypt.comapare(password, hash);
}
