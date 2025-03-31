class SessionUtil {
    static async saveUserToSession(req, user) {
        return new Promise((resolve, reject) => {
            // 세션 데이터 설정
            req.session.user = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                isAdmin: user.role === 'ADMIN',
                department: user.department || '',
                studentYear: user.studentYear || '',
                affiliation: user.affiliation || ''
            };

            // 세션 저장
            req.session.save((err) => {
                if (err) {
                    console.error('세션 저장 중 오류:', err);
                    reject(err);
                } else {
                    console.log('세션 저장 완료:', req.session.user);
                    resolve();
                }
            });
        });
    }

    static destroySession(req) {
        return new Promise((resolve) => {
            req.session.destroy((err) => {
                if (err) {
                    console.error('로그아웃 중 오류:', err);
                }
                resolve();
            });
        });
    }
}

export default SessionUtil;
