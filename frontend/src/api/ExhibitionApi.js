/**
 * 전시 관련 API - React Native Web 버전
 */
import api from '../utils/api';
import { showErrorMessage, showSuccessMessage } from '../utils/notification';

export default class ExhibitionApi {
    // 관리자용 - 전시 목록 조회
    static async getExhibitionList(pagination, filters = {}) {
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
            return await api.get(`/admin/management/exhibition/list?${queryString}`);
        } catch (error) {
            console.error('관리자용 전시 목록 조회 중 오류 발생:', error);
            showErrorMessage('전시 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 관리자용 - 전시 상세 조회
    static async getExhibitionDetail(exhibitionId) {
        try {
            return await api.get(`/admin/management/exhibition/${exhibitionId}`);
        } catch (error) {
            console.error(`전시 상세 정보(ID: ${exhibitionId}) 조회 중 오류 발생:`, error);
            showErrorMessage('전시 정보를 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 관리자용 - 전시 등록
    static async registerExhibition(exhibitionData) {
        try {
            const response = await api.post('/admin/management/exhibition/register', exhibitionData);
            showSuccessMessage('전시가 성공적으로 등록되었습니다.');
            return response;
        } catch (error) {
            console.error('전시 등록 중 오류 발생:', error);

            // 유효성 검사 오류인 경우 상세 메시지 표시
            if (error.isApiError && error.apiResponse && error.apiResponse.validationErrors) {
                const validationErrors = error.apiResponse.validationErrors;
                const errorMessages = Object.values(validationErrors).flat();
                showErrorMessage(`입력 오류:\n${errorMessages.join('\n')}`);
            } else {
                showErrorMessage('전시 등록에 실패했습니다.');
            }
            throw error;
        }
    }

    // 관리자용 - 전시 수정
    static async updateExhibition(exhibitionId, exhibitionData) {
        try {
            const response = await api.put(`/admin/management/exhibition/${exhibitionId}`, exhibitionData);
            showSuccessMessage('전시 정보가 성공적으로 수정되었습니다.');
            return response;
        } catch (error) {
            console.error(`전시 수정 중 오류 발생 (ID: ${exhibitionId}):`, error);

            // 유효성 검사 오류인 경우 상세 메시지 표시
            if (error.isApiError && error.apiResponse && error.apiResponse.validationErrors) {
                const validationErrors = error.apiResponse.validationErrors;
                const errorMessages = Object.values(validationErrors).flat();
                showErrorMessage(`입력 오류:\n${errorMessages.join('\n')}`);
            } else {
                showErrorMessage('전시 수정에 실패했습니다.');
            }
            throw error;
        }
    }

    // 관리자용 - 전시 삭제
    static async deleteExhibition(exhibitionId) {
        try {
            const response = await api.delete(`/admin/management/exhibition/${exhibitionId}`);
            showSuccessMessage('전시가 성공적으로 삭제되었습니다.');
            return response;
        } catch (error) {
            console.error(`전시 삭제 중 오류 발생 (ID: ${exhibitionId}):`, error);
            showErrorMessage('전시 삭제에 실패했습니다.');
            throw error;
        }
    }

    // 관리자용 - 전시 상태 변경
    static async updateExhibitionStatus(exhibitionId, status) {
        try {
            const response = await api.put(`/admin/management/exhibition/${exhibitionId}/status`, { status });
            showSuccessMessage(`전시 상태가 ${status}로 변경되었습니다.`);
            return response;
        } catch (error) {
            console.error(`전시 상태 변경 중 오류 발생 (ID: ${exhibitionId}):`, error);
            showErrorMessage('전시 상태 변경에 실패했습니다.');
            throw error;
        }
    }

    // 공용 - 전시 목록 조회 (일반 사용자용)
    static async getPublicExhibitionList(pagination, filters = {}) {
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
            return await api.get(`/api/exhibition/list?${queryString}`);
        } catch (error) {
            console.error('공용 전시 목록 조회 중 오류 발생:', error);
            showErrorMessage('전시 목록을 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 공용 - 전시 상세 조회 (일반 사용자용)
    static async getPublicExhibitionDetail(exhibitionId) {
        try {
            return await api.get(`/api/exhibition/${exhibitionId}`);
        } catch (error) {
            console.error(`공용 전시 상세 정보(ID: ${exhibitionId}) 조회 중 오류 발생:`, error);
            showErrorMessage('전시 정보를 불러오는데 실패했습니다.');
            throw error;
        }
    }

    // 관리자용 - 전시에 작품 추가
    static async addArtworkToExhibition(exhibitionId, artworkId) {
        try {
            const response = await api.post(`/admin/management/exhibition/${exhibitionId}/artwork`, {
                artworkId: artworkId
            });
            showSuccessMessage('작품이 전시에 성공적으로 추가되었습니다.');
            return response;
        } catch (error) {
            console.error(`전시에 작품 추가 중 오류 발생 (전시ID: ${exhibitionId}, 작품ID: ${artworkId}):`, error);
            showErrorMessage('작품을 전시에 추가하는데 실패했습니다.');
            throw error;
        }
    }

    // 관리자용 - 전시에서 작품 제거
    static async removeArtworkFromExhibition(exhibitionId, artworkId) {
        try {
            const response = await api.delete(`/admin/management/exhibition/${exhibitionId}/artwork/${artworkId}`);
            showSuccessMessage('작품이 전시에서 성공적으로 제거되었습니다.');
            return response;
        } catch (error) {
            console.error(`전시에서 작품 제거 중 오류 발생 (전시ID: ${exhibitionId}, 작품ID: ${artworkId}):`, error);
            showErrorMessage('작품을 전시에서 제거하는데 실패했습니다.');
            throw error;
        }
    }

    // 파일 업로드용 헬퍼 메서드
    static createFormDataForExhibition(exhibitionData, posterFile = null) {
        const formData = new FormData();

        // 텍스트 데이터 추가
        Object.entries(exhibitionData).forEach(([key, value]) => {
            if (value !== null && value !== undefined) {
                formData.append(key, value);
            }
        });

        // 포스터 이미지 파일 추가
        if (posterFile) {
            formData.append('poster', posterFile);
        }

        return formData;
    }

    // FormData를 사용한 전시 등록 (포스터 이미지 포함)
    static async registerExhibitionWithPoster(exhibitionData, posterFile) {
        try {
            const formData = this.createFormDataForExhibition(exhibitionData, posterFile);
            const response = await api.post('/admin/management/exhibition/register', formData);
            showSuccessMessage('전시가 성공적으로 등록되었습니다.');
            return response;
        } catch (error) {
            console.error('포스터 포함 전시 등록 중 오류 발생:', error);
            showErrorMessage('전시 등록에 실패했습니다.');
            throw error;
        }
    }

    // FormData를 사용한 전시 수정 (포스터 이미지 포함)
    static async updateExhibitionWithPoster(exhibitionId, exhibitionData, posterFile = null) {
        try {
            const formData = this.createFormDataForExhibition(exhibitionData, posterFile);
            const response = await api.put(`/admin/management/exhibition/${exhibitionId}`, formData);
            showSuccessMessage('전시가 성공적으로 수정되었습니다.');
            return response;
        } catch (error) {
            console.error(`포스터 포함 전시 수정 중 오류 발생 (ID: ${exhibitionId}):`, error);
            showErrorMessage('전시 수정에 실패했습니다.');
            throw error;
        }
    }
}
