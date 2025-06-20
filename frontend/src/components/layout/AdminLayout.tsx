import React, { useState } from 'react';
import { Layout, Menu, Badge, Dropdown, Avatar, Button } from 'antd';
import type { MenuProps } from 'antd';
import {
    UserOutlined,
    PictureOutlined,
    AppstoreOutlined,
    HomeOutlined,
    SettingOutlined,
    BellOutlined,
    LogoutOutlined,
    DownOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../shared/contexts/AuthContext';
import { showSuccessMessage } from '../../shared/utils/notification';

const { Header, Sider, Content } = Layout;

export type AdminPage = 'dashboard' | 'users' | 'artworks' | 'exhibitions';

interface AdminLayoutProps {
    children: React.ReactNode;
    selectedMenuKey?: string;
    onMenuClick?: (key: AdminPage) => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
    children,
    selectedMenuKey = '1',
    onMenuClick
}) => {
    const [collapsed] = useState(false);
    const { user, logout } = useAuth();

    const handleLogout = async () => {
        await logout();
        showSuccessMessage('로그아웃되었습니다.');
    };

    const userMenuItems: MenuProps['items'] = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: '프로필',
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '설정',
        },
        {
            type: 'divider',
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: '로그아웃',
            onClick: handleLogout,
        },
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    background: '#001529',
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    zIndex: 10,
                }}
                width={200}
            >
                <div style={{
                    height: '64px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    borderBottom: '1px solid #1f1f1f'
                }}>
                    SKKU Gallery
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[selectedMenuKey]}
                    style={{ background: '#001529', paddingTop: '16px' }}
                    onClick={({ key }) => {
                        const pageMap: Record<string, AdminPage> = {
                            '1': 'dashboard',
                            '2': 'users',
                            '3': 'artworks',
                            '4': 'exhibitions',
                        };
                        onMenuClick?.(pageMap[key]);
                    }}
                    items={[
                        {
                            key: '1',
                            icon: <HomeOutlined />,
                            label: '대시보드',
                        },
                        {
                            key: '2',
                            icon: <UserOutlined />,
                            label: '회원 관리',
                        },
                        {
                            key: '3',
                            icon: <PictureOutlined />,
                            label: '작품 관리',
                        },
                        {
                            key: '4',
                            icon: <AppstoreOutlined />,
                            label: '전시 관리',
                        },
                    ]}
                />
            </Sider>
            <Layout style={{ marginLeft: 200 }}>
                <Header style={{
                    background: '#fff',
                    padding: '0 24px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    height: '64px',
                    zIndex: 5
                }}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600 }}>
                            관리자 패널
                        </h1>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Badge count={5} style={{ cursor: 'pointer' }}>
                            <BellOutlined style={{ fontSize: '18px', color: '#666' }} />
                        </Badge>

                        <Button
                            type="primary"
                            icon={<SettingOutlined />}
                            style={{ borderRadius: '6px' }}
                        >
                            설정
                        </Button>

                        <Dropdown menu={{ items: userMenuItems }} trigger={['click']}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                cursor: 'pointer',
                                padding: '8px 12px',
                                borderRadius: '6px',
                                transition: 'background-color 0.2s',
                            }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <Avatar
                                    size="small"
                                    icon={<UserOutlined />}
                                    src={user?.profileImageUrl}
                                />
                                <span style={{ fontSize: '14px', fontWeight: '500' }}>
                                    {user?.name || '관리자'}
                                </span>
                                <DownOutlined style={{ fontSize: '12px' }} />
                            </div>
                        </Dropdown>
                    </div>
                </Header>
                <Content style={{
                    padding: '24px',
                    background: '#f0f2f5',
                    minHeight: 'calc(100vh - 64px)'
                }}>
                    {children}
                </Content>
            </Layout>
        </Layout>
    );
};

export default AdminLayout;
