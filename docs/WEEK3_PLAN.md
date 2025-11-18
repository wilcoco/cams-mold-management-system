# Week 3: 반출/입고 및 수리 관리
**기간**: 3주차 (Day 11-15)  
**목표**: 반출/입고 프로세스, 수리 관리, GPS 기록, 댓글/메모 시스템

---

## 📋 주요 목표

1. ✅ 반출/입고 프로세스 구현
2. ✅ 수리 요청 및 진행 관리
3. ✅ GPS 위치 기록 시스템
4. ✅ 협력사↔제작처 댓글/메모
5. ✅ 타수 관리 및 알림
6. ✅ 파일 업로드 (이미지)

---

## Day 11: 반출/입고 테이블 및 API

### transfer_logs 테이블
```sql
CREATE TABLE transfer_logs (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL,
  transfer_type VARCHAR(20) NOT NULL, -- 'out', 'in'
  status VARCHAR(20) NOT NULL, -- 'requested', 'approved', 'in_transit', 'completed'
  requested_by INTEGER NOT NULL, -- user_id
  approved_by INTEGER,
  request_date TIMESTAMP DEFAULT NOW(),
  approved_date TIMESTAMP,
  completed_date TIMESTAMP,
  from_location VARCHAR(200),
  to_location VARCHAR(200),
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 반출 프로세스 API

#### 1. 협력사: 반출 요청
**Endpoint**: `POST /api/plant/transfer-out`

**Request**:
```json
{
  "mold_id": 1,
  "to_location": "금형제작처A",
  "reason": "캐비티 손상 수리",
  "notes": "긴급 수리 필요"
}
```

**Response**:
```json
{
  "transfer_log": {
    "id": 1,
    "mold_id": 1,
    "transfer_type": "out",
    "status": "requested",
    "requested_by": 1,
    "request_date": "2024-01-15T10:00:00Z"
  }
}
```

**로직**:
```javascript
const createTransferOut = async (req, res) => {
  const { mold_id, to_location, reason, notes } = req.body;
  
  // 권한 검증
  const mold = await Mold.findByPk(mold_id);
  if (mold.plant_id !== req.user.plant_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  // 반출 요청 생성
  const transferLog = await TransferLog.create({
    mold_id,
    transfer_type: 'out',
    status: 'requested',
    requested_by: req.user.id,
    to_location,
    notes
  });
  
  // 금형 상태 변경
  await mold.update({ status: 'transfer_pending' });
  
  // 제작처에 알림 발송
  await Notification.create({
    user_id: mold.maker_id, // 제작처 담당자
    type: 'transfer_out_request',
    message: `${mold.mold_code} 반출 요청이 접수되었습니다.`,
    mold_id
  });
  
  res.status(201).json({ transfer_log: transferLog });
};
```

#### 2. 제작처: 반출 승인
**Endpoint**: `PUT /api/maker/transfer-out/:id/approve`

**Request**:
```json
{
  "approved": true,
  "notes": "승인 완료"
}
```

**로직**:
```javascript
const approveTransferOut = async (req, res) => {
  const { id } = req.params;
  const { approved, notes } = req.body;
  
  const transferLog = await TransferLog.findByPk(id, {
    include: [{ model: Mold }]
  });
  
  // 권한 검증
  if (transferLog.Mold.maker_id !== req.user.maker_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  if (approved) {
    await transferLog.update({
      status: 'approved',
      approved_by: req.user.id,
      approved_date: new Date()
    });
    
    await transferLog.Mold.update({ status: 'in_transit' });
    
    // 협력사에 알림
    await Notification.create({
      user_id: transferLog.requested_by,
      type: 'transfer_out_approved',
      message: `${transferLog.Mold.mold_code} 반출이 승인되었습니다.`,
      mold_id: transferLog.mold_id
    });
  }
  
  res.json({ transfer_log: transferLog });
};
```

**완료 기준**: 협력사 반출 요청 → 제작처 승인 → 알림 발송 성공

---

## Day 12: 입고 프로세스 구현

### 입고 프로세스 API

#### 1. 제작처: 입고 요청
**Endpoint**: `POST /api/maker/transfer-in`

**Request**:
```json
{
  "mold_id": 1,
  "repair_completed": true,
  "notes": "수리 완료, 입고 요청"
}
```

**로직**:
```javascript
const createTransferIn = async (req, res) => {
  const { mold_id, repair_completed, notes } = req.body;
  
  const mold = await Mold.findByPk(mold_id);
  
  // 권한 검증
  if (mold.maker_id !== req.user.maker_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const transferLog = await TransferLog.create({
    mold_id,
    transfer_type: 'in',
    status: 'requested',
    requested_by: req.user.id,
    notes
  });
  
  await mold.update({ status: 'return_pending' });
  
  // 협력사에 알림
  await Notification.create({
    user_id: mold.plant_id, // 협력사 담당자
    type: 'transfer_in_request',
    message: `${mold.mold_code} 입고 요청이 접수되었습니다.`,
    mold_id
  });
  
  res.status(201).json({ transfer_log: transferLog });
};
```

#### 2. 협력사: 입고 확인
**Endpoint**: `PUT /api/plant/transfer-in/:id/confirm`

**Request**:
```json
{
  "confirmed": true,
  "inspection_passed": true,
  "notes": "입고 확인 완료"
}
```

**로직**:
```javascript
const confirmTransferIn = async (req, res) => {
  const { id } = req.params;
  const { confirmed, inspection_passed, notes } = req.body;
  
  const transferLog = await TransferLog.findByPk(id, {
    include: [{ model: Mold }]
  });
  
  // 권한 검증
  if (transferLog.Mold.plant_id !== req.user.plant_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  if (confirmed) {
    await transferLog.update({
      status: 'completed',
      approved_by: req.user.id,
      approved_date: new Date(),
      completed_date: new Date()
    });
    
    const newStatus = inspection_passed ? 'active' : 'inspection_required';
    await transferLog.Mold.update({ status: newStatus });
    
    // 제작처에 알림
    await Notification.create({
      user_id: transferLog.requested_by,
      type: 'transfer_in_confirmed',
      message: `${transferLog.Mold.mold_code} 입고가 확인되었습니다.`,
      mold_id: transferLog.mold_id
    });
  }
  
  res.json({ transfer_log: transferLog });
};
```

**완료 기준**: 제작처 입고 요청 → 협력사 확인 → 금형 상태 변경 성공

---

## Day 13: 수리 관리 시스템

### repairs 테이블
```sql
CREATE TABLE repairs (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL,
  requested_by INTEGER NOT NULL, -- user_id (협력사)
  assigned_to INTEGER, -- user_id (제작처)
  status VARCHAR(20) NOT NULL, -- 'requested', 'accepted', 'in_progress', 'paused', 'completed'
  priority VARCHAR(20), -- 'low', 'medium', 'high', 'urgent'
  issue_description TEXT NOT NULL,
  repair_details TEXT,
  parts_replaced JSONB,
  cost DECIMAL(10, 2),
  requested_date TIMESTAMP DEFAULT NOW(),
  started_date TIMESTAMP,
  completed_date TIMESTAMP,
  estimated_completion TIMESTAMP,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 수리 요청 API

#### 1. 협력사: 수리 요청 생성
**Endpoint**: `POST /api/plant/repairs`

**Request**:
```json
{
  "mold_id": 1,
  "priority": "high",
  "issue_description": "캐비티 1번 크랙 발생",
  "images": ["image1.jpg", "image2.jpg"]
}
```

**로직**:
```javascript
const createRepair = async (req, res) => {
  const { mold_id, priority, issue_description } = req.body;
  
  const mold = await Mold.findByPk(mold_id);
  
  // 권한 검증
  if (mold.plant_id !== req.user.plant_id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  const repair = await Repair.create({
    mold_id,
    requested_by: req.user.id,
    status: 'requested',
    priority,
    issue_description
  });
  
  await mold.update({ status: 'repair_requested' });
  
  // 제작처에 알림
  await Notification.create({
    user_id: mold.maker_id,
    type: 'repair_request',
    message: `${mold.mold_code} 수리 요청이 접수되었습니다.`,
    mold_id
  });
  
  res.status(201).json({ repair });
};
```

#### 2. 제작처: 수리 접수
**Endpoint**: `PUT /api/maker/repairs/:id/accept`

**Request**:
```json
{
  "assigned_to": 5,
  "estimated_completion": "2024-01-20T18:00:00Z",
  "notes": "수리 접수 완료"
}
```

#### 3. 제작처: 수리 진행 업데이트
**Endpoint**: `PUT /api/maker/repairs/:id/progress`

**Request**:
```json
{
  "status": "in_progress",
  "repair_details": "캐비티 용접 작업 진행 중",
  "progress_percentage": 50
}
```

#### 4. 제작처: 수리 완료
**Endpoint**: `PUT /api/maker/repairs/:id/complete`

**Request**:
```json
{
  "repair_details": "캐비티 용접 및 연마 완료",
  "parts_replaced": {
    "cavity_1": "용접",
    "ejector_pin": "교체"
  },
  "cost": 1500000,
  "images": ["repair_complete1.jpg"]
}
```

**완료 기준**: 수리 요청 → 접수 → 진행 → 완료 전체 흐름 성공

---

## Day 14: 댓글/메모 및 GPS 기록

### comments 테이블
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  parent_id INTEGER, -- 대댓글용
  content TEXT NOT NULL,
  type VARCHAR(20), -- 'comment', 'memo', 'note'
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 댓글 API

#### 1. 댓글 작성
**Endpoint**: `POST /api/comments`

**Request**:
```json
{
  "mold_id": 1,
  "content": "수리 진행 상황 확인 부탁드립니다.",
  "type": "comment"
}
```

#### 2. 댓글 목록 조회
**Endpoint**: `GET /api/comments/:moldId`

**Response**:
```json
{
  "comments": [
    {
      "id": 1,
      "user": {
        "name": "협력사A 담당자",
        "role_group": "plant"
      },
      "content": "수리 진행 상황 확인 부탁드립니다.",
      "created_at": "2024-01-15T10:00:00Z"
    }
  ]
}
```

### GPS 위치 기록 강화

#### 모바일 GPS 수집
```javascript
// client/src/utils/gps.js
export const getCurrentPosition = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('GPS not supported'));
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  });
};
```

#### GPS 기록 API
**Endpoint**: `POST /api/gps/record`

**Request**:
```json
{
  "mold_id": 1,
  "action_type": "daily_check",
  "gps_lat": 37.5665,
  "gps_lng": 126.9780
}
```

**완료 기준**: 댓글 작성/조회 및 GPS 위치 기록 성공

---

## Day 15: 파일 업로드 및 이미지 관리

### 파일 업로드 설정

#### Multer 설정
**파일**: `server/middleware/upload.js`

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  
  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only images are allowed'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: fileFilter
});

module.exports = upload;
```

### 이미지 업로드 API
**Endpoint**: `POST /api/upload/mold-image`

**Request**: `multipart/form-data`
- `mold_id`: 1
- `image_type`: 'installation' | 'production' | 'repair'
- `file`: [이미지 파일]

**Response**:
```json
{
  "image_url": "/uploads/mold-1234567890.jpg",
  "image_id": 1
}
```

### mold_images 테이블
```sql
CREATE TABLE mold_images (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL,
  image_type VARCHAR(50), -- 'installation', 'production', 'repair', 'inspection'
  image_url VARCHAR(500) NOT NULL,
  uploaded_by INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 모바일 이미지 업로드 UI
```jsx
const ImageUpload = ({ moldId, imageType }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  
  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('mold_id', moldId);
    formData.append('image_type', imageType);
    formData.append('file', selectedFile);
    
    await axios.post('/api/upload/mold-image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    
    alert('이미지 업로드 완료');
  };
  
  return (
    <div>
      <input 
        type="file" 
        accept="image/*"
        onChange={(e) => setSelectedFile(e.target.files[0])}
      />
      <button onClick={handleUpload}>업로드</button>
    </div>
  );
};
```

**완료 기준**: 모바일에서 이미지 업로드 및 조회 성공

---

## 🎯 Week 3 완료 체크리스트

- [ ] transfer_logs 테이블 생성
- [ ] 반출 요청/승인 API 구현
- [ ] 입고 요청/확인 API 구현
- [ ] repairs 테이블 생성
- [ ] 수리 요청/접수/진행/완료 API 구현
- [ ] comments 테이블 생성
- [ ] 댓글/메모 API 구현
- [ ] GPS 위치 기록 강화
- [ ] 파일 업로드 시스템 구현
- [ ] 모바일 이미지 업로드 UI 구현

---

## 📊 Week 3 산출물

1. **코드**
   - 반출/입고 프로세스
   - 수리 관리 시스템
   - 댓글/메모 기능
   - 파일 업로드

2. **DB**
   - transfer_logs, repairs, comments, mold_images 테이블

3. **문서**
   - 반출/입고 프로세스 플로우차트
   - 수리 관리 워크플로우

---

## 다음 주 준비사항

- Week 4에서는 UI/UX 완성 및 배포
- 알림 시스템, 대시보드 완성, 테스트, 배포
