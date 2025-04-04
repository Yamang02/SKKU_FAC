import { ArtworkValidationError } from '../../../errors/ArtworkValidationError.js';

export class ArtworkValidator {
    static validateCreate(artworkData) {
        if (!artworkData) {
            throw new ArtworkValidationError('작품 데이터가 없습니다.');
        }

        if (!artworkData.title) {
            throw new ArtworkValidationError('작품 제목은 필수입니다.');
        }

        if (!artworkData.artistId) {
            throw new ArtworkValidationError('작가 ID는 필수입니다.');
        }

        if (!artworkData.department) {
            throw new ArtworkValidationError('학과는 필수입니다.');
        }

        return true;
    }
}
