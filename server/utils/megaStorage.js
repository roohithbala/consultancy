import { Storage } from 'megajs';
import fs from 'fs';
import path from 'path';

/**
 * Uploads a file to MEGA and returns a public sharing link.
 * @param {string} filePath - Absolute path to the local file.
 * @param {string} folderName - Folder name in MEGA (optional).
 * @returns {Promise<string>} - Public sharing link.
 */
export const uploadToMega = async (filePath, folderName = 'Invoices') => {
    return new Promise(async (resolve, reject) => {
        try {
            const email = process.env.MEGA_EMAIL;
            const password = process.env.MEGA_PASSWORD;

            if (!email || !password) {
                return reject(new Error('MEGA credentials missing in environment variables'));
            }

            const storage = await new Storage({
                email,
                password,
            }).ready;

            // Find or create folder
            let folder = storage.root.children.find(n => n.name === folderName && n.directory);
            if (!folder) {
                folder = await storage.mkdir(folderName);
            }

            const fileName = path.basename(filePath);
            const fileBuffer = fs.readFileSync(filePath);

            const file = await folder.upload(fileName, fileBuffer).complete;
            const link = await file.link();

            resolve(link);
        } catch (error) {
            console.error('MEGA Upload Error:', error);
            reject(error);
        }
    });
};
