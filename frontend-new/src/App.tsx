import React, { useState } from 'react';
import { Layout, Menu, Card, Button, Avatar, Badge, Breadcrumb } from 'antd';
import {
    UserOutlined,
    PictureOutlined,
    AppstoreOutlined,
    HomeOutlined,
    SettingOutlined,
    BellOutlined,
    EyeOutlined
} from '@ant-design/icons';

const { Header, Sider, Content } = Layout;

const App: React.FC = () => {
    const [collapsed] = useState(false);

    // 최근 활동 데이터
    const recentActivities = [
        {
            id: 1,
            name: '김민수',
            action: '작품 등록(아트워크)',
            time: '2025-06-18 09:30:45',
        },
        {
            id: 2,
            name: '이지수',
            action: '사용자 추가',
            time: '2025-06-18 08:15:22',
        },
        {
            id: 3,
            name: '김민수',
            action: '작품 카테고리 수정',
            time: '2025-06-17 17:45:33',
        },
        {
            id: 4,
            name: '이지수',
            action: '사용자(관리자)',
            time: '2025-06-17 16:20:11',
        },
        {
            id: 5,
            name: '김민수',
            action: '작품 태그 #2',
            time: '2025-06-17 15:10:05',
        }
    ];

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider
                trigger={null}
                collapsible
                collapsed={collapsed}
                style={{
                    background: '#1a2942',
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
                    borderBottom: '1px solid #2c3e50'
                }}>
                    SKKU Gallery
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    style={{ background: '#1a2942', paddingTop: '16px' }}
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
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    height: '64px',
                    zIndex: 5
                }}>
                    <Breadcrumb
                        items={[
                            { title: '홈' },
                            { title: '관리자 대시보드' },
                        ]}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <Badge count={5} style={{ cursor: 'pointer' }}>
                            <BellOutlined style={{ fontSize: '18px' }} />
                        </Badge>
                        <Button
                            type="primary"
                            icon={<SettingOutlined />}
                            style={{ borderRadius: '6px' }}
                        >
                            설정
                        </Button>
                    </div>
                </Header>
                <Content style={{ padding: '24px', background: '#f5f5f5' }}>
                    <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', marginBottom: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>관리자 대시보드</h1>
                            <Button
                                type="primary"
                                style={{ borderRadius: '6px' }}
                            >
                                보고서 다운로드
                            </Button>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', marginBottom: '32px' }}>
                            <Card style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #1890ff' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>총 회원 수</p>
                                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>7</h2>
                                    </div>
                                    <div style={{ background: '#e6f7ff', padding: '12px', borderRadius: '50%' }}>
                                        <UserOutlined style={{ color: '#1890ff', fontSize: '20px' }} />
                                    </div>
                                </div>
                            </Card>
                            <Card style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #52c41a' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>작품 수</p>
                                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>12</h2>
                                    </div>
                                    <div style={{ background: '#f6ffed', padding: '12px', borderRadius: '50%' }}>
                                        <PictureOutlined style={{ color: '#52c41a', fontSize: '20px' }} />
                                    </div>
                                </div>
                            </Card>
                            <Card style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #f5222d' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>전시 수</p>
                                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>156</h2>
                                    </div>
                                    <div style={{ background: '#fff1f0', padding: '12px', borderRadius: '50%' }}>
                                        <AppstoreOutlined style={{ color: '#f5222d', fontSize: '20px' }} />
                                    </div>
                                </div>
                            </Card>
                            <Card style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderLeft: '4px solid #fa8c16' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div>
                                        <p style={{ color: '#666', fontSize: '14px', margin: '0 0 8px 0' }}>방문자 수</p>
                                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>2,345</h2>
                                    </div>
                                    <div style={{ background: '#fff7e6', padding: '12px', borderRadius: '50%' }}>
                                        <EyeOutlined style={{ color: '#fa8c16', fontSize: '20px' }} />
                                    </div>
                                </div>
                            </Card>
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '32px' }}>
                            <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px', border: '1px solid #f0f0f0' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>월별 통계</h3>
                                <div style={{ height: '300px', background: '#fafafa', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                    차트 영역
                                </div>
                            </div>
                            <div style={{ background: '#fff', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', padding: '16px', border: '1px solid #f0f0f0' }}>
                                <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '16px' }}>카테고리 분포</h3>
                                <div style={{ height: '300px', background: '#fafafa', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
                                    차트 영역
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
                        <div>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>대시보드 상세</h2>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                    <Card style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>금주의 하이라이트</h3>
                                        <p style={{ color: '#666', margin: '4px 0' }}>신규 전시 3건</p>
                                        <p style={{ color: '#666', margin: '4px 0' }}>신규 작품 등록 5건</p>
                                        <p style={{ color: '#666', margin: '4px 0' }}>신규 회원가입 2건</p>
                                    </Card>
                                    <Card style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                        <h3 style={{ fontSize: '18px', fontWeight: '500', marginBottom: '8px' }}>시스템 상태</h3>
                                        <p style={{ color: '#52c41a', margin: '4px 0' }}>정상 운영중</p>
                                        <p style={{ color: '#666', margin: '4px 0' }}>마지막 업데이트: 2025-06-18</p>
                                    </Card>
                                </div>
                            </div>
                        </div>
                        <div>
                            <div style={{ background: '#fff', padding: '24px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                                <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>최근 활동 내역</h2>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                    {recentActivities.map((activity) => (
                                        <div key={activity.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', paddingBottom: '12px', borderBottom: '1px solid #f0f0f0' }}>
                                            <Avatar size="small" icon={<UserOutlined />} />
                                            <div style={{ flex: 1 }}>
                                                <p style={{ margin: '0 0 4px 0', fontWeight: '500' }}>{activity.name}</p>
                                                <p style={{ margin: '0 0 4px 0', color: '#666', fontSize: '14px' }}>{activity.action}</p>
                                                <p style={{ margin: 0, color: '#999', fontSize: '12px' }}>{activity.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
};

export default App;
