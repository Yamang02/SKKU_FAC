/**
 * 관리자용 작품 목록 페이지
 */
import ArtworkAPI from '../../../api/ArtworkAPI.js';
import Pagination from '../../../common/pagination.js';
import { ArtworkFilters, createFilterParams } from '../../../common/filters.js';

class ArtworkManagementList {
    constructor() {
        this.pagination = new Pagination({
            size: 20,
            sort: 'createdAt',
            order: 'desc'
        });
        this.filters = { ...ArtworkFilters.management };

        // URL 파라미터에서 초기값 설정
        const urlParams = new URLSearchParams(window.location.search);
        this.pagination.page = parseInt(urlParams.get('page')) || 1;
        this.filters.artistId = urlParams.get('artistId') || '';
        this.filters.keyword = urlParams.get('keyword') || '';

        this.initEventListeners();
    }

    initEventListeners() {
        // 필터 적용 버튼
        document.getElementById('btnApplyFilter')?.addEventListener('click', () => this.handleFilter());
    }

    async deleteArtwork(id) {
        if (confirm('정말로 이 작품을 삭제하시겠습니까?\n\n' +
            '⚠️ 경고: 이 작업은 되돌릴 수 없습니다.\n' +
            '• 해당 작품의 모든 정보가 영구적으로 삭제됩니다.\n' +
            '• 작품과 관련된 모든 데이터(이미지, 설명, 댓글 등)가 함께 삭제됩니다.\n' +
            '• 이 작업은 되돌릴 수 없으므로 신중하게 결정해주세요.')) {
            try {
                const response = await fetch(`/admin/management/artwork/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();

                if (result.success) {
                    alert(result.message);
                    window.location.href = '/admin/management/artwork';
                } else {
                    alert(result.message || '작품 삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('작품 삭제 중 오류가 발생했습니다.');
            }
        }
    }

    goToPage(page) {
        this.pagination.page = page;
        const pageParams = this.pagination.toQueryParams();
        const filterParams = createFilterParams(this.filters);
        const queryString = [pageParams, filterParams]
            .filter(Boolean)
            .join('&');

        window.location.href = `${window.location.pathname}?${queryString}`;
    }

    handleFilter() {
        this.filters.artistId = document.querySelector('select[name="artistId"]').value;
        this.filters.keyword = document.querySelector('input[name="keyword"]').value;
        this.pagination.page = 1; // 필터 변경시 첫 페이지로

        const pageParams = this.pagination.toQueryParams();
        const filterParams = createFilterParams(this.filters);
        const queryString = [pageParams, filterParams]
            .filter(Boolean)
            .join('&');

        window.location.href = `${window.location.pathname}?${queryString}`;
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.artworkManagement = new ArtworkManagementList();
});
