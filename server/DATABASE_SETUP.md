# 데이터베이스 설정 가이드

## 📋 목차

1. [환경 변수 설정](#환경-변수-설정)
2. [데이터베이스 동기화](#데이터베이스-동기화)
3. [시드 데이터 생성](#시드-데이터-생성)
4. [테스트 계정](#테스트-계정)

---

## 환경 변수 설정

`.env` 파일을 생성하고 다음 변수를 설정하세요:

```env
# 데이터베이스
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=8h
JWT_REFRESH_EXPIRES_IN=7d

# 서버
NODE_ENV=development
PORT=3001
CORS_ORIGIN=http://localhost:3000

# 파일 업로드
MAX_FILE_SIZE=10485760

# GPS
GPS_ACCURACY_THRESHOLD=50
```

---

## 데이터베이스 동기화

### 로컬 환경

```bash
# 테이블 생성 (기존 테이블 삭제 후 재생성)
npm run db:sync
```

### Railway 환경

Railway에서는 자동으로 테이블이 생성됩니다. 수동으로 실행하려면:

```bash
# Railway CLI 사용
railway run npm run db:sync
```

---

## 시드 데이터 생성

### 로컬 환경

```bash
# 시드 데이터 생성
npm run db:seed

# 또는 전체 리셋 (동기화 + 시드)
npm run db:reset
```

### 생성되는 데이터

#### 1. 공장 (Plants)
- 본사 (HQ-001)
- 평택공장 (PT-001)
- 아산공장 (AS-001)

#### 2. 협력사 (Partners)
- A협력사 (PTN-001)
- B협력사 (PTN-002)

#### 3. 제조사 (Manufacturers)
- 대한금형 (MFG-001)
- 글로벌몰드 (MFG-002)

#### 4. 사용자 (Users)
- 시스템관리자 (admin)
- 본사담당자 (hq_manager)
- A협력사관리자 (partner_admin)
- 작업자1 (worker1)

#### 5. 금형 (Molds)
- 도어패널 금형 (MD-2024-001)
- 범퍼 금형 (MD-2024-002)
- 사이드미러 금형 (MD-2024-003)

---

## 테스트 계정

모든 계정의 비밀번호는 `password123`입니다.

### 본사 관리자
```
Username: admin
Password: password123
Role: hq_admin
```

### 본사 담당자
```
Username: hq_manager
Password: password123
Role: hq_manager
```

### 협력사 관리자
```
Username: partner_admin
Password: password123
Role: partner_admin
```

### 작업자
```
Username: worker1
Password: password123
Role: worker
```

---

## 데이터베이스 스키마

### 주요 테이블

1. **users** - 사용자
2. **plants** - 공장
3. **partners** - 협력사
4. **manufacturers** - 제조사
5. **molds** - 금형
6. **qr_sessions** - QR 스캔 세션
7. **daily_checks** - 일일 점검
8. **regular_inspections** - 정기 점검

---

## API 테스트

### 로그인

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "password123"
  }'
```

### 현재 사용자 정보

```bash
curl http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 문제 해결

### 테이블이 생성되지 않음

```bash
# 강제로 테이블 재생성
NODE_ENV=development npm run db:sync
```

### 시드 데이터 중복 오류

```bash
# 데이터베이스 초기화 후 재시도
npm run db:reset
```

### Railway 배포 시 자동 실행

Railway에서는 서버 시작 시 자동으로 테이블이 생성됩니다.
시드 데이터는 수동으로 실행해야 합니다:

```bash
railway run npm run db:seed
```

---

## 주의사항

⚠️ **프로덕션 환경에서는 `db:sync`를 실행하지 마세요!**

프로덕션에서는 마이그레이션 도구를 사용하세요:
- Sequelize CLI
- 또는 수동 SQL 스크립트

⚠️ **시드 데이터는 개발/테스트 환경에서만 사용하세요!**
