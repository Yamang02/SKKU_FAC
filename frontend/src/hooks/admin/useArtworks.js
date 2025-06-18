import { useState, useEffect, useCallback } from 'react';
import AdminArtworkApi from '../../api/admin/AdminArtworkApi.js';

export const useArtworks = () => {
    const [artworks, setArtworks] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState({
        currentPage: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false
    });

    // 필터 상태
    const [filters, setFilters] = useState({
        status: '',
        isFeatured: '',
        keyword: '',
        sort: 'createdAt',
        order: 'desc'
    });

    // 데이터 로딩 함수
    const loadArtworks = useCallback(async (pageNum = 1, currentFilters = filters) => {
        try {
            setLoading(true);
            setError(null);

            const pagination = { page: pageNum, limit: 10 };
            const response = await AdminArtworkApi.getArtworkList(pagination, currentFilters);

            if (response.success) {
                setArtworks(response.data.artworks || []);
                setTotal(response.data.total || 0);
                setPage(response.data.page || {
                    currentPage: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false
                });
            } else {
                setError(response.message || '작품 목록을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('Artwork loading error:', err);
            setError('작품 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // 초기 데이터 로딩
    useEffect(() => {
        loadArtworks();
    }, [loadArtworks]);

    // 필터 변경 처리
    const handleFilterChange = useCallback((key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        loadArtworks(1, newFilters);
    }, [filters, loadArtworks]);

    // 페이지 변경 처리
    const handlePageChange = useCallback((pageNum) => {
        loadArtworks(pageNum);
    }, [loadArtworks]);

    // 필터 초기화
    const resetFilters = useCallback(() => {
        const emptyFilters = {
            status: '',
            isFeatured: '',
            keyword: '',
            sort: 'createdAt',
            order: 'desc'
        };
        setFilters(emptyFilters);
        loadArtworks(1, emptyFilters);
    }, [loadArtworks]);

    // 주요 작품 토글
    const toggleFeatured = useCallback(async (artworkId, currentFeaturedStatus) => {
        try {
            setLoading(true);
            // 주요 작품 상태 변경 로직 (API에 따라 구현)
            // await ArtworkApi.updateArtworkFeatured(artworkId, !currentFeaturedStatus);

            // 목록 새로고침
            await loadArtworks(page.currentPage);
        } catch (err) {
            console.error('Featured toggle error:', err);
            setError('주요 작품 설정 변경에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [loadArtworks, page.currentPage]);

    // 작품 상태 변경
    const updateArtworkStatus = useCallback(async (artworkId, status) => {
        try {
            setLoading(true);
            const response = await AdminArtworkApi.updateArtworkStatus(artworkId, status);

            if (response.success) {
                // 목록 새로고침
                await loadArtworks(page.currentPage);
                return { success: true, message: `작품 상태가 ${status}로 변경되었습니다.` };
            } else {
                const errorMessage = response.message || '작품 상태 변경에 실패했습니다.';
                setError(errorMessage);
                return { success: false, message: errorMessage };
            }
        } catch (err) {
            console.error('Status update error:', err);
            const errorMessage = '작품 상태 변경 중 오류가 발생했습니다.';
            setError(errorMessage);
            return { success: false, message: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [loadArtworks, page.currentPage]);

    return {
        artworks,
        loading,
        error,
        total,
        page,
        filters,
        handleFilterChange,
        handlePageChange,
        resetFilters,
        toggleFeatured,
        updateArtworkStatus,
        reload: loadArtworks
    };
};
