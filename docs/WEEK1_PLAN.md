# Week 1: 기반 구축 및 인증 시스템
**기간**: 1주차 (Day 1-5)  
**목표**: 프로젝트 초기 설정, DB 스키마, 인증/권한, 본사 금형 등록

---

## 📋 주요 목표

1. ✅ 프로젝트 초기 설정 (Frontend + Backend)
2. ✅ Railway PostgreSQL DB 연결
3. ✅ Sequelize 모델 및 마이그레이션 작성
4. ✅ JWT 인증 시스템 구축
5. ✅ 역할 기반 권한 미들웨어
6. ✅ 본사 금형 1차 등록 기능

---

## Day 1: 프로젝트 초기 설정

### Frontend 설정
```bash
npm create vite@latest client -- --template react
cd client
npm install
npm install -D tailwindcss postcss autoprefixer
npm install react-router-dom axios lucide-react
npm install @radix-ui/react-dialog @radix-ui/react-select
```

### Backend 설정
```bash
mkdir server && cd server
npm init -y
npm install express sequelize pg pg-hstore
npm install jsonwebtoken bcryptjs cors dotenv
npm install -D nodemon sequelize-cli
```

### 디렉토리 구조 생성
```
/client
  /src
    /components
    /pages
    /layouts
    /hooks
    /utils
    /api
/server
  /models
  /routes
  /middleware
  /migrations
  /controllers
  /config
```

### 환경 변수 설정
- `server/.env` 생성
- Railway PostgreSQL URL 설정
- JWT_SECRET, QR_SESSION_SECRET 생성

**완료 기준**: `npm run dev` 실행 시 Frontend/Backend 정상 구동

---

## Day 2: 데이터베이스 설계 및 마이그레이션

### 핵심 테이블 설계

#### 1. users (사용자)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  role_group VARCHAR(20) NOT NULL, -- 'hq', 'plant', 'maker'
  role_detail VARCHAR(50),
  plant_id INTEGER,
  maker_id INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 2. molds (금형 마스터)
```sql
CREATE TABLE molds (
  id SERIAL PRIMARY KEY,
  mold_code VARCHAR(50) UNIQUE NOT NULL,
  mold_name VARCHAR(200) NOT NULL,
  car_model VARCHAR(100),
  cavity INTEGER,
  plant_id INTEGER NOT NULL,
  maker_id INTEGER NOT NULL,
  qr_token VARCHAR(255) UNIQUE,
  sop_date DATE,
  target_shots INTEGER,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. qr_sessions (QR 세션)
```sql
CREATE TABLE qr_sessions (
  id SERIAL PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL,
  mold_id INTEGER NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Sequelize 마이그레이션 생성
```bash
npx sequelize-cli migration:generate --name create-users
npx sequelize-cli migration:generate --name create-molds
npx sequelize-cli migration:generate --name create-qr-sessions
```

### 마이그레이션 실행
```bash
npx sequelize-cli db:migrate
```

**완료 기준**: Railway DB에 테이블 생성 완료

---

## Day 3: 인증 시스템 구축

### JWT 인증 구현

#### 1. 로그인 API
**Endpoint**: `POST /api/auth/login`

**Request**:
```json
{
  "username": "plant_user01",
  "password": "password123"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "plant_user01",
    "name": "협력사A",
    "role_group": "plant",
    "plant_id": 1
  }
}
```

#### 2. 인증 미들웨어
**파일**: `server/middleware/auth.js`

```javascript
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

**완료 기준**: 로그인 후 JWT 토큰 발급 및 검증 성공

---

## Day 4: 역할 기반 권한 미들웨어

### 권한 검증 미들웨어
**파일**: `server/middleware/checkPermission.js`

```javascript
const checkMoldPermission = async (req, res, next) => {
  const { moldId } = req.params;
  const user = req.user;
  
  const mold = await Mold.findByPk(moldId);
  
  if (!mold) {
    return res.status(404).json({ error: 'Mold not found' });
  }
  
  // 본사는 모든 금형 접근 가능
  if (user.role_group === 'hq') {
    req.mold = mold;
    return next();
  }
  
  // 협력사는 자사 금형만
  if (user.role_group === 'plant') {
    if (mold.plant_id !== user.plant_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  // 제작처는 자사 금형만
  if (user.role_group === 'maker') {
    if (mold.maker_id !== user.maker_id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  
  req.mold = mold;
  next();
};

module.exports = { checkMoldPermission };
```

### API 라우트 적용
```javascript
router.get('/api/plant/molds/:moldId', 
  authMiddleware, 
  checkMoldPermission, 
  getMoldDetail
);
```

**완료 기준**: 권한 없는 사용자의 금형 접근 차단 (403)

---

## Day 5: 본사 금형 1차 등록 기능

### 금형 등록 API
**Endpoint**: `POST /api/hq/molds`

**Request**:
```json
{
  "mold_code": "M-2024-001",
  "mold_name": "프론트 범퍼 금형",
  "car_model": "K5 DL3",
  "cavity": 2,
  "plant_id": 1,
  "maker_id": 1,
  "sop_date": "2024-03-01",
  "target_shots": 500000
}
```

**자동 생성 항목**:
- QR 토큰 (UUID)
- QR URL (`https://app.com/qr/{token}`)
- 점검 스케줄 (1차/2차/3차)
- shots 레코드 (count_total=0)
- plant_info / maker_info 기본 레코드

### 금형 등록 Controller
**파일**: `server/controllers/moldController.js`

```javascript
const { v4: uuidv4 } = require('uuid');

const createMold = async (req, res) => {
  const { mold_code, mold_name, car_model, cavity, plant_id, maker_id, sop_date, target_shots } = req.body;
  
  // QR 토큰 생성
  const qr_token = uuidv4();
  
  const mold = await Mold.create({
    mold_code,
    mold_name,
    car_model,
    cavity,
    plant_id,
    maker_id,
    qr_token,
    sop_date,
    target_shots,
    status: 'active'
  });
  
  // 타수 레코드 생성
  await Shot.create({
    mold_id: mold.id,
    count_total: 0
  });
  
  // 기본 정보 레코드 생성
  await PlantInfo.create({ mold_id: mold.id });
  await MakerInfo.create({ mold_id: mold.id });
  
  res.status(201).json({
    mold,
    qr_url: `${process.env.CLIENT_URL}/qr/${qr_token}`
  });
};
```

**완료 기준**: 본사에서 금형 등록 시 QR 토큰 및 관련 레코드 자동 생성

---

## 🎯 Week 1 완료 체크리스트

- [ ] Frontend/Backend 프로젝트 초기 설정 완료
- [ ] Railway PostgreSQL 연결 성공
- [ ] users, molds, qr_sessions 테이블 생성
- [ ] 로그인 API 구현 및 JWT 발급
- [ ] 인증 미들웨어 구현
- [ ] 역할 기반 권한 미들웨어 구현
- [ ] 본사 금형 등록 API 구현
- [ ] QR 토큰 자동 생성 확인
- [ ] Git 커밋 및 푸시

---

## 📊 Week 1 산출물

1. **코드**
   - Frontend 기본 구조
   - Backend API 서버
   - 인증/권한 미들웨어
   - 금형 등록 API

2. **DB**
   - users, molds, qr_sessions 테이블
   - 마이그레이션 파일

3. **문서**
   - API 명세서 초안
   - DB 스키마 문서

---

## 다음 주 준비사항

- Week 2에서는 협력사/제작처 대시보드 및 QR 로그인 구현
- 점검 시스템 (daily_checks, inspections) 테이블 설계 필요
