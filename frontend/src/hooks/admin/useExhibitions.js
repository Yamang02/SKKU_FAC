import { useState, useEffect, useCallback } from 'react';
import AdminExhibitionApi from '../../api/admin/AdminExhibitionApi.js';

export const useExhibitions = () => {
    const [exhibitions, setExhibitions] = useState([]);
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
        exhibitionType: '',
        featured: '',
        year: '',
        keyword: ''
    });

    // 데이터 로딩 함수
    const loadExhibitions = useCallback(async (pageNum = 1, currentFilters = filters) => {
        try {
            setLoading(true);
            setError(null);

            const pagination = { page: pageNum, limit: 10 };
            const response = await AdminExhibitionApi.getExhibitionList(pagination, currentFilters);

            if (response.success) {
                setExhibitions(response.data.exhibitions || []);
                setTotal(response.data.total || 0);
                setPage(response.data.page || {
                    currentPage: 1,
                    totalPages: 1,
                    hasNextPage: false,
                    hasPreviousPage: false
                });
            } else {
                setError(response.message || '전시 목록을 불러오는데 실패했습니다.');
            }
        } catch (err) {
            console.error('Exhibition loading error:', err);
            setError('전시 목록을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setLoading(false);
        }
    }, [filters]);

    // 초기 데이터 로딩
    useEffect(() => {
        loadExhibitions();
    }, [loadExhibitions]);

    // 필터 변경 처리
    const handleFilterChange = useCallback((key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        loadExhibitions(1, newFilters);
    }, [filters, loadExhibitions]);

    // 페이지 변경 처리
    const handlePageChange = useCallback((pageNum) => {
        loadExhibitions(pageNum);
    }, [loadExhibitions]);

    // 필터 초기화
    const resetFilters = useCallback(() => {
        const emptyFilters = {
            exhibitionType: '',
            featured: '',
            year: '',
            keyword: ''
        };
        setFilters(emptyFilters);
        loadExhibitions(1, emptyFilters);
    }, [loadExhibitions]);

    // 주요 전시 토글
    const toggleFeatured = useCallback(async (exhibitionId, currentFeaturedStatus) => {
        try {
            setLoading(true);
            // 주요 전시 상태 변경 로직 (API에 따라 구현)
            // await ExhibitionApi.updateExhibitionFeatured(exhibitionId, !currentFeaturedStatus);

            // 목록 새로고침
            await loadExhibitions(page.currentPage);
        } catch (err) {
            console.error('Featured toggle error:', err);
            setError('주요 전시 설정 변경에 실패했습니다.');
        } finally {
            setLoading(false);
        }
    }, [loadExhibitions, page.currentPage]);

    return {
        exhibitions,
        loading,
        error,
        total,
        page,
        filters,
        handleFilterChange,
        handlePageChange,
        resetFilters,
        toggleFeatured,
        reload: loadExhibitions
    };
};
