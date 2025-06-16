import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link, useLocation } from 'react-router-dom';

const AdminHeader = ({ title, subtitle }) => {
    const location = useLocation();

    // URL 기반 자동 페이지 정보 판단
    const getPageInfo = () => {
        const path = location.pathname;

        if (path.includes('/admin/users')) {
            // RESTful 패턴: /admin/users/:id
            if (path.match(/\/admin\/users\/\d+/)) {
                const userId = path.split('/').pop();
                return {
                    title: title || '회원 상세',
                    breadcrumb: ['관리자', '회원 관리', `사용자 ${userId}`]
                };
            }
            return {
                title: title || '회원 관리',
                breadcrumb: ['관리자', '회원 관리']
            };
        }

        if (path.includes('/admin/exhibitions')) {
            return {
                title: title || '전시 관리',
                breadcrumb: ['관리자', '전시 관리']
            };
        }

        if (path.includes('/admin/artworks')) {
            return {
                title: title || '작품 관리',
                breadcrumb: ['관리자', '작품 관리']
            };
        }

        if (path.includes('/admin/dashboard')) {
            return {
                title: title || '대시보드',
                breadcrumb: ['관리자', '대시보드']
            };
        }

        // 기본값
        return {
            title: title || '관리자 페이지',
            breadcrumb: ['관리자']
        };
    };

    const pageInfo = getPageInfo();

    return (
        <View style={styles.adminHeader}>
            <View style={styles.headerTop}>
                <View style={styles.titleSection}>
                    <Text style={styles.title}>{pageInfo.title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                    <View style={styles.breadcrumb}>
                        {pageInfo.breadcrumb.map((crumb, index) => (
                            <React.Fragment key={index}>
                                <Text style={styles.breadcrumbText}>{crumb}</Text>
                                {index < pageInfo.breadcrumb.length - 1 && (
                                    <Text style={styles.breadcrumbSeparator}>/</Text>
                                )}
                            </React.Fragment>
                        ))}
                    </View>
                </View>

                {/* 검색 기능은 나중에 구현 예정
                <View style={styles.searchSection}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="검색어를 입력하세요"
                    />
                    <TouchableOpacity style={styles.searchButton}>
                        <Text style={styles.searchButtonText}>🔍 검색</Text>
                    </TouchableOpacity>
                </View>
                */}

                <View style={styles.homeSection}>
                    <Link to="/" style={styles.homeButton}>
                        <Text style={styles.homeIcon}>🏠</Text>
                    </Link>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    adminHeader: {
        backgroundColor: '#ffffff',
        borderBottomWidth: 1,
        borderBottomColor: '#e9ecef',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    titleSection: {
        flex: 1,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: 5,
    },
    subtitle: {
        fontSize: 16,
        color: '#6c757d',
        marginBottom: 5,
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    breadcrumbText: {
        fontSize: 14,
        color: '#6c757d',
    },
    breadcrumbSeparator: {
        fontSize: 14,
        color: '#6c757d',
        marginHorizontal: 8,
    },
    searchSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        justifyContent: 'center',
        maxWidth: 400,
    },
    searchInput: {
        flex: 1,
        padding: 10,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 4,
        marginRight: 10,
        backgroundColor: '#f8f9fa',
    },
    searchButton: {
        backgroundColor: '#3498db',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 4,
    },
    searchButtonText: {
        color: '#ffffff',
        fontWeight: '500',
    },
    homeSection: {
        marginLeft: 20,
    },
    homeButton: {
        backgroundColor: '#28a745',
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 6,
        textDecoration: 'none',
    },
    homeIcon: {
        fontSize: 18,
        color: '#ffffff',
    },
});

export default AdminHeader;
