# QR + GPS 기반 금형관리시스템 Ver.09

## 📚 프로젝트 문서

### 📋 개요 및 계획
1. **[PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md)** - 프로젝트 전체 개요
   - 핵심 목표 및 주요 기능
   - 사용자 역할 구조
   - 기술 스택 (Apple Design System 포함)
   - UI/UX 디자인 가이드
   - 4주 개발 일정

2. **[WEEK1_PLAN.md](./WEEK1_PLAN.md)** - Week 1: 기반 구축 및 인증 시스템
   - 데이터베이스 설정
   - 백엔드 API 구조
   - JWT 인증 시스템

3. **[WEEK2_PLAN.md](./WEEK2_PLAN.md)** - Week 2: 협력사/제작처 핵심 기능
   - QR 스캔 시스템
   - 일상점검 + 생산수량 입력
   - 점검 관리

4. **[WEEK3_PLAN.md](./WEEK3_PLAN.md)** - Week 3: 반출/입고 및 수리 관리
   - 이관 관리
   - 수리 관리
   - 금형 폐기

5. **[WEEK4_PLAN.md](./WEEK4_PLAN.md)** - Week 4: UI/UX 완성 및 배포
   - Apple Design System 구현
   - 모바일 최적화
   - 성능 최적화
   - 배포 준비

---

### 🗄️ 기술 문서

6. **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - 데이터베이스 스키마
   - 총 41개 테이블, 10개 카테고리
   - 상세 SQL 스키마 정의
   - 인덱스 및 관계 설정

7. **[SYSTEM_SPECIFICATIONS.md](./SYSTEM_SPECIFICATIONS.md)** - 시스템 사양
   - 금형 상태 코드 및 전환 규칙
   - 긴급도 기준 및 대응 시간
   - 점검 주기 및 상세 항목
   - 알림 시스템 발송 규칙

8. **[DATA_FLOW_ARCHITECTURE.md](./DATA_FLOW_ARCHITECTURE.md)** - 데이터 흐름 아키텍처
   - 본사 → 제작처 → 마스터 → 생산처 자동 연동
   - 외부 시스템 연동 구조
   - 단계 변경 관리 (개발 ↔ 양산)

---

### 📖 운영 가이드

9. **[INSPECTION_SCHEDULE_GUIDE.md](./INSPECTION_SCHEDULE_GUIDE.md)** - 점검 스케줄 가이드
   - 생산수량 기반 점검 관리
   - QR 스캔 알람 시스템
   - 자동 연동 프로세스

10. **[ADMIN_MODIFICATION_GUIDE.md](./ADMIN_MODIFICATION_GUIDE.md)** - 관리자 수정 가이드
    - 협력사 데이터 수정 이력 관리
    - 다단계 승인 프로세스
    - 자동 배포 시스템

11. **[PRODUCTION_QUANTITY_WORKFLOW.md](./PRODUCTION_QUANTITY_WORKFLOW.md)** - 생산수량 연동
    - 일상점검 시 생산수량 입력
    - 자동 연동 (점검 스케줄, 타수, 알람)
    - 데이터 흐름도

---

### 🎨 디자인 시스템

12. **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Apple Design System 가이드
    - 컬러 시스템 (Primary, Neutral, Accent)
    - 타이포그래피 (SF Pro Text fallback)
    - 애니메이션 (fade-in, slide-up, scale-in, pulse)
    - 그림자 효과 (shadow-apple)
    - Border Radius (2xl, 3xl)
    - 반응형 디자인
    - 다크 모드 지원
    - 컴포넌트 스타일 가이드

13. **[UI_UX_SPECIFICATIONS.md](./UI_UX_SPECIFICATIONS.md)** - UI/UX 상세 명세서
    - 로그인 화면 구조 및 디자인
    - QR 코드 스캔 페이지
    - 상태별 UI (기본/포커스/호버/에러/로딩)
    - 애니메이션 상세
    - 반응형 디자인 (데스크톱/태블릿/모바일)
    - 보안 기능 및 API 연동
    - 접근성 (Accessibility) 가이드

14. **[ADMIN_DASHBOARD_GUIDE.md](./ADMIN_DASHBOARD_GUIDE.md)** - 관리자 대시보드 가이드
    - 시스템 전체 관리
    - GPS 금형 위치 추적 맵
    - 마커 클러스터링 및 실시간 업데이트
    - 통계 대시보드 및 활동 피드
    - 사용자 관리 및 권한 설정
    - 시스템 상태 모니터링

15. **[HQ_DASHBOARD_GUIDE.md](./HQ_DASHBOARD_GUIDE.md)** - 본사 담당자 대시보드 가이드
    - 협력사 관리 및 평가 시스템
    - 협력사별 금형 위치 추적
    - 관리 표준 마스터 (점검/체크리스트/문서)
    - 표준 배포 및 버전 관리
    - 승인 및 검토 기능
    - 협력사별 성과 분석

---

## 🎯 핵심 기능

### 1. QR + GPS 기반 현장 작업
- QR 코드 스캔으로 빠른 접근
- GPS 위치 자동 기록 (50m 오차 이내)
- 8시간 세션 유지

### 2. 생산수량 기반 점검 관리
- 일상점검 시 생산수량 필수 입력
- 자동 누적 계산
- 점검 스케줄 자동 업데이트
- 타수 기록 자동 업데이트
- 알람 자동 생성

### 3. 관리자 수정 및 자동 배포
- 협력사 데이터 수정 이력 관리
- 다단계 승인 프로세스
- 승인 후 자동 배포
- 롤백 기능

### 4. 실시간 알람 시스템
- QR 스캔 시 즉시 알람 표시
- 우선순위별 차별화 (Urgent, High, Medium, Low)
- 점검 예정, 점검 지연, 생산 목표 달성
- 긴급 수리, 타수 임계치, 상태 경고

---

## 🏗️ 기술 스택

### Frontend
- React 18 + Vite
- Tailwind CSS + Apple Design System
- Lucide React (아이콘)
- React Query + Context API
- React Router v6

### Backend
- Node.js 18+ + Express.js
- Sequelize ORM
- PostgreSQL 14+
- JWT 인증
- Multer (파일 업로드)

### DevOps
- Docker + Docker Compose
- GitHub Actions (CI/CD)
- Nginx (리버스 프록시)

---

## 🎨 Apple Design System

### 컬러
- **Primary**: #0ea5e9 (Sky Blue, 50~900)
- **Neutral**: #737373 (Gray, 50~900)
- **Accent**: Orange (#ff9500), Green (#30d158), Red (#ff3b30)

### 타이포그래피
- SF Pro Text fallback
- 폰트 크기: xs (12px) ~ 4xl (36px)
- 폰트 굵기: Light (300) ~ Bold (700)

### 애니메이션
- fade-in (200ms)
- slide-up (200ms)
- scale-in (200ms)
- pulse (2s)

### 그림자
- shadow-apple
- shadow-apple-lg

### Border Radius
- 2xl: 1rem (16px)
- 3xl: 1.5rem (24px)

---

## 📊 데이터베이스 구조

**총 50개 테이블, 10개 카테고리**

1. **사용자 및 권한** (2개)
2. **데이터 흐름 및 자동 연동** (4개) - 본사→제작처→마스터→생산처
3. **금형정보 관리** (13개)
4. **사출정보 관리** (5개)
5. **점검 관리** (6개)
6. **수리 관리** (3개)
7. **이관 관리** (4개)
8. **금형 폐기 관리** (3개)
9. **관리자 수정 및 배포 관리** (6개)
10. **기타** (4개)

---

## 📅 개발 일정

### Week 1 (7일): 기반 구축
- 데이터베이스 설정
- 백엔드 API 구조
- JWT 인증 시스템

### Week 2 (7일): 핵심 기능
- QR 스캔 시스템
- 일상점검 + 생산수량 입력
- 점검 관리

### Week 3 (7일): 확장 기능
- 이관 관리
- 수리 관리
- 금형 폐기

### Week 4 (7일): UI/UX 및 배포
- Apple Design System 구현
- 모바일 최적화
- 성능 최적화
- 배포 준비

---

## 🚀 시작하기

### 1. 문서 읽기
프로젝트를 시작하기 전에 다음 문서를 순서대로 읽어주세요:

1. [PROJECT_OVERVIEW.md](./PROJECT_OVERVIEW.md) - 전체 개요 파악
2. [DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md) - 데이터 구조 이해
3. [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) - UI/UX 가이드 확인
4. [WEEK1_PLAN.md](./WEEK1_PLAN.md) - 개발 시작

### 2. 환경 설정
```bash
# Node.js 18+ 설치
# PostgreSQL 14+ 설치
# Git 설치
```

### 3. 프로젝트 초기화
```bash
# 저장소 클론
git clone [repository-url]

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env

# 데이터베이스 마이그레이션
npm run migrate

# 개발 서버 실행
npm run dev
```

---

## 📖 문서 활용 가이드

### 개발자용
1. **PROJECT_OVERVIEW.md** - 프로젝트 전체 이해
2. **DATABASE_SCHEMA.md** - 데이터베이스 스키마 참조
3. **WEEK1~4_PLAN.md** - 개발 일정 및 작업 내용
4. **DESIGN_SYSTEM.md** - UI 컴포넌트 개발 시 참조

### 기획자/디자이너용
1. **PROJECT_OVERVIEW.md** - 기능 및 사용자 역할 이해
2. **DESIGN_SYSTEM.md** - 디자인 가이드라인
3. **INSPECTION_SCHEDULE_GUIDE.md** - 점검 프로세스 이해
4. **PRODUCTION_QUANTITY_WORKFLOW.md** - 생산수량 연동 흐름

### 관리자용
1. **SYSTEM_SPECIFICATIONS.md** - 시스템 운영 규칙
2. **ADMIN_MODIFICATION_GUIDE.md** - 데이터 수정 및 배포
3. **INSPECTION_SCHEDULE_GUIDE.md** - 점검 스케줄 관리

---

## 📞 문의 및 지원

프로젝트 관련 문의사항은 문서를 먼저 확인해주세요.

---

## 📝 라이선스

이 프로젝트는 내부 사용을 위한 것입니다.

---

**마지막 업데이트**: 2024-01-18
**버전**: Ver.09
**문서 개수**: 15개
**테이블 개수**: 50개
