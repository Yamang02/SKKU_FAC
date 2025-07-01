import React, { useState, useEffect, useCallback } from 'react';
import {
    Table,
    Button,
    Input,
    Select,
    Breadcrumb,
    Tooltip,
    Modal,
    Form,
    Pagination,
    Card,
    Space,
    Typography,
    Tag,
    Checkbox,
    message,
} from "antd";
import {
    SearchOutlined,
    EditOutlined,
    FilterOutlined,
    DeleteOutlined,
    KeyOutlined,
    ExclamationCircleOutlined,
} from "@ant-design/icons";
import { UserAdminApi } from '../../api/UserAdminApi';
import { useAuth } from '../../shared/contexts/AuthContext';
import type {
    AdminUserDetail,
    AdminUserSearchParams,
    BackendUserResponse,
    AdminUpdateUserRequest
} from '../../types/user.types';
import { useAdminError } from '../../shared/contexts/AdminErrorContext';

const { Option } = Select;
const { Title, Text } = Typography;

export const UserManagement: React.FC = () => {
    const { isAuthenticated, accessToken } = useAuth();
    const [users, setUsers] = useState<AdminUserDetail[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    // 전역 오류 처리 훅 사용
    const { showError, hideError } = useAdminError();

    // 필터 상태 - 이전 버전과 동일한 방식
    const [searchText, setSearchText] = useState("");
    const [debouncedSearchText, setDebouncedSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("전체");
    const [roleFilter, setRoleFilter] = useState("전체");

    // 모달 상태
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUserDetail | null>(null);
    const [form] = Form.useForm();

    // 검색어 디바운스 처리
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchText(searchText);
        }, 500); // 500ms 후에 검색어 적용

        return () => clearTimeout(timer);
    }, [searchText]);

    // 사용자 목록 조회
    const fetchUsers = useCallback(async () => {
        if (!isAuthenticated() || !accessToken) {
            return; // 인증되지 않은 경우 요청하지 않음
        }

        setLoading(true);
        hideError(); // 새로운 요청 시 이전 오류 숨김
        try {
            const params: AdminUserSearchParams = {
                page: currentPage,
                limit: pageSize,
                sortBy: 'id',
                sortOrder: 'desc',
                ...(debouncedSearchText && { search: debouncedSearchText }),
                ...(roleFilter !== '전체' && { role: roleFilter as 'ADMIN' | 'SKKU_MEMBER' | 'EXTERNAL_MEMBER' }),
                ...(statusFilter !== '전체' && { status: statusFilter })
            };

            const response = await UserAdminApi.getUsers(params);

            if (response.success && response.data) {
                // 백엔드 데이터를 프론트엔드 형식으로 변환
                const transformedUsers = response.data.items.map((user: BackendUserResponse) => {
                    const transformedUser: AdminUserDetail = {
                        id: user.id,
                        username: user.username,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        emailVerified: user.emailVerified,
                        createdAt: user.createdAt,
                        updatedAt: user.updatedAt,
                        // 프로필 정보 추출
                        department: user.SkkuUserProfile?.department || null,
                        affiliation: user.ExternalUserProfile?.affiliation || null,
                        studentYear: user.SkkuUserProfile?.studentYear || null,
                        isClubMember: user.SkkuUserProfile?.isClubMember || false,
                    };
                    return transformedUser;
                });

                setUsers(transformedUsers);
                setTotal(response.data.total);
            } else {
                showError(
                    '데이터 로드 실패',
                    '사용자 목록을 불러올 수 없습니다.',
                    response.error || '서버에서 오류가 발생했습니다.'
                );
            }
        } catch (error) {
            console.error('사용자 목록 조회 실패:', error);
            showError(
                '서버 연결 오류',
                '사용자 목록을 불러오는 중 오류가 발생했습니다.',
                error instanceof Error ? error.message : '네트워크 오류가 발생했습니다.'
            );
        } finally {
            setLoading(false);
        }
    }, [isAuthenticated, accessToken, currentPage, pageSize, debouncedSearchText, statusFilter, roleFilter]);

    // 데이터 로드 - 의존성이 변경될 때마다 실행
    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // 모달 표시 함수 - 회원 추가 기능 제거, 수정 모드만 지원
    const showModal = (user: AdminUserDetail) => {
        if (!user) {
            message.warning('회원 정보 수정만 가능합니다.');
            return;
        }

        setEditingUser(user);
        setIsModalVisible(true);

        // 폼에 기존 사용자 데이터 설정
        form.setFieldsValue({
            username: user.username,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            affiliation: user.affiliation,
            studentYear: user.studentYear,
            isClubMember: user.isClubMember,
            emailVerified: user.emailVerified
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    // 폼 제출 핸들러 - 수정 모드만 지원
    const handleOk = () => {
        console.log('🔄 handleOk 시작');
        console.log('📋 editingUser:', editingUser);

        if (!editingUser) {
            showError('오류', '수정할 회원 정보가 없습니다.', '', 'warning');
            return;
        }

        console.log('📝 폼 유효성 검사 시작');

        form.validateFields().then(async (values) => {
            console.log('✅ 폼 유효성 검사 성공');
            console.log('📊 폼 데이터:', values);

            setLoading(true);
            try {
                // 수정 모드
                const updateData: AdminUpdateUserRequest = {
                    name: values.name,
                    email: values.email,
                    role: values.role,
                    department: values.department,
                    affiliation: values.affiliation,
                    studentYear: values.studentYear,
                    isClubMember: values.isClubMember,
                    emailVerified: values.emailVerified
                };

                console.log('🔍 업데이트 데이터:', updateData);
                console.log('🚀 API 호출 시작 - editingUser.id:', editingUser.id);

                const response = await UserAdminApi.updateUser(editingUser.id, updateData);

                console.log('📡 API 응답:', response);

                if (response.success) {
                    message.success('사용자 정보가 성공적으로 수정되었습니다.');
                    setIsModalVisible(false);
                    form.resetFields();
                    fetchUsers();
                } else {
                    showError(
                        '수정 실패',
                        '사용자 정보 수정에 실패했습니다.',
                        response.error || '서버에서 오류가 발생했습니다.'
                    );
                }
            } catch (error) {
                console.error('❌ 사용자 처리 실패:', error);
                showError(
                    '서버 오류',
                    '작업 중 오류가 발생했습니다.',
                    error instanceof Error ? error.message : '네트워크 연결을 확인해주세요.'
                );
            } finally {
                setLoading(false);
            }
        }).catch((errorInfo) => {
            console.error('❌ 폼 유효성 검사 실패:', errorInfo);
            showError(
                '입력 오류',
                '입력한 정보를 다시 확인해주세요.',
                '필수 항목이 누락되었거나 형식이 올바르지 않습니다.',
                'warning'
            );
        });
    };

    // 회원 삭제 함수
    const handleDeleteUser = () => {
        if (!editingUser) return;

        Modal.confirm({
            title: '회원 삭제',
            icon: <ExclamationCircleOutlined />,
            content: `"${editingUser.name}" 회원을 정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.`,
            okText: '삭제',
            okType: 'danger',
            cancelText: '취소',
            async onOk() {
                try {
                    const response = await UserAdminApi.deleteUser(editingUser.id);

                    if (response.success) {
                        message.success(`"${editingUser.name}" 회원이 삭제되었습니다.`);
                        setIsModalVisible(false);
                        form.resetFields();
                        fetchUsers();
                    } else {
                        showError(
                            '삭제 실패',
                            '사용자 삭제에 실패했습니다.',
                            response.error || '서버에서 오류가 발생했습니다.'
                        );
                    }
                } catch (error) {
                    console.error('사용자 삭제 실패:', error);
                    showError(
                        '서버 오류',
                        '사용자 삭제 중 오류가 발생했습니다.',
                        error instanceof Error ? error.message : '네트워크 연결을 확인해주세요.'
                    );
                }
            },
        });
    };

    // 비밀번호 리셋 함수
    const handleResetPassword = () => {
        if (!editingUser) return;

        Modal.confirm({
            title: '비밀번호 초기화',
            icon: <KeyOutlined />,
            content: `"${editingUser.name}" 회원의 비밀번호를 초기화하시겠습니까? 임시 비밀번호가 생성됩니다.`,
            okText: '초기화',
            cancelText: '취소',
            async onOk() {
                try {
                    const response = await UserAdminApi.resetPassword(editingUser.id);

                    if (response.success && response.data) {
                        const tempPassword = response.data.tempPassword;

                        Modal.success({
                            title: '비밀번호 초기화 완료',
                            content: (
                                <div>
                                    <p>"{editingUser.name}" 회원의 비밀번호가 초기화되었습니다.</p>
                                    <p><strong>임시 비밀번호: {tempPassword}</strong></p>
                                    <p style={{ color: '#666', fontSize: '12px' }}>
                                        회원에게 임시 비밀번호를 전달하고 로그인 후 변경하도록 안내해주세요.
                                    </p>
                                </div>
                            ),
                            width: 400,
                        });
                    } else {
                        showError(
                            '초기화 실패',
                            '비밀번호 초기화에 실패했습니다.',
                            response.error || '서버에서 오류가 발생했습니다.'
                        );
                    }
                } catch (error) {
                    console.error('비밀번호 초기화 실패:', error);
                    showError(
                        '서버 오류',
                        '비밀번호 초기화 중 오류가 발생했습니다.',
                        error instanceof Error ? error.message : '네트워크 연결을 확인해주세요.'
                    );
                }
            },
        });
    };

    const columns = [
        {
            title: "사용자명",
            dataIndex: "username",
            key: "username",
            width: 120,
        },
        {
            title: "이름",
            dataIndex: "name",
            key: "name",
            width: 100,
        },
        {
            title: "이메일",
            dataIndex: "email",
            key: "email",
            width: 200,
            render: (email: string, record: AdminUserDetail) => (
                <span>
                    {email}
                    {record.emailVerified && (
                        <Tag color="green" style={{ marginLeft: 8 }}>
                            인증됨
                        </Tag>
                    )}
                </span>
            ),
        },
        {
            title: "역할",
            dataIndex: "role",
            key: "role",
            width: 120,
            render: (role: string) => {
                const roleInfo: { [key: string]: { text: string; color: string } } = {
                    'SKKU_MEMBER': { text: 'SKKU 회원', color: 'green' },
                    'EXTERNAL_MEMBER': { text: '외부 회원', color: 'blue' },
                    'ADMIN': { text: '관리자', color: 'red' }
                };
                const info = roleInfo[role] || { text: role, color: 'default' };
                return <Tag color={info.color}>{info.text}</Tag>;
            },
        },
        {
            title: "소속정보",
            key: "department",
            width: 150,
            render: (_: unknown, record: AdminUserDetail) => {
                if (record.role === 'EXTERNAL_MEMBER') {
                    return record.affiliation || '-';
                }
                return record.department || '-';
            },
        },
        {
            title: "학번",
            dataIndex: "studentYear",
            key: "studentYear",
            width: 80,
            render: (studentYear: string | null, record: AdminUserDetail) => {
                return (record.role === 'SKKU_MEMBER' || record.role === 'ADMIN')
                    ? (studentYear ? `${studentYear}` : '-')
                    : '-';
            },
        },
        {
            title: "가입일",
            dataIndex: "createdAt",
            key: "createdAt",
            width: 120,
            render: (date: string) => new Date(date).toLocaleDateString('ko-KR'),
        },
        {
            title: "동아리 회원",
            dataIndex: "isClubMember",
            key: "isClubMember",
            width: 100,
            align: 'center' as const,
            render: (isClubMember: boolean) => (
                <Tag color={isClubMember ? 'blue' : 'default'}>
                    {isClubMember ? '회원' : '비회원'}
                </Tag>
            ),
        },
        {
            title: "작업",
            key: "action",
            width: 80,
            render: (_: unknown, record: AdminUserDetail) => (
                <Tooltip title="회원정보 수정">
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        style={{ color: '#1890ff' }}
                    />
                </Tooltip>
            ),
        },
    ];

    // 백엔드에서 이미 페이지네이션된 데이터를 받으므로 추가 처리 불필요

    return (
        <Card style={{ marginBottom: '24px' }}>
            <div style={{ marginBottom: '16px' }}>
                <Breadcrumb
                    items={[{ title: "관리자" }, { title: "회원 관리" }]}
                    style={{ marginBottom: '16px' }}
                />

                <div style={{
                    borderLeft: '4px solid #1890ff',
                    paddingLeft: '12px',
                    marginBottom: '8px'
                }}>
                    <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
                        회원목록
                    </Title>
                </div>
                <Text type="secondary">
                    총 {total}명의 회원
                </Text>
            </div>

            <div style={{ marginBottom: '24px' }}>
                <Space wrap>
                    <Select
                        placeholder="회원 상태"
                        style={{ width: 140 }}
                        value={statusFilter}
                        onChange={setStatusFilter}
                    >
                        <Option value="전체">전체 상태</Option>
                        <Option value="ACTIVE">활성</Option>
                        <Option value="INACTIVE">비활성</Option>
                        <Option value="BLOCKED">차단</Option>
                        <Option value="UNVERIFIED">미인증</Option>
                    </Select>

                    <Select
                        placeholder="회원 역할"
                        style={{ width: 180 }}
                        value={roleFilter}
                        onChange={setRoleFilter}
                    >
                        <Option value="전체">전체 역할</Option>
                        <Option value="SKKU_MEMBER">SKKU 회원</Option>
                        <Option value="EXTERNAL_MEMBER">외부 회원</Option>
                        <Option value="ADMIN">관리자</Option>
                    </Select>

                    <Input
                        placeholder="이름, 아이디, 이메일 검색"
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={() => {/* 엔터키로 검색 트리거 가능 */ }}
                        style={{ width: 300 }}
                    />

                    <Button
                        type="primary"
                        icon={<FilterOutlined />}
                        onClick={fetchUsers}
                    >
                        필터 적용
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={users}
                rowKey="id"
                loading={loading}
                pagination={false}
                scroll={{ x: 1000 }}
                style={{ marginBottom: '24px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    current={currentPage}
                    onChange={setCurrentPage}
                    total={total}
                    pageSize={pageSize}
                    showSizeChanger={false}
                    showQuickJumper={false}
                />
            </div>

            <Modal
                title="회원 정보 수정"
                open={isModalVisible}
                onCancel={handleCancel}
                width={600}
                maskClosable={false}
                destroyOnHidden={true}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        취소
                    </Button>,
                    <Button
                        key="reset"
                        icon={<KeyOutlined />}
                        onClick={handleResetPassword}
                        style={{ marginRight: '8px' }}
                    >
                        비밀번호 초기화
                    </Button>,
                    <Button
                        key="delete"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={handleDeleteUser}
                        style={{ marginRight: '8px' }}
                    >
                        회원 삭제
                    </Button>,
                    <Button
                        key="submit"
                        type="primary"
                        onClick={handleOk}
                        loading={loading}
                    >
                        수정
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ status: "ACTIVE", role: "SKKU_MEMBER" }}
                    requiredMark={false}
                >
                    <div style={{ marginBottom: '16px' }}>
                        <Form.Item
                            name="username"
                            label="사용자명(ID)"
                        >
                            <Input
                                placeholder="사용자명"
                                disabled={true}
                                readOnly={true}
                                style={{ backgroundColor: '#f5f5f5' }}
                            />
                        </Form.Item>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                        <Form.Item
                            name="name"
                            label="이름"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: "이름을 입력해주세요!" }]}
                        >
                            <Input placeholder="홍길동" />
                        </Form.Item>

                        <Form.Item
                            name="role"
                            label="역할"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: "역할을 선택해주세요!" }]}
                        >
                            <Select placeholder="역할 선택">
                                <Option value="SKKU_MEMBER">성균관대 구성원</Option>
                                <Option value="EXTERNAL_MEMBER">외부인</Option>
                                <Option value="ADMIN">관리자</Option>
                            </Select>
                        </Form.Item>
                    </div>

                    <Form.Item
                        name="email"
                        label="이메일"
                        rules={[
                            { required: true, message: "이메일을 입력해주세요!" },
                            { type: "email", message: "유효한 이메일 형식이 아닙니다!" },
                        ]}
                    >
                        <Input placeholder="example@skku.edu" />
                    </Form.Item>

                    {/* 기본 정보와 상세 정보 구분선 */}
                    <div style={{
                        borderTop: '1px solid #f0f0f0',
                        marginTop: '24px',
                        paddingTop: '16px',
                        marginBottom: '16px'
                    }}>
                        <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                            상세 정보
                        </Text>
                    </div>

                    {/* 역할별 조건부 필드 */}
                    <Form.Item shouldUpdate={(prevValues, currentValues) => prevValues.role !== currentValues.role}>
                        {({ getFieldValue }) => {
                            const role = getFieldValue('role');

                            if (role === 'SKKU_MEMBER' || role === 'ADMIN') {
                                return (
                                    <>
                                        <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                            <Form.Item
                                                name="department"
                                                label="학과/소속"
                                                style={{ flex: 1 }}
                                                rules={[{ required: true, message: "학과를 입력해주세요!" }]}
                                            >
                                                <Input placeholder="컴퓨터공학과" />
                                            </Form.Item>

                                            <Form.Item
                                                name="studentYear"
                                                label="학번 (연도)"
                                                style={{ flex: 1 }}
                                                rules={[
                                                    { required: true, message: "학번을 입력해주세요!" },
                                                    { pattern: /^[0-9]{2}$/, message: "2자리 숫자를 입력해주세요 (예: 23)" }
                                                ]}
                                            >
                                                <Input placeholder="23" maxLength={2} />
                                            </Form.Item>
                                        </div>

                                        <Form.Item
                                            name="isClubMember"
                                            label="동아리 회원 여부"
                                            valuePropName="checked"
                                        >
                                            <Checkbox>SKKU 미술학회 회원입니다</Checkbox>
                                        </Form.Item>
                                    </>
                                );
                            } else if (role === 'EXTERNAL_MEMBER') {
                                return (
                                    <Form.Item
                                        name="affiliation"
                                        label="소속/기관"
                                        rules={[{ required: true, message: "소속을 입력해주세요!" }]}
                                    >
                                        <Input placeholder="소속 기관명" />
                                    </Form.Item>
                                );
                            }

                            return null;
                        }}
                    </Form.Item>

                    {editingUser && (
                        <Form.Item
                            name="emailVerified"
                            label="이메일 인증"
                            valuePropName="checked"
                        >
                            <Checkbox>이메일 인증 완료</Checkbox>
                        </Form.Item>
                    )}

                    {/* 시스템 정보 섹션 */}
                    {editingUser && (
                        <>
                            <div style={{
                                borderTop: '1px solid #f0f0f0',
                                marginTop: '24px',
                                paddingTop: '16px',
                                marginBottom: '16px'
                            }}>
                                <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
                                    시스템 정보
                                </Text>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                <Form.Item label="가입일" style={{ flex: 1 }}>
                                    <Input value={new Date(editingUser.createdAt).toLocaleDateString('ko-KR')} readOnly disabled />
                                </Form.Item>

                                <Form.Item label="수정일" style={{ flex: 1 }}>
                                    <Input value={new Date(editingUser.updatedAt).toLocaleDateString('ko-KR')} readOnly disabled />
                                </Form.Item>
                            </div>

                            <Form.Item label="계정 ID">
                                <Input value={`USER_${editingUser.id}`} readOnly disabled />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>
        </Card>
    );
};
