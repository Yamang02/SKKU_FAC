# 📧 Gmail 이메일 설정 가이드

## ⚠️ 에러 해결: `Invalid login: 535-5.7.8 Username and Password not accepted`

이 에러는 Gmail 보안 정책으로 인해 발생합니다. 일반 비밀번호가 아닌 **앱 비밀번호**를 사용해야 합니다.

## 🔧 Gmail 앱 비밀번호 설정 방법

### 1단계: 2단계 인증 활성화
1. [Gmail 계정 설정](https://myaccount.google.com/) 접속
2. 보안 → 2단계 인증 → 시작하기
3. 휴대폰 번호로 2단계 인증 설정 완료

### 2단계: 앱 비밀번호 생성
1. [앱 비밀번호 페이지](https://myaccount.google.com/apppasswords) 접속
2. "앱 선택" → "기타(맞춤 이름)" 선택
3. "SKKU Gallery" 입력 후 "생성" 클릭
4. **16자리 앱 비밀번호** 복사 (공백 포함)

### 3단계: 환경변수 설정
`.env` 파일에 다음과 같이 설정:

```bash
# 이메일 설정 - 앱 비밀번호 사용!
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # 16자리 앱 비밀번호
EMAIL_FROM=your-gmail@gmail.com
ADMIN_EMAIL=admin@yourdomain.com
```

## 🔍 테스트 방법

### 환경변수 확인
```bash
# 현재 설정된 환경변수 확인
echo $EMAIL_USER
echo $EMAIL_PASS
echo $EMAIL_FROM
```

### 테스트 스크립트 실행
```bash
# 이메일 전송 테스트
node -e "
import { sendVerificationEmail } from './src/common/utils/emailSender.js';
await sendVerificationEmail('test@example.com', 'test-token');
console.log('이메일 전송 성공!');
"
```

## 🚫 문제 해결

### 문제 1: "Less secure app access" 에러
- **해결**: 앱 비밀번호 사용 (위 가이드 따라 설정)

### 문제 2: "Application-specific password required"
- **해결**: 2단계 인증 활성화 후 앱 비밀번호 생성

### 문제 3: 환경변수가 undefined
- **해결**: `.env` 파일이 프로젝트 루트에 있는지 확인
- **확인**: `dotenv` 패키지가 제대로 로드되는지 확인

### 문제 4: 이메일이 스팸함으로 이동
- **해결**: Gmail → 설정 → 필터 및 차단된 주소 → 화이트리스트 추가

## 📝 올바른 .env 파일 예시

```bash
# 기본 설정
NODE_ENV=development
PORT=3000

# 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_NAME=skku_gallery
DB_USER=root
DB_PASS=your_password

# JWT 설정
JWT_SECRET=your-jwt-secret-at-least-32-characters-long
JWT_REFRESH_SECRET=your-refresh-secret-at-least-32-characters-long

# 세션 설정
SESSION_SECRET=your-session-secret-at-least-32-characters-long

# ⭐ 이메일 설정 (중요!)
EMAIL_USER=skkfnrtclbdmnstrtn@gmail.com
EMAIL_PASS=abcd efgh ijkl mnop  # 16자리 앱 비밀번호
EMAIL_FROM=skkfnrtclbdmnstrtn@gmail.com
ADMIN_EMAIL=admin@skku.edu

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 🔗 추가 참고 자료

- [Gmail 앱 비밀번호 도움말](https://support.google.com/accounts/answer/185833)
- [Nodemailer Gmail 설정](https://nodemailer.com/usage/using-gmail/)
- [Railway 환경변수 설정](https://docs.railway.app/deploy/variables)
