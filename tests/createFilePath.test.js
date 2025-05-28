const fs = require('fs').promises;
const { createFilePath } = require('..pages/api/execute.js');

describe('createFilePath - Real Filesystem', () => {
    it('should create a real temp folder and return valid paths', async () => {
        const { folder, file } = await createFilePath('javascript');

        // Verify the folder exists
        await expect(fs.access(folder)).resolves.not.toThrow();

        // Verify the file path structure
        expect(file).toBe(`${folder}/code.js`);

        // Cleanup (optional)
        await fs.rm(folder, { recursive: true });
    });
});  