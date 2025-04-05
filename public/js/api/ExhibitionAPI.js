/**
 * 전시회 API
 * 전시회 관련 API 호출을 처리합니다.
 */

export default class ExhibitionAPI {
    /**
     * 전시회 목록을 조회합니다.
     */
    static async getExhibitionList(params = {}) {
        try {
            const queryParams = new URLSearchParams(params).toString();
            const response = await fetch(`/exhibition/api/list${queryParams ? `?${queryParams}` : ''}`);
            if (!response.ok) throw new Error('전시회 목록을 불러오는데 실패했습니다.');
            return await response.json();
        } catch (error) {
            console.error('Error fetching exhibition list:', error);
            throw error;
        }
    }

    /**
     * 출품 가능한 전시회 목록을 조회합니다.
     */
    static async getSubmittableList() {
        try {
            const response = await fetch('/exhibition/api/submittable', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                credentials: 'same-origin'
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.error('서버 응답:', errorText);
                throw new Error('출품 가능한 전시회 목록을 불러오는데 실패했습니다.');
            }

            return await response.json();
        } catch (error) {
            console.error('출품 가능한 전시회 목록을 가져오는 중 오류 발생:', error);
            throw error;
        }
    }

    /**
     * 전시회 상세 정보를 조회합니다.
     */
    static async getDetail(exhibitionId) {
        try {
            const response = await fetch(`/exhibition/api/${exhibitionId}`);
            if (!response.ok) throw new Error('전시회 정보를 불러오는데 실패했습니다.');
            return await response.json();
        } catch (error) {
            console.error(`전시회 상세 정보(ID: ${exhibitionId})를 가져오는 중 오류 발생:`, error);
            throw error;
        }
    }

    /**
     * 전시회 작품 목록을 조회합니다.
     */
    static async getArtworks(exhibitionId) {
        try {
            const response = await fetch(`/exhibition/api/${exhibitionId}/artworks`);
            if (!response.ok) throw new Error('전시회 작품 목록을 불러오는데 실패했습니다.');
            return await response.json();
        } catch (error) {
            console.error(`전시회 작품 목록(ID: ${exhibitionId})을 가져오는 중 오류 발생:`, error);
            throw error;
        }
    }
}
