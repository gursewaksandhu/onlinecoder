
import { mkdtemp } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
/**
 * Used to get code file endings and commands to run
 * @param language
 * @returns {{compile: string, suffix: string}|undefined}
 */
function languageRunSyntax(language){
    switch(language) {
        case "java":
            return {suffix: ".java", compile: "javac"}
        case "python":
            return {suffix: ".py", compile: "python3"}
        case "javascript":
            return {suffix: ".js", compile: "node"}
        default:
            return undefined
    }
}

async function createFilePath(language){
    const directory = await mkdtemp(join(tmpdir(), "temp-"));
    return {
        folder: directory,
        file: join(directory, `code${languageRunSyntax(language).suffix}`)
    }
}


function execute(language, code){}

function deleteFilePath(filePath){}

function codeRunner(language, code){}


module.exports = {
    languageRunSyntax,
    createFilePath
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.status(405).send('Method Not Allowed');
    }
    let result = codeRunner(req.language, req.code);
    res.status(200).json(result);
}