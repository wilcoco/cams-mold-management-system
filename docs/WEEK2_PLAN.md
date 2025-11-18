# Week 2: 협력사/제작처 핵심 기능
**기간**: 2주차 (Day 6-10)  
**목표**: 협력사/제작처 대시보드, QR 로그인, 점검 시스템

---

## 📋 주요 목표

1. ✅ 협력사 대시보드 UI 및 API
2. ✅ 제작처 대시보드 UI 및 API
3. ✅ QR 로그인 및 세션 관리
4. ✅ 일상점검 시스템
5. ✅ 정기점검 시스템
6. ✅ 타수 관리 기능

---

## Day 6: 협력사 대시보드 UI

### 협력사 대시보드 레이아웃
**파일**: `client/src/pages/PlantDashboard.jsx`

#### 주요 섹션
1. **금형 요약 카드**
   - 금형코드, 금형명
   - 라인/사출기 정보
   - 현재 타수 / 목표 타수
   - 상태 (정상/점검필요/수리중)

2. **금형 이미지 갤러리**
   - 설치 이미지
   - 생산 이미지
   - 최근 점검 이미지

3. **금형관리 알림**
   - 온도 이상
   - 압력 이상
   - 점검 예정
   - 수리 진행상황

4. **금형점검 바로가기**
   - 일상점검
   - 정기점검
   - 습합점검
   - 세척점검

5. **사출조건 관리** (협력사 전용 수정 가능)
   - 온도, 압력, 속도 등
   - 조건 변경 이력

6. **금형사양** (읽기 전용)
   - 제작처 입력 데이터
   - 재질, 중량, 치수 등

7. **수리 진행현황** (읽기 전용)
   - 수리 요청 목록
   - 진행 상태 타임라인

### Tailwind 스타일 가이드
```jsx
// 카드 컴포넌트
<div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
  <h3 className="text-lg font-bold text-gray-800 mb-4">금형 요약</h3>
  {/* 내용 */}
</div>

// 버튼
<button className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition">
  일상점검 시작
</button>
```

**완료 기준**: 협력사 대시보드 UI 렌더링 성공

---

## Day 7: 제작처 대시보드 UI

### 제작처 대시보드 레이아웃
**파일**: `client/src/pages/MakerDashboard.jsx`

#### 주요 섹션
1. **금형 요약 카드**
   - 금형코드, 금형명
   - 최근 수리일
   - 책임자 정보
   - 수리 진행 상태

2. **금형 이미지 갤러리**
   - 고장 이미지
   - 정비 이미지
   - 수리 완료 이미지

3. **금형수리 알림**
   - 신규 수리요청
   - 반출 승인 대기
   - 수리 완료 알림

4. **수리 작업 목록**
   - 요청 (Requested)
   - 진행중 (In Progress)
   - 완료 (Completed)

5. **금형사양 관리** (제작처 전용 수정 가능)
   - 재질, 중량, 치수
   - 설계 정보
   - 변경 이력

6. **사출조건** (읽기 전용)
   - 협력사 입력 데이터

7. **반출/입고 관리**
   - 반출 승인
   - 입고 요청

8. **협력사 소통**
   - 댓글/메모 기능

**완료 기준**: 제작처 대시보드 UI 렌더링 성공

---

## Day 8: 협력사/제작처 API 구현

### 협력사 API

#### 1. 자사 금형 목록 조회
**Endpoint**: `GET /api/plant/molds`

**Query Params**:
- `status`: active, repair, idle
- `search`: 금형코드/명칭 검색

**Response**:
```json
{
  "molds": [
    {
      "id": 1,
      "mold_code": "M-2024-001",
      "mold_name": "프론트 범퍼 금형",
      "status": "active",
      "current_shots": 125000,
      "target_shots": 500000,
      "plant_id": 1,
      "maker_id": 1
    }
  ]
}
```

**권한 검증**:
```javascript
const molds = await Mold.findAll({
  where: { plant_id: req.user.plant_id }
});
```

#### 2. 금형 상세 조회
**Endpoint**: `GET /api/plant/molds/:moldId`

**Response**:
```json
{
  "mold": { /* 금형 정보 */ },
  "plant_info": { /* 사출조건 */ },
  "maker_info": { /* 금형사양 */ },
  "recent_checks": [ /* 최근 점검 */ ],
  "repairs": [ /* 수리 내역 */ ]
}
```

### 제작처 API

#### 1. 자사 금형 목록 조회
**Endpoint**: `GET /api/maker/molds`

**권한 검증**:
```javascript
const molds = await Mold.findAll({
  where: { maker_id: req.user.maker_id }
});
```

#### 2. 수리 요청 목록
**Endpoint**: `GET /api/maker/repairs`

**Response**:
```json
{
  "repairs": [
    {
      "id": 1,
      "mold_id": 1,
      "status": "requested",
      "issue_description": "캐비티 손상",
      "requested_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

**완료 기준**: 협력사/제작처 API 테스트 성공

---

## Day 9: QR 로그인 및 세션 관리

### QR 접근 흐름

#### 1. QR 스캔 페이지
**URL**: `/qr/:token`  
**파일**: `client/src/pages/QRLogin.jsx`

```jsx
const QRLogin = () => {
  const { token } = useParams();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  const handleLogin = async () => {
    const response = await axios.post('/api/qr/login', {
      qr_token: token,
      username,
      password
    });
    
    // QR 세션 토큰 저장
    localStorage.setItem('qr_session', response.data.session_token);
    
    // 역할별 모바일 레이아웃으로 이동
    if (response.data.user.role_group === 'plant') {
      navigate(`/qr/plant/${token}`);
    } else if (response.data.user.role_group === 'maker') {
      navigate(`/qr/maker/${token}`);
    }
  };
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">QR 로그인</h1>
      <input 
        type="text" 
        placeholder="아이디"
        className="w-full p-3 border rounded-lg mb-4"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <input 
        type="password" 
        placeholder="비밀번호"
        className="w-full p-3 border rounded-lg mb-4"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button 
        onClick={handleLogin}
        className="w-full py-4 bg-blue-600 text-white font-bold rounded-xl"
      >
        로그인
      </button>
    </div>
  );
};
```

#### 2. QR 로그인 API
**Endpoint**: `POST /api/qr/login`

**Request**:
```json
{
  "qr_token": "abc-123-def",
  "username": "plant_user01",
  "password": "password123"
}
```

**Response**:
```json
{
  "session_token": "qr_session_xyz",
  "user": {
    "id": 1,
    "role_group": "plant",
    "plant_id": 1
  },
  "mold": {
    "id": 1,
    "mold_code": "M-2024-001"
  }
}
```

**권한 검증**:
```javascript
// QR 토큰으로 금형 조회
const mold = await Mold.findOne({ where: { qr_token } });

// 사용자 인증
const user = await User.findOne({ where: { username } });
const isValid = await bcrypt.compare(password, user.password_hash);

// 권한 확인
if (user.role_group === 'plant' && mold.plant_id !== user.plant_id) {
  return res.status(403).json({ error: 'Access denied' });
}

if (user.role_group === 'maker' && mold.maker_id !== user.maker_id) {
  return res.status(403).json({ error: 'Access denied' });
}

// QR 세션 생성
const session_token = uuidv4();
await QRSession.create({
  session_token,
  user_id: user.id,
  mold_id: mold.id,
  expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000) // 8시간
});
```

**완료 기준**: QR 스캔 → 로그인 → 세션 생성 성공

---

## Day 10: 점검 시스템 구현

### 일상점검 테이블
```sql
CREATE TABLE daily_checks (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  check_date DATE NOT NULL,
  check_items JSONB, -- 체크리스트
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 일상점검 API
**Endpoint**: `POST /api/qr/daily-check`

**Request**:
```json
{
  "session_token": "qr_session_xyz",
  "check_items": {
    "temperature": "정상",
    "pressure": "정상",
    "oil_level": "정상",
    "abnormal_sound": "없음"
  },
  "gps_lat": 37.5665,
  "gps_lng": 126.9780,
  "notes": "이상 없음"
}
```

### 모바일 일상점검 UI
**파일**: `client/src/pages/QRDailyCheck.jsx`

```jsx
const QRDailyCheck = () => {
  const [checkItems, setCheckItems] = useState({
    temperature: '',
    pressure: '',
    oil_level: '',
    abnormal_sound: ''
  });
  
  const handleSubmit = async () => {
    // GPS 위치 가져오기
    navigator.geolocation.getCurrentPosition(async (position) => {
      await axios.post('/api/qr/daily-check', {
        session_token: localStorage.getItem('qr_session'),
        check_items: checkItems,
        gps_lat: position.coords.latitude,
        gps_lng: position.coords.longitude
      });
      
      alert('일상점검 완료');
    });
  };
  
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">일상점검</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block font-semibold mb-2">온도</label>
          <select 
            className="w-full p-3 border rounded-lg"
            value={checkItems.temperature}
            onChange={(e) => setCheckItems({...checkItems, temperature: e.target.value})}
          >
            <option value="">선택</option>
            <option value="정상">정상</option>
            <option value="이상">이상</option>
          </select>
        </div>
        
        {/* 다른 항목들... */}
        
        <button 
          onClick={handleSubmit}
          className="w-full py-4 bg-green-600 text-white font-bold rounded-xl"
        >
          점검 완료
        </button>
      </div>
    </div>
  );
};
```

**완료 기준**: QR 모바일에서 일상점검 입력 및 GPS 기록 성공

---

## 🎯 Week 2 완료 체크리스트

- [ ] 협력사 대시보드 UI 구현
- [ ] 제작처 대시보드 UI 구현
- [ ] 협력사 API (금형 목록/상세) 구현
- [ ] 제작처 API (금형 목록/수리 목록) 구현
- [ ] QR 로그인 페이지 구현
- [ ] QR 세션 생성 API 구현
- [ ] 일상점검 테이블 및 API 구현
- [ ] QR 모바일 일상점검 UI 구현
- [ ] GPS 위치 기록 기능 구현

---

## 📊 Week 2 산출물

1. **코드**
   - 협력사/제작처 대시보드
   - QR 로그인 시스템
   - 일상점검 기능

2. **DB**
   - daily_checks, inspections 테이블

3. **문서**
   - QR 접근 흐름도
   - 점검 시스템 명세서

---

## 다음 주 준비사항

- Week 3에서는 반출/입고 및 수리 관리 구현
- transfer_logs, repairs 테이블 설계 필요
