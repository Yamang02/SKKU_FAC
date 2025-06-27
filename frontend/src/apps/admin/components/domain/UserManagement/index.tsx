import React, { useState, useEffect } from "react";
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

const { Option } = Select;
const { Title, Text } = Typography;

interface UserData {
    key: string;
    id: string;              // username
    name: string;
    email: string;
    role: string;            // ADMIN, SKKU_MEMBER, EXTERNAL_MEMBER
    department: string;      // SKKU 사용자용
    affiliation?: string;    // 외부 사용자용
    studentYear?: string;    // SKKU 사용자용 (2자리 숫자)
    isClubMember?: boolean;  // SKKU 사용자용
    status: string;          // ACTIVE, INACTIVE, BLOCKED, UNVERIFIED
    emailVerified?: boolean; // 이메일 인증 상태
    created: string;         // createdAt
    lastLogin?: string;      // lastLoginAt
}

export const UserManagement: React.FC = () => {
    const [searchText, setSearchText] = useState("");
    const [statusFilter, setStatusFilter] = useState("전체");
    const [roleFilter, setRoleFilter] = useState("전체");
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [form] = Form.useForm();
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const [loading, setLoading] = useState(false);

    // 사용자 데이터
    const initialUserData: UserData[] = [
        {
            key: "1",
            id: "jji780",
            name: "이지원",
            email: "1111bk@naver.com",
            role: "일반회원 구독자",
            department: "사무직 (15)",
            status: "활동",
            created: "5/26/2025",
        },
        {
            key: "2",
            id: "han1231",
            name: "강하니",
            email: "han1231@naver.com",
            role: "일반회원 구독자",
            department: "국어교육학과 (13)",
            status: "활동",
            created: "5/26/2025",
        },
        {
            key: "3",
            id: "geun",
            name: "정근영",
            email: "g.software@skku.edu",
            role: "일반회원 구독자",
            department: "소프트웨어학과 (23)",
            status: "활동",
            created: "5/25/2025",
        },
        {
            key: "4",
            id: "ijo210",
            name: "이정호",
            role: "일반회원 구독자",
            email: "ijo210@naver.com",
            department: "컴퓨터공학 (11)",
            status: "활동",
            created: "5/17/2025",
        },
        {
            key: "5",
            id: "admin",
            name: "관리자",
            role: "시스템관리자",
            email: "skkuhtcbdmstrtn@gmail.com",
            department: "-",
            status: "활동",
            created: "5/17/2025",
        },
        {
            key: "6",
            id: "user006",
            name: "박서연",
            email: "seoyeon@gmail.com",
            role: "일반회원",
            department: "경영학과 (8)",
            status: "비활성",
            created: "5/15/2025",
        },
        {
            key: "7",
            id: "user007",
            name: "김태희",
            email: "taehee@naver.com",
            role: "일반회원 구독자",
            department: "물리학과 (5)",
            status: "활동",
            created: "5/12/2025",
        },
        {
            key: "8",
            id: "user008",
            name: "이민준",
            email: "minjun@gmail.com",
            role: "일반회원",
            department: "화학과 (7)",
            status: "활동",
            created: "5/10/2025",
        },
        {
            key: "9",
            id: "user009",
            name: "최지우",
            email: "jiwoo@naver.com",
            role: "일반회원 구독자",
            department: "생명과학과 (9)",
            status: "비활성",
            created: "5/8/2025",
        },
        {
            key: "10",
            id: "user010",
            name: "정도윤",
            email: "doyun@gmail.com",
            role: "일반회원",
            department: "전자공학과 (12)",
            status: "활동",
            created: "5/5/2025",
        },
        {
            key: "11",
            id: "user011",
            name: "한소희",
            email: "sohee@naver.com",
            role: "일반회원 구독자",
            department: "심리학과 (6)",
            status: "활동",
            created: "5/3/2025",
        },
        {
            key: "12",
            id: "user012",
            name: "강준호",
            email: "junho@gmail.com",
            role: "일반회원",
            department: "기계공학과 (10)",
            status: "비활성",
            created: "5/1/2025",
        },
    ];

    const [userData, setUserData] = useState<UserData[]>(initialUserData);
    const [filteredData, setFilteredData] = useState<UserData[]>(initialUserData);

    useEffect(() => {
        filterData();
    }, [searchText, statusFilter, roleFilter, userData]);

    const filterData = () => {
        let filtered = [...userData];

        // 검색어 필터링
        if (searchText) {
            filtered = filtered.filter(
                (user) =>
                    user.name.toLowerCase().includes(searchText.toLowerCase()) ||
                    user.id.toLowerCase().includes(searchText.toLowerCase()) ||
                    user.email.toLowerCase().includes(searchText.toLowerCase()),
            );
        }

        // 상태 필터링
        if (statusFilter !== "전체") {
            filtered = filtered.filter((user) => user.status === statusFilter);
        }

        // 역할 필터링
        if (roleFilter !== "전체") {
            filtered = filtered.filter((user) => user.role === roleFilter);
        }

        setFilteredData(filtered);
    };

    const showModal = (user: UserData) => {
        if (!user) {
            message.warning('회원 정보 수정만 가능합니다.');
            return;
        }

        setEditingUser(user);
        setIsModalVisible(true);

        // 폼에 기존 사용자 데이터 설정
        form.setFieldsValue({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department,
            affiliation: user.affiliation,
            studentYear: user.studentYear,
            isClubMember: user.isClubMember
        });
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = () => {
        if (!editingUser) {
            message.error('수정할 회원 정보가 없습니다.');
            return;
        }

        form.validateFields().then((values) => {
            setLoading(true);

            // 실제 구현에서는 API 호출
            setTimeout(() => {
                // 기존 사용자 데이터 업데이트
                const updatedUsers = userData.map(user =>
                    user.key === editingUser.key
                        ? { ...user, ...values, updatedAt: new Date().toISOString() }
                        : user
                );
                setUserData(updatedUsers);
                setIsModalVisible(false);
                form.resetFields();
                setLoading(false);

                Modal.success({
                    title: '수정 완료',
                    content: `"${values.name}" 회원 정보가 수정되었습니다.`,
                });
            }, 1000);
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
            onOk() {
                // TODO: API 호출로 실제 삭제 처리
                // await deleteUserApi(editingUser.key);

                // 임시로 로컬 데이터에서 삭제
                const updatedUsers = userData.filter(user => user.key !== editingUser.key);
                setUserData(updatedUsers);
                setIsModalVisible(false);
                form.resetFields();

                // 성공 메시지 표시
                Modal.success({
                    title: '삭제 완료',
                    content: `"${editingUser.name}" 회원이 삭제되었습니다.`,
                });
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
            onOk() {
                // TODO: API 호출로 실제 비밀번호 리셋 처리
                // const result = await resetPasswordApi(editingUser.key);

                // 임시 비밀번호 생성 (실제로는 서버에서 받아올 값)
                const tempPassword = Math.random().toString(36).slice(-8);

                // 성공 메시지와 임시 비밀번호 표시
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
            },
        });
    };

    const columns = [
        {
            title: "사용자명",
            dataIndex: "id",
            key: "id",
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
        },
        {
            title: "역할",
            dataIndex: "role",
            key: "role",
            width: 120,
            render: (role: string) => {
                const roleMap: { [key: string]: { text: string; color: string } } = {
                    'SKKU_MEMBER': { text: 'SKKU 회원', color: 'green' },
                    'EXTERNAL_MEMBER': { text: '외부 회원', color: 'blue' },
                    'ADMIN': { text: '관리자', color: 'red' }
                };
                const roleInfo = roleMap[role] || { text: role, color: 'default' };
                return <Tag color={roleInfo.color}>{roleInfo.text}</Tag>;
            },
        },
        {
            title: "소속정보",
            dataIndex: "department",
            key: "department",
            width: 150,
            render: (department: string, record: UserData) => {
                if (record.role === 'EXTERNAL_MEMBER') {
                    return record.affiliation || '-';
                }
                return department || '-';
            },
        },
        {
            title: "학번",
            dataIndex: "studentYear",
            key: "studentYear",
            width: 80,
            render: (studentYear: string, record: UserData) => {
                return (record.role === 'SKKU_MEMBER' || record.role === 'ADMIN')
                    ? (studentYear || '-')
                    : '-';
            },
        },
        {
            title: "가입일",
            dataIndex: "created",
            key: "created",
            width: 120,
        },
        {
            title: "상태",
            dataIndex: "status",
            key: "status",
            width: 100,
            render: (status: string) => {
                const statusMap: { [key: string]: { text: string; color: string } } = {
                    'ACTIVE': { text: '활성', color: 'green' },
                    'INACTIVE': { text: '비활성', color: 'orange' },
                    'BLOCKED': { text: '차단', color: 'red' },
                    'UNVERIFIED': { text: '미인증', color: 'volcano' }
                };
                const statusInfo = statusMap[status] || { text: status, color: 'default' };
                return <Tag color={statusInfo.color}>{statusInfo.text}</Tag>;
            },
        },
        {
            title: "인증",
            dataIndex: "emailVerified",
            key: "emailVerified",
            width: 80,
            render: (emailVerified: boolean) => (
                <Tag color={emailVerified ? "green" : "red"}>
                    {emailVerified ? "인증" : "미인증"}
                </Tag>
            ),
        },
        {
            title: "작업",
            key: "action",
            width: 80,
            render: (_: unknown, record: UserData) => (
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

    // 페이지네이션 처리된 데이터
    const paginatedData = filteredData.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize,
    );

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
                    총 {filteredData.length}명의 회원
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
                        style={{ width: 300 }}
                    />

                    <Button
                        type="primary"
                        icon={<FilterOutlined />}
                        onClick={() => message.info('필터 기능을 적용합니다.')}
                    >
                        필터 적용
                    </Button>
                </Space>
            </div>

            <Table
                columns={columns}
                dataSource={paginatedData}
                pagination={false}
                scroll={{ x: 1000 }}
                style={{ marginBottom: '24px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Pagination
                    current={currentPage}
                    onChange={setCurrentPage}
                    total={filteredData.length}
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
                destroyOnClose={true}
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
                    initialValues={{ status: "활동", role: "일반회원" }}
                    requiredMark={false}
                >
                    <div style={{ marginBottom: '16px' }}>
                        <Form.Item
                            name="id"
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
                            <Input
                                placeholder="홍길동"
                                readOnly={!!editingUser}
                                disabled={!!editingUser}
                            />
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
                        <Input
                            placeholder="example@skku.edu"
                            readOnly={!!editingUser}
                            disabled={!!editingUser}
                        />
                    </Form.Item>

                    {/* 기본 정보와 상세 정보 구분선 */}
                    {editingUser && (
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
                    )}

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

                    <div style={{ display: 'flex', gap: '16px' }}>
                        <Form.Item
                            name="status"
                            label="계정 상태"
                            style={{ flex: 1 }}
                            rules={[{ required: true, message: "상태를 선택해주세요!" }]}
                        >
                            <Select>
                                <Option value="ACTIVE">활성</Option>
                                <Option value="INACTIVE">비활성</Option>
                                <Option value="BLOCKED">차단</Option>
                                <Option value="UNVERIFIED">미인증</Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="emailVerified"
                            label="이메일 인증"
                            style={{ flex: 1 }}
                            valuePropName="checked"
                        >
                            <Checkbox>이메일 인증 완료</Checkbox>
                        </Form.Item>
                    </div>

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
                                    <Input value={editingUser.created} readOnly disabled />
                                </Form.Item>

                                <Form.Item label="수정일" style={{ flex: 1 }}>
                                    <Input value={editingUser.created} readOnly disabled />
                                </Form.Item>
                            </div>

                            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                                <Form.Item label="마지막 로그인" style={{ flex: 1 }}>
                                    <Input value={editingUser.lastLogin || '정보 없음'} readOnly disabled />
                                </Form.Item>

                                <Form.Item label="계정 ID" style={{ flex: 1 }}>
                                    <Input value={`USER_${editingUser.key}`} readOnly disabled />
                                </Form.Item>
                            </div>

                            <Form.Item label="이메일 인증 여부">
                                <Input
                                    value={editingUser.emailVerified ? '인증 완료' : '미인증'}
                                    readOnly
                                    disabled
                                />
                            </Form.Item>
                        </>
                    )}
                </Form>
            </Modal>
        </Card>
    );
};

export default UserManagement;
