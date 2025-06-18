import fs from 'fs';

const uploadDirs = ['public/uploads', 'public/uploads/artworks', 'public/uploads/exhibitions'];

export function createUploadDirs() {
    uploadDirs.forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
}
