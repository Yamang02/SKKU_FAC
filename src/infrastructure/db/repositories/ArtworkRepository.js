import Database from '../Database.js';
import { Artwork } from '../../../models/artwork/Artwork.js';
import { ArtworkError } from '../../../errors/ArtworkError.js';

class ArtworkRepository {
    constructor() {
        this.db = new Database();
    }

    async findById(id) {
        try {
            const [result] = await this.db.query(
                'SELECT * FROM artworks WHERE id = ?',
                [id]
            );
            return result ? new Artwork(result) : null;
        } catch (error) {
            throw new ArtworkError('작품 조회 중 오류가 발생했습니다.', error);
        }
    }

    async save(artwork) {
        try {
            const result = await this.db.query(
                'INSERT INTO artworks (title, description, image_id, exhibition_id, user_id) VALUES (?, ?, ?, ?, ?)',
                [artwork.title, artwork.description, artwork.imageId, artwork.exhibitionId, artwork.userId]
            );
            return new Artwork({ ...artwork, id: result.insertId });
        } catch (error) {
            throw new ArtworkError('작품 저장 중 오류가 발생했습니다.', error);
        }
    }

    async update(artwork) {
        try {
            await this.db.query(
                'UPDATE artworks SET title = ?, description = ?, image_id = ? WHERE id = ?',
                [artwork.title, artwork.description, artwork.imageId, artwork.id]
            );
            return artwork;
        } catch (error) {
            throw new ArtworkError('작품 수정 중 오류가 발생했습니다.', error);
        }
    }

    async delete(id) {
        try {
            await this.db.query('DELETE FROM artworks WHERE id = ?', [id]);
        } catch (error) {
            throw new ArtworkError('작품 삭제 중 오류가 발생했습니다.', error);
        }
    }

    async findByExhibitionId(exhibitionId) {
        try {
            const results = await this.db.query(
                'SELECT * FROM artworks WHERE exhibition_id = ?',
                [exhibitionId]
            );
            return results.map(result => new Artwork(result));
        } catch (error) {
            throw new ArtworkError('전시회별 작품 조회 중 오류가 발생했습니다.', error);
        }
    }
}

export default ArtworkRepository;
