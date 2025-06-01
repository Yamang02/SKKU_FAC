import Pagination from '../../../common/pagination.js';
import { ArtworkFilters, createFilterParams } from '../../../common/filters.js';
import { showErrorMessage, showSuccessMessage, showConfirm } from '../../../../js/common/util/notification.js';

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
        this.pagination.sort = urlParams.get('sort') || 'createdAt';
        this.pagination.order = urlParams.get('order') || 'desc';
        this.filters.keyword = urlParams.get('keyword') || '';

        this.initEventListeners();
    }

    initEventListeners() {
        // 필터 적용 버튼
        document.getElementById('btnApplyFilter')?.addEventListener('click', () => this.handleFilter());

        // 정렬 버튼들에 이벤트 리스너 추가
        document.querySelectorAll('.sort-btn')?.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const field = e.currentTarget.getAttribute('data-sort');
                this.handleSort(field);
            });
        });
    }

    async deleteArtwork(id) {
        const confirmed = await showConfirm('정말로 이 작품을 삭제하시겠습니까?\n\n' +
            '⚠️ 경고: 이 작업은 되돌릴 수 없습니다.\n' +
            '• 해당 작품의 모든 정보가 영구적으로 삭제됩니다.\n' +
            '• 작품과 관련된 모든 데이터(이미지, 설명, 댓글 등)가 함께 삭제됩니다.\n' +
            '• 이 작업은 되돌릴 수 없으므로 신중하게 결정해주세요.');

        if (confirmed) {
            try {
                const response = await fetch(`/admin/management/artwork/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                const result = await response.json();

                if (result.success) {
                    showSuccessMessage(result.message);
                    window.location.href = '/admin/management/artwork';
                } else {
                    showErrorMessage(result.message || '작품 삭제에 실패했습니다.');
                }
            } catch (error) {
                console.error('Error:', error);
                showErrorMessage('작품 삭제 중 오류가 발생했습니다.');
            }
        }
    }

    goToPage(page) {
        this.pagination.page = page;
        this.applyFiltersAndSort();
    }

    handleSort(field) {
        // 같은 필드로 정렬할 경우 오름차순/내림차순 토글
        if (this.pagination.sort === field) {
            this.pagination.order = this.pagination.order === 'asc' ? 'desc' : 'asc';
        } else {
            this.pagination.sort = field;
            this.pagination.order = 'desc'; // 기본 내림차순
        }

        this.applyFiltersAndSort();
    }

    handleFilter() {
        this.filters.keyword = document.querySelector('input[name="keyword"]').value;
        this.pagination.page = 1; // 필터 변경시 첫 페이지로

        this.applyFiltersAndSort();
    }

    applyFiltersAndSort() {
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
