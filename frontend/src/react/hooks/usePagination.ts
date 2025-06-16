import { useState, useCallback, useMemo } from 'react';
import { PaginationParams, PaginatedResponse } from '../types';

export interface PaginationOptions {
    initialPage?: number;
    initialLimit?: number;
    initialSort?: string;
    initialOrder?: 'asc' | 'desc';
}

export interface PaginationState {
    page: number;
    limit: number;
    sort: string | null;
    order: 'asc' | 'desc';
}

export interface PaginationInfo {
    currentPage: number;
    totalPages: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface UsePaginationReturn {
    // State
    pagination: PaginationState;
    pageInfo: PaginationInfo | null;

    // Actions
    setPage: (page: number) => void;
    setLimit: (limit: number) => void;
    setSort: (field: string) => void;
    nextPage: () => void;
    prevPage: () => void;
    reset: () => void;

    // Utilities
    getQueryParams: () => PaginationParams;
    getPageNumbers: (range?: number) => number[];
    updatePageInfo: (response: PaginatedResponse<any>) => void;

    // URL helpers
    getPageUrl: (page: number) => string;
    updateUrlParams: (params: Partial<PaginationParams>) => void;
}

export const usePagination = (options: PaginationOptions = {}): UsePaginationReturn => {
    const {
        initialPage = 1,
        initialLimit = 10,
        initialSort = null,
        initialOrder = 'asc',
    } = options;

    const [pagination, setPagination] = useState<PaginationState>({
        page: initialPage,
        limit: initialLimit,
        sort: initialSort,
        order: initialOrder,
    });

    const [pageInfo, setPageInfo] = useState<PaginationInfo | null>(null);

    const setPage = useCallback((page: number) => {
        setPagination(prev => ({ ...prev, page }));
    }, []);

    const setLimit = useCallback((limit: number) => {
        setPagination(prev => ({ ...prev, limit, page: 1 })); // Reset to first page when changing limit
    }, []);

    const setSort = useCallback((field: string) => {
        setPagination(prev => {
            if (prev.sort === field) {
                // Toggle order if same field
                return { ...prev, order: prev.order === 'asc' ? 'desc' : 'asc' };
            } else {
                // Set new field with ascending order
                return { ...prev, sort: field, order: 'asc' };
            }
        });
    }, []);

    const nextPage = useCallback(() => {
        if (pageInfo && pageInfo.hasNext) {
            setPage(pagination.page + 1);
        }
    }, [pageInfo, pagination.page, setPage]);

    const prevPage = useCallback(() => {
        if (pageInfo && pageInfo.hasPrev) {
            setPage(pagination.page - 1);
        }
    }, [pageInfo, pagination.page, setPage]);

    const reset = useCallback(() => {
        setPagination({
            page: initialPage,
            limit: initialLimit,
            sort: initialSort,
            order: initialOrder,
        });
        setPageInfo(null);
    }, [initialPage, initialLimit, initialSort, initialOrder]);

    const getQueryParams = useCallback((): PaginationParams => {
        const params: PaginationParams = {
            page: pagination.page,
            limit: pagination.limit,
        };

        if (pagination.sort) {
            params.sort = pagination.sort;
            params.order = pagination.order;
        }

        return params;
    }, [pagination]);

    const getPageNumbers = useCallback((range: number = 2): number[] => {
        if (!pageInfo) return [1];

        const { currentPage, totalPages } = pageInfo;

        // 최소 1페이지는 표시
        if (totalPages <= 1) return [1];

        // 표시할 시작 페이지와 끝 페이지 계산
        let startPage = Math.max(1, currentPage - range);
        let endPage = Math.min(totalPages, currentPage + range);

        // 표시할 페이지 수 보정
        if (endPage - startPage < range * 2) {
            if (startPage === 1) {
                endPage = Math.min(totalPages, 1 + range * 2);
            } else if (endPage === totalPages) {
                startPage = Math.max(1, totalPages - range * 2);
            }
        }

        // 페이지 번호 배열 생성
        const pages: number[] = [];
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        return pages;
    }, [pageInfo]);

    const updatePageInfo = useCallback((response: PaginatedResponse<any>) => {
        const info: PaginationInfo = {
            currentPage: response.page,
            totalPages: response.totalPages,
            total: response.total,
            hasNext: response.page < response.totalPages,
            hasPrev: response.page > 1,
        };
        setPageInfo(info);
    }, []);

    const getPageUrl = useCallback((page: number): string => {
        if (typeof window === 'undefined') return '';

        const params = new URLSearchParams(window.location.search);
        params.set('page', page.toString());
        return `?${params.toString()}`;
    }, []);

    const updateUrlParams = useCallback((params: Partial<PaginationParams>) => {
        if (typeof window === 'undefined') return;

        const urlParams = new URLSearchParams(window.location.search);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                urlParams.set(key, value.toString());
            } else {
                urlParams.delete(key);
            }
        });

        const newUrl = `${window.location.pathname}?${urlParams.toString()}`;
        window.history.replaceState({}, '', newUrl);
    }, []);

    // Memoized return object
    const returnValue = useMemo((): UsePaginationReturn => ({
        pagination,
        pageInfo,
        setPage,
        setLimit,
        setSort,
        nextPage,
        prevPage,
        reset,
        getQueryParams,
        getPageNumbers,
        updatePageInfo,
        getPageUrl,
        updateUrlParams,
    }), [
        pagination,
        pageInfo,
        setPage,
        setLimit,
        setSort,
        nextPage,
        prevPage,
        reset,
        getQueryParams,
        getPageNumbers,
        updatePageInfo,
        getPageUrl,
        updateUrlParams,
    ]);

    return returnValue;
};

export default usePagination;
