import ArtworkRepository from '../repositories/ArtworkRepository.js';
import { ArtworkError } from '../../../errors/ArtworkError.js';

class ArtworkService {
    constructor() {
        this.artworkRepository = new ArtworkRepository();
    }

    async getArtwork(id) {
        try {
            return await this.artworkRepository.findById(id);
        } catch (error) {
            throw new ArtworkError('작품 조회 중 오류가 발생했습니다.', error);
        }
    }

    async createArtwork(artworkData) {
        try {
            return await this.artworkRepository.save(artworkData);
        } catch (error) {
            throw new ArtworkError('작품 생성 중 오류가 발생했습니다.', error);
        }
    }

    async updateArtwork(artworkData) {
        try {
            return await this.artworkRepository.update(artworkData);
        } catch (error) {
            throw new ArtworkError('작품 수정 중 오류가 발생했습니다.', error);
        }
    }

    async deleteArtwork(id) {
        try {
            await this.artworkRepository.delete(id);
        } catch (error) {
            throw new ArtworkError('작품 삭제 중 오류가 발생했습니다.', error);
        }
    }

    async getArtworksByExhibition(exhibitionId) {
        try {
            return await this.artworkRepository.findByExhibitionId(exhibitionId);
        } catch (error) {
            throw new ArtworkError('전시회별 작품 조회 중 오류가 발생했습니다.', error);
        }
    }
}

export default ArtworkService;
