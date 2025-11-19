# 금형관리 전산시스템 Ver.09 - 개발 가이드

**Creative Auto Module System**

## 🚀 프로젝트 구조

```
Ver 04/
├── client/                 # React 프론트엔드
│   ├── src/
│   │   ├── components/    # 컴포넌트
│   │   ├── pages/         # 페이지
│   │   ├── styles/        # 스타일
│   │   └── config/        # 설정
│   └── package.json
├── server/                 # Node.js 백엔드
│   ├── src/
│   │   ├── routes/        # API 라우트
│   │   ├── models/        # 데이터베이스 모델
│   │   ├── middleware/    # 미들웨어
│   │   └── config/        # 설정
│   └── package.json
├── docs/                   # 문서
└── README_DEV.md
```

## 📦 기술 스택

### Frontend
- React 18
- TypeScript
- TailwindCSS
- React Router
- Lucide Icons

### Backend
- Node.js
- Express
- PostgreSQL
- Sequelize ORM
- JWT Authentication

### Deployment
- Railway (PostgreSQL + Backend + Frontend)

## 🛠️ 개발 환경 설정

### 1. 의존성 설치

```bash
# 클라이언트
cd client
npm install

# 서버
cd ../server
npm install
```

### 2. 환경 변수 설정

#### server/.env
```env
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=8h

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:5173
```

#### client/.env
```env
VITE_API_URL=http://localhost:3001
```

### 3. 데이터베이스 마이그레이션

```bash
cd server
npm run db:sync
npm run db:seed
```

### 4. 개발 서버 실행

```bash
# 터미널 1: 백엔드
cd server
npm run dev

# 터미널 2: 프론트엔드
cd client
npm run dev
```

## 🚂 Railway 배포

### 1. Railway CLI 설치

```bash
npm install -g @railway/cli
```

### 2. Railway 로그인

```bash
railway login
```

### 3. 프로젝트 초기화

```bash
railway init
```

### 4. PostgreSQL 추가

```bash
railway add
# PostgreSQL 선택
```

### 5. 환경 변수 설정

```bash
railway variables set JWT_SECRET=your-secret-key
railway variables set NODE_ENV=production
```

### 6. 배포

```bash
railway up
```

## 📝 Git 커밋 컨벤션

### 커밋 메시지 형식

```
<type>: <subject>

<body>
```

### Type 종류

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 수정
- `style`: 코드 포맷팅, 세미콜론 누락 등
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가
- `chore`: 빌드 업무 수정, 패키지 매니저 수정

### 예시

```bash
git commit -m "feat: 로그인 페이지 UI 구현"
git commit -m "fix: QR 스캔 오류 수정"
git commit -m "docs: README 업데이트"
```

## 🔄 개발 단계

### Phase 1: 기반 구축 (Week 1)
- [x] 프로젝트 구조 설정
- [ ] 데이터베이스 스키마 구현
- [ ] 인증 시스템 구현
- [ ] 기본 API 구조

### Phase 2: 핵심 기능 (Week 2)
- [ ] QR 코드 스캔 기능
- [ ] GPS 위치 추적
- [ ] 금형 관리 CRUD
- [ ] 점검 시스템

### Phase 3: 협력사 기능 (Week 3)
- [ ] 일상점검
- [ ] 정기점검
- [ ] 수리 요청
- [ ] 이관 관리

### Phase 4: 관리자 기능 (Week 4)
- [ ] 관리자 대시보드
- [ ] 담당자 대시보드
- [ ] 승인 시스템
- [ ] 통계 및 리포트

## 📊 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보

### QR 세션
- `POST /api/qr-sessions` - QR 스캔 세션 생성
- `GET /api/qr-sessions/:id` - 세션 정보 조회

### 금형 관리
- `GET /api/molds` - 금형 목록
- `GET /api/molds/:id` - 금형 상세
- `POST /api/molds` - 금형 등록
- `PUT /api/molds/:id` - 금형 수정
- `DELETE /api/molds/:id` - 금형 삭제

### 점검
- `POST /api/daily-checks` - 일상점검 등록
- `GET /api/daily-checks` - 일상점검 목록
- `POST /api/inspections` - 정기점검 등록
- `GET /api/inspections` - 정기점검 목록

## 🧪 테스트

```bash
# 단위 테스트
npm test

# E2E 테스트
npm run test:e2e

# 커버리지
npm run test:coverage
```

## 📚 참고 문서

- [DATABASE_SCHEMA.md](./docs/DATABASE_SCHEMA.md) - 데이터베이스 스키마
- [API_DOCUMENTATION.md](./docs/API_DOCUMENTATION.md) - API 문서
- [UI_UX_SPECIFICATIONS.md](./docs/UI_UX_SPECIFICATIONS.md) - UI/UX 명세
- [ADMIN_DASHBOARD_GUIDE.md](./docs/ADMIN_DASHBOARD_GUIDE.md) - 관리자 가이드

## 🤝 기여 가이드

1. Feature 브랜치 생성
2. 변경사항 커밋
3. Push to branch
4. Pull Request 생성

## 📄 라이선스

이 프로젝트는 내부 사용을 위한 것입니다.

---

**마지막 업데이트**: 2024-01-18
**버전**: Ver.09
