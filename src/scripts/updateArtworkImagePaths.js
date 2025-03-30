import fs from 'fs';
import path from 'path';
import { FilePath } from '../constants/Path.js';
import artwork from '../config/data/artwork.js';

/**
 * 메인 함수
 */
async function main() {
    try {
        // 업로드 디렉토리의 파일 목록 가져오기
        const files = await fs.promises.readdir(FilePath.UPLOAD.ARTWORKS);

        // 각 작품의 이미지 경로 업데이트
        const updatedArtwork = artwork.map(item => {
            if (!item.image) return item;

            // 작품 ID로 파일 찾기
            const matchingFile = files.find(file => file.includes(`_${item.id}_`));
            if (matchingFile) {
                return {
                    ...item,
                    image: `/uploads/artworks/${matchingFile}`
                };
            }
            return item;
        });

        // 업데이트된 데이터를 파일에 저장
        const fileContent = `/**
 * 작품 데이터
 */
const artwork = ${JSON.stringify(updatedArtwork, null, 4)};

export default artwork;
`;

        await fs.promises.writeFile(
            path.join('src', 'config', 'data', 'artwork.js'),
            fileContent,
            'utf8'
        );

        console.log('이미지 경로 업데이트 완료!');
    } catch (error) {
        console.error('스크립트 실행 중 오류 발생:', error);
    }
}

// 스크립트 실행
main();
