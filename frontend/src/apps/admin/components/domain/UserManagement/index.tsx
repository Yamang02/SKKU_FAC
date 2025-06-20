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
} from "antd";
import {
    SearchOutlined,
    EditOutlined,
    PlusOutlined,
    FilterOutlined,
} from "@ant-design/icons";

const { Option } = Select;
const { Title, Text } = Typography;

interface UserData {
    key: string;
    id: string;
    name: string;
    email: string;
    role: string;
    department: string;
    status: string;
    created: string;
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

    const showModal = (user?: UserData) => {
        if (user) {
            setEditingUser(user);
            form.setFieldsValue({
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                department: user.department,
                status: user.status,
            });
        } else {
            setEditingUser(null);
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        form.resetFields();
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            if (editingUser) {
                // 사용자 수정
                const updatedUsers = userData.map((user) => {
                    if (user.key === editingUser.key) {
                        return { ...user, ...values };
                    }
                    return user;
                });
                setUserData(updatedUsers);
            } else {
                // 새 사용자 추가
                const newUser: UserData = {
                    key: (userData.length + 1).toString(),
                    ...values,
                    created: new Date()
                        .toLocaleDateString("en-US", {
                            month: "numeric",
                            day: "numeric",
                            year: "numeric",
                        })
                        .replace(/\//g, "/"),
                };
                setUserData([...userData, newUser]);
            }
            setIsModalVisible(false);
            form.resetFields();
        });
    };

    const columns = [
        {
            title: "아이디",
            dataIndex: "id",
            key: "id",
            width: 120,
        },
        {
            title: "역할",
            dataIndex: "role",
            key: "role",
            width: 150,
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
            title: "소속정보",
            dataIndex: "department",
            key: "department",
            width: 150,
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
            width: 80,
            render: (status: string) => (
                <Tag color={status === "활동" ? "green" : "red"}>
                    {status}
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
                        <Option value="활동">활동</Option>
                        <Option value="비활성">비활성</Option>
                    </Select>

                    <Select
                        placeholder="회원 역할"
                        style={{ width: 180 }}
                        value={roleFilter}
                        onChange={setRoleFilter}
                    >
                        <Option value="전체">전체 역할</Option>
                        <Option value="일반회원">일반회원</Option>
                        <Option value="일반회원 구독자">일반회원 구독자</Option>
                        <Option value="시스템관리자">시스템관리자</Option>
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
                    >
                        필터 적용
                    </Button>

                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => showModal()}
                        style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                    >
                        회원 추가
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
                title={editingUser ? "회원 정보 수정" : "새 회원 추가"}
                open={isModalVisible}
                onCancel={handleCancel}
                footer={[
                    <Button key="back" onClick={handleCancel}>
                        취소
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleOk}>
                        {editingUser ? "수정" : "추가"}
                    </Button>,
                ]}
            >
                <Form
                    form={form}
                    layout="vertical"
                    initialValues={{ status: "활동", role: "일반회원" }}
                >
                    <Form.Item
                        name="id"
                        label="아이디"
                        rules={[{ required: true, message: "아이디를 입력해주세요!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="name"
                        label="이름"
                        rules={[{ required: true, message: "이름을 입력해주세요!" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="email"
                        label="이메일"
                        rules={[
                            { required: true, message: "이메일을 입력해주세요!" },
                            { type: "email", message: "유효한 이메일 형식이 아닙니다!" },
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="역할"
                        rules={[{ required: true, message: "역할을 선택해주세요!" }]}
                    >
                        <Select>
                            <Option value="일반회원">일반회원</Option>
                            <Option value="일반회원 구독자">일반회원 구독자</Option>
                            <Option value="시스템관리자">시스템관리자</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="department" label="소속정보">
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="status"
                        label="상태"
                        rules={[{ required: true, message: "상태를 선택해주세요!" }]}
                    >
                        <Select>
                            <Option value="활동">활동</Option>
                            <Option value="비활성">비활성</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default UserManagement;
