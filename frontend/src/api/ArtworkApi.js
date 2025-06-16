/**
 * 작품 관련 API - React Native Web 버전
 */
import api from '../utils/api';
import { showErrorMessage, showSuccessMessage } from '../utils/notification';

export default class ArtworkApi {
    // 관리자용 - 작품 목록 조회
    static async getArtworkList(pagination, filters = {}) {
        try {
            const params = new URLSearchParams();

            // 페이지네이션 파라미터
            if (pagination) {
                params.set('page', pagination.page || 1);
                params.set('limit', pagination.limit || 10);
            }

            // 필터 파라미터
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.set(key, value);
                }
            });

            const queryString = params.toString();
            return await api.get(`/admin/management/artwork/list?${queryString}`);
        } catch (error) {
            console.error('관리자용 작품 목록 조회 중 오류 발생:', error);
            showErrorMessage('작품 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 관리자용 - 작품 상세 조회
    static async getArtworkDetail(artworkId) {
        try {
            return await api.get(`/admin/management/artwork/${artworkId}`);
        } catch (error) {
            console.error(`작품 상세 정보(ID: ${artworkId}) 조회 중 오류 발생:`, error);
            showErrorMessage('작품 정보를 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 관리자용 - 작품 등록
    static async registerArtwork(artworkData) {
        try {
            const response = await api.post('/admin/management/artwork/register', artworkData);
            showSuccessMessage('작품이 성공적으로 등록되었습니다.');
            return response;
        } catch (error) {
            console.error('작품 등록 중 오류 발생:', error);

            // 유효성 검사 오류인 경우 상세 메시지 표시
            if (error.isApiError && error.apiResponse && error.apiResponse.validationErrors) {
                const validationErrors = error.apiResponse.validationErrors;
                const errorMessages = Object.values(validationErrors).flat();
                showErrorMessage(`입력 오류:\n${errorMessages.join('\n')}`);
            } else {
                showErrorMessage('작품 등록에 실패했습니다.');
            }
            throw error;
        }
    }

    // 관리자용 - 작품 수정
    static async updateArtwork(artworkId, artworkData) {
        try {
            const response = await api.put(`/admin/management/artwork/${artworkId}`, artworkData);
            showSuccessMessage('작품 정보가 성공적으로 수정되었습니다.');
            return response;
        } catch (error) {
            console.error(`작품 수정 중 오류 발생 (ID: ${artworkId}):`, error);

            // 유효성 검사 오류인 경우 상세 메시지 표시
            if (error.isApiError && error.apiResponse && error.apiResponse.validationErrors) {
                const validationErrors = error.apiResponse.validationErrors;
                const errorMessages = Object.values(validationErrors).flat();
                showErrorMessage(`입력 오류:\n${errorMessages.join('\n')}`);
            } else {
                showErrorMessage('작품 수정에 실패했습니다.');
            }
            throw error;
        }
    }

    // 관리자용 - 작품 삭제
    static async deleteArtwork(artworkId) {
        try {
            const response = await api.delete(`/admin/management/artwork/${artworkId}`);
            showSuccessMessage('작품이 성공적으로 삭제되었습니다.');
            return response;
        } catch (error) {
            console.error(`작품 삭제 중 오류 발생 (ID: ${artworkId}):`, error);
            showErrorMessage('작품 삭제에 실패했습니다.');
            throw error;
        }
    }

    // 관리자용 - 작품 상태 변경
    static async updateArtworkStatus(artworkId, status) {
        try {
            const response = await api.put(`/admin/management/artwork/${artworkId}/status`, { status });
            showSuccessMessage(`작품 상태가 ${status}로 변경되었습니다.`);
            return response;
        } catch (error) {
            console.error(`작품 상태 변경 중 오류 발생 (ID: ${artworkId}):`, error);
            showErrorMessage('작품 상태 변경에 실패했습니다.');
            throw error;
        }
    }

    // 공용 - 작품 목록 조회 (일반 사용자용)
    static async getPublicArtworkList(pagination, filters = {}) {
        try {
            const params = new URLSearchParams();

            // 페이지네이션 파라미터
            if (pagination) {
                params.set('page', pagination.page || 1);
                params.set('limit', pagination.limit || 10);
            }

            // 필터 파라미터
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.set(key, value);
                }
            });

            const queryString = params.toString();
            return await api.get(`/api/artwork/list?${queryString}`);
        } catch (error) {
            console.error('공용 작품 목록 조회 중 오류 발생:', error);
            showErrorMessage('작품 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 공용 - 작품 상세 조회 (일반 사용자용)
    static async getPublicArtworkDetail(artworkId) {
        try {
            return await api.get(`/api/artwork/${artworkId}`);
        } catch (error) {
            console.error(`공용 작품 상세 정보(ID: ${artworkId}) 조회 중 오류 발생:`, error);
            showErrorMessage('작품 정보를 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 파일 업로드용 헬퍼 메서드
    static createFormDataForArtwork(artworkData, imageFile = null) {
        const formData = new FormData();

        // 텍스트 데이터 추가
        Object.entries(artworkData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        // 이미지 파일 추가
        if (imageFile) {
            formData.append('image', imageFile);
        }

        return formData;
    }

    // FormData를 사용한 작품 등록 (이미지 포함)
    static async registerArtworkWithImage(artworkData, imageFile) {
        try {
            const formData = this.createFormDataForArtwork(artworkData, imageFile);
            const response = await api.post('/admin/management/artwork/register', formData);
            showSuccessMessage('작품이 성공적으로 등록되었습니다.');
            return response;
        } catch (error) {
            console.error('이미지 포함 작품 등록 중 오류 발생:', error);
            showErrorMessage('작품 등록에 실패했습니다.');
            throw error;
        }
    }

    // FormData를 사용한 작품 수정 (이미지 포함)
    static async updateArtworkWithImage(artworkId, artworkData, imageFile = null) {
        try {
            const formData = this.createFormDataForArtwork(artworkData, imageFile);
            const response = await api.put(`/admin/management/artwork/${artworkId}`, formData);
            showSuccessMessage('작품이 성공적으로 수정되었습니다.');
            return response;
        } catch (error) {
            console.error(`이미지 포함 작품 수정 중 오류 발생 (ID: ${artworkId}):`, error);
            showErrorMessage('작품 수정에 실패했습니다.');
            throw error;
        }
    }
}
