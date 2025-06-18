class SessionUtil {
    static async saveUserToSession(req, user) {
        return new Promise((resolve, reject) => {
            // 세션 데이터 설정
            req.session.user = {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role,
                status: user.status,
                isActive: user.status === 'ACTIVE',
                isAdmin: user.role === 'ADMIN'
            };

            // 세션 저장
            req.session.save((err) => {
                if (err) {
                    console.error('세션 저장 실패:', err);
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }

    static destroySession(req) {
        return new Promise(resolve => {
            req.session.user = null;
            req.session.save(err => {
                if (err) {
                    console.error('세션 저장 중 오류:', err);
                }
                resolve();
            });
        });
    }
}

export default SessionUtil;
