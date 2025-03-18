import bcrypt from 'bcrypt';

// 비밀번호 해시 생성
const hashedPassword = bcrypt.hashSync('1234', 10);

const user = [
    {
        id: 1,
        studentId: '2020123456',
        password: hashedPassword,
        name: '홍길동',
        email: 'hong@skku.edu',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        id: 2,
        studentId: '2021123456',
        password: hashedPassword,
        name: '김철수',
        email: 'kim@skku.edu',
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
    }
];

export default user;
