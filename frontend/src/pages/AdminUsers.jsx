import React, { useState, useEffect } from 'react';
import { fetchUsers } from '../utils/api';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [filters, setFilters] = useState({
        status: '',
        role: '',
        keyword: '',
        page: 1
    });

    const loadUsers = async () => {
        setLoading(true);
        setError(null);

        try {
            // API 호출 시 필터 파라미터 포함
            const queryParams = new URLSearchParams();
            if (filters.status) queryParams.append('status', filters.status);
            if (filters.role) queryParams.append('role', filters.role);
            if (filters.keyword) queryParams.append('keyword', filters.keyword);
            queryParams.append('page', filters.page);

            const response = await fetchUsers(`?${queryParams.toString()}`);
            setUsers(response.users || []);
            setTotal(response.total || 0);
        } catch (err) {
            setError(err.message);
            console.error('사용자 데이터 로딩 오류:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, [filters]);

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
            page: 1 // 필터 변경 시 첫 페이지로 이동
        }));
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        loadUsers();
    };

    const getRoleDisplayName = (role) => {
        const roleMap = {
            'ADMIN': '관리자',
            'SKKU_MEMBER': '성균관대 구성원',
            'EXTERNAL_MEMBER': '외부인'
        };
        return roleMap[role] || role;
    };

    const getStatusDisplayName = (status) => {
        const statusMap = {
            'ACTIVE': '활성',
            'INACTIVE': '비활성',
            'BLOCKED': '차단',
            'UNVERIFIED': '미인증'
        };
        return statusMap[status] || status;
    };

    return (
        <div className="admin-management">
            <h2 className="admin-title">회원목록</h2>

            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            {/* 컨트롤 섹션 */}
            <div className="admin-control">
                <div className="admin-control__group">
                    <span className="admin-control__info">총 {total}명의 회원</span>
                </div>
            </div>

            {/* 필터 섹션 */}
            <form onSubmit={handleFilterSubmit} className="admin-filter">
                <div className="admin-filter__group">
                    <select
                        className="admin-filter__select"
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                    >
                        <option value="">회원 상태</option>
                        <option value="ACTIVE">활성</option>
                        <option value="INACTIVE">비활성</option>
                        <option value="BLOCKED">차단</option>
                        <option value="UNVERIFIED">미인증</option>
                    </select>

                    <select
                        className="admin-filter__select"
                        name="role"
                        value={filters.role}
                        onChange={handleFilterChange}
                    >
                        <option value="">회원 역할</option>
                        <option value="ADMIN">관리자</option>
                        <option value="SKKU_MEMBER">성균관대 구성원</option>
                        <option value="EXTERNAL_MEMBER">외부인</option>
                    </select>

                    <input
                        type="text"
                        className="admin-filter__input"
                        name="keyword"
                        placeholder="이름, 아이디, 이메일 검색"
                        value={filters.keyword}
                        onChange={handleFilterChange}
                    />

                    <button type="submit" className="admin-button admin-button--primary">
                        <i className="fas fa-filter"></i>
                        필터 적용
                    </button>
                </div>
            </form>

            <div className="admin-management__content">
                {/* 테이블 섹션 */}
                <div className="admin-table-container">
                    {loading ? (
                        <div className="admin-loading">
                            사용자 데이터를 불러오는 중...
                        </div>
                    ) : (
                        <table className="admin-table">
                            <thead>
                                <tr>
                                    <th>아이디</th>
                                    <th>역할</th>
                                    <th>이름</th>
                                    <th>이메일</th>
                                    <th>소속정보</th>
                                    <th>가입일</th>
                                    <th>상태</th>
                                    <th>작업</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length > 0 ? (
                                    users.map(user => (
                                        <tr key={user.id}>
                                            <td>{user.username}</td>
                                            <td>
                                                <span className={`admin-badge admin-badge--${user.role?.toLowerCase()}`}>
                                                    {getRoleDisplayName(user.role)}
                                                </span>
                                            </td>
                                            <td>{user.name}</td>
                                            <td>{user.email}</td>
                                            <td>{user.profileSummary || '-'}</td>
                                            <td>{user.createdAtFormatted || new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td>
                                                <span className={`admin-badge admin-badge--${user.status?.toLowerCase()}`}>
                                                    {getStatusDisplayName(user.status)}
                                                </span>
                                            </td>
                                            <td className="admin-table__actions">
                                                <a
                                                    href={`/admin/management/user/${user.id}`}
                                                    className="admin-button admin-button--secondary admin-button--xs"
                                                    title="상세보기"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </a>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="8" className="admin-table__empty">
                                            등록된 회원이 없습니다.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* 페이지네이션 섹션 - 나중에 구현 */}
                <div className="admin-pagination">
                    <div className="admin-pagination__empty">
                        페이지네이션은 추후 구현 예정입니다.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminUsers;
