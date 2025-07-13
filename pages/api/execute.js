//ONLY SUPPORTS PYTHON RIGHT NOW

import { writeFile, mkdtemp, rm } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { exec as execNP } from "node:child_process";
import { promisify } from "node:util";

const exec = promisify(execNP); // need to make exec a return a promise to ensure program waits for the python file to complete running/
// exec by default does not return a promise, so we need to promisify it
// by default exec uses a callback
/**
 * Used to get code file endings and commands to run
 * @param language
 * @returns {{compile: string, suffix: string}|undefined}
 */
function languageRunSyntax(language) {
	switch (language) {
		case "java":
			return { suffix: ".java", compile: "javac" };
		case "python":
			return { suffix: ".py", compile: "python3", image: "python:3.11" };
		case "javascript":
			return { suffix: ".js", compile: "node" };
		default:
			return undefined;
	}
}
/**
 * Creates the temporary file that we will write the code to
 * @param {String} language
 * @returns {{directory: String, file: String}} // path to folder and path to file
 */
async function createFilePath(language) {
	const directory = await mkdtemp(join(tmpdir(), "temp-"));
	return {
		folder: directory,
		file: join(directory, `code${languageRunSyntax(language).suffix}`),
	};
}

/**
 * Writes code to the given file path
 * @param {String} filePath
 * @param {String} code
 */
async function writeToFile(filePath, code) {
	try {
		await writeFile(filePath, code);
		console.log("File written successfully:", filePath);
	} catch (err) {
		console.error("Error writing to file:", err);
	}
}

/**
 * Deletes the Temporary directory and file we wrote the code to
 * @param {String} directory
 */
async function deleteDirectory(directory) {
	try {
		await rm(directory, { recursive: true, force: true });
		console.log("Directory deleted successfully:", directory);
	} catch (err) {
		console.error("Error deleting directory:", err);
	}
}

/**
 * Executes the code in the file given by pathMap
 * @param {{folder: String, file: String}} pathMap
 * @returns {{stdout: String, stderr: String, error: String}}
 */

async function execute(pathMap) {
	const TIMEOUT = 5000;
	//HARDCODED TO PYTHON FOR NOW
	const dockerCommand = `docker run --rm --cpus=0.25 --memory=32m --read-only --network=none -v "${pathMap.folder}:/app" python:3.11-alpine python3 /app/code.py`;

	let output = {
		stdout: "",
		stderr: "",
		error: "",
	};

	try {
		const { stdout, stderr } = await exec(dockerCommand, { timeout: TIMEOUT });
		output.stdout = stdout;
		output.stderr = stderr;
	} catch (err) {
		if (err.killed) {
			output.stderr = "Execution timed out";
		} else {
			output.stderr = err.stderr;
		}
	}
	return output;
}

/**
 * Runs all necessary functions to run code given a language and code
 * @param {String} language
 * @param {String} code
 * @returns {{stdout: String, stderr: String, error: String}}
 */
async function codeRunner(language, code) {
	try {
		const pathMap = await createFilePath(language);
		await writeToFile(pathMap.file, code);
		const result = await execute(pathMap);
		await deleteDirectory(pathMap.folder);
		return result;
	} catch (err) {
		return { stdout: "", stderr: "", error: err.message };
	}
}

// handler function for the API route. pages/api/execute
export default async function handler(req, res) {
	if (req.method !== "POST") {
		res.status(405).send("Method Not Allowed");
		return;
	}
	const { language, code } = req.body;
	let result = await codeRunner(language, code);
	res.status(200).json(result);
	return;
}
