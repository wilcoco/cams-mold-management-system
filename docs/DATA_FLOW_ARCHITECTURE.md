# 데이터 흐름 및 자동 연동 아키텍처

## 개요

본 시스템은 본사(CAMS) → 금형제작처 → 금형 마스터 → 생산처의 단방향 데이터 흐름을 기반으로 자동 연동됩니다.

---

## 🔄 데이터 흐름 구조

### 전체 흐름도

```
[본사(CAMS)]
    ↓ 1차 입력
[금형제작사양 입력]
    ↓ 자동 연동
[금형제작처 대시보드]
    ↓ 추가 입력 및 등록
[금형 마스터 (molds)]
    ↓ 자동 연동
[생산처 대시보드]
    ↓ 생산 정보 입력
[금형 마스터 자동 업데이트]
```

---

## 📋 단계별 상세 프로세스

### Step 1: 본사(CAMS) - 금형제작사양 1차 입력

**담당**: 본사 관리자
**테이블**: `mold_specifications` (신규)

#### 입력 항목
```javascript
{
  // 기본 정보 (외부 시스템 연동 가능)
  part_number: "P-2024-001",        // 품번 (부품정보 시스템 연동)
  part_name: "프론트 범퍼",          // 품명 (부품정보 시스템 연동)
  car_model: "GV80",                // 차종 (부품정보 시스템 연동)
  car_year: "2024",                 // 연식
  
  // 금형 사양
  mold_type: "사출금형",
  cavity_count: 2,
  material: "NAK80",
  tonnage: 850,
  
  // 제작 정보
  target_maker_id: 5,               // 지정 제작처
  development_stage: "개발",         // '개발' 또는 '양산'
  production_stage: "양산",          // 향후 변경 가능
  
  // 제작 일정
  order_date: "2024-01-15",
  target_delivery_date: "2024-06-15",
  
  // 예산
  estimated_cost: 50000000,
  
  // 상태
  status: "draft",                   // 'draft', 'sent_to_maker', 'in_production', 'completed'
  
  // 외부 시스템 연동 정보
  external_system_id: "ERP-2024-001",
  external_sync_enabled: true,
  last_sync_date: null,
  
  created_by: 1,                     // 본사 관리자 ID
  created_at: "2024-01-15T10:00:00Z"
}
```

#### API
```javascript
POST /api/hq/mold-specifications

{
  "part_number": "P-2024-001",
  "part_name": "프론트 범퍼",
  "car_model": "GV80",
  "target_maker_id": 5,
  "development_stage": "개발",
  ...
}
```

---

### Step 2: 자동 연동 → 금형제작처 대시보드

**트리거**: 본사에서 `status: 'sent_to_maker'`로 변경 시
**대상**: 지정된 제작처 (`target_maker_id`)

#### 자동 연동 프로세스

```javascript
// 본사에서 제작처로 전송
async function sendToMaker(specificationId) {
  const spec = await MoldSpecification.findByPk(specificationId);
  
  // 1. 제작처 대시보드 레코드 생성
  const makerSpec = await MakerSpecification.create({
    specification_id: spec.id,
    maker_id: spec.target_maker_id,
    
    // 본사 입력 항목 자동 복사
    part_number: spec.part_number,
    part_name: spec.part_name,
    car_model: spec.car_model,
    mold_type: spec.mold_type,
    cavity_count: spec.cavity_count,
    material: spec.material,
    tonnage: spec.tonnage,
    development_stage: spec.development_stage,
    
    // 제작처 입력 대기 항목 (null)
    actual_material: null,
    actual_cavity_count: null,
    core_material: null,
    cavity_material: null,
    cooling_type: null,
    
    status: 'pending',
    synced_from_hq: true,
    synced_at: new Date()
  });
  
  // 2. 본사 사양 상태 업데이트
  await spec.update({ status: 'sent_to_maker' });
  
  // 3. 제작처에 알림 발송
  await Notification.create({
    user_id: spec.target_maker_id,
    type: 'new_specification',
    title: '새로운 금형 제작 사양',
    message: `${spec.part_name} 금형 제작 사양이 도착했습니다.`,
    related_id: makerSpec.id
  });
  
  return makerSpec;
}
```

---

### Step 3: 금형제작처 - 추가 입력 및 등록

**담당**: 금형제작처
**테이블**: `maker_specifications`

#### 제작처 추가 입력 항목

```javascript
{
  // 본사 입력 항목 (읽기 전용)
  part_number: "P-2024-001",        // 수정 불가
  part_name: "프론트 범퍼",          // 수정 불가
  car_model: "GV80",                // 수정 불가
  
  // 제작처 입력 항목 (추가/수정 가능)
  actual_material: "NAK80 (실제)",
  actual_cavity_count: 2,
  core_material: "NAK80",
  cavity_material: "NAK80",
  hardness: "HRC 40-42",
  
  // 구조 정보
  cooling_type: "워터 냉각",
  ejection_type: "에젝터 핀",
  hot_runner: true,
  slide_count: 2,
  lifter_count: 4,
  
  // 성능 정보
  cycle_time: 45,                    // 초
  max_shots: 1000000,
  
  // 제작 진행 상황
  production_progress: 30,           // %
  current_stage: "설계 완료",
  
  // 도면 및 사진
  drawings: ["url1", "url2"],
  production_images: ["url3", "url4"],
  
  // 완료 정보
  completed: false,
  completed_date: null,
  
  updated_by: 5,                     // 제작처 ID
  updated_at: "2024-03-15T14:30:00Z"
}
```

#### 제작 완료 및 등록

```javascript
// 제작처에서 제작 완료 처리
async function completeMakerSpecification(makerSpecId) {
  const makerSpec = await MakerSpecification.findByPk(makerSpecId);
  
  // 1. 제작처 사양 완료 처리
  await makerSpec.update({
    completed: true,
    completed_date: new Date(),
    status: 'completed'
  });
  
  // 2. 금형 마스터 자동 생성
  const mold = await createMoldMaster(makerSpec);
  
  // 3. 본사 사양 상태 업데이트
  const hqSpec = await MoldSpecification.findByPk(makerSpec.specification_id);
  await hqSpec.update({
    status: 'completed',
    mold_id: mold.id
  });
  
  // 4. 본사에 알림
  await Notification.create({
    user_id: hqSpec.created_by,
    type: 'mold_completed',
    title: '금형 제작 완료',
    message: `${makerSpec.part_name} 금형 제작이 완료되었습니다.`,
    related_id: mold.id
  });
  
  return mold;
}
```

---

### Step 4: 금형 마스터 자동 생성

**트리거**: 제작처에서 제작 완료 시
**테이블**: `molds` (금형 마스터)

#### 자동 생성 로직

```javascript
async function createMoldMaster(makerSpec) {
  const hqSpec = await MoldSpecification.findByPk(makerSpec.specification_id);
  
  // 금형 코드 자동 생성
  const moldCode = await generateMoldCode(hqSpec.car_model, hqSpec.part_number);
  
  // 금형 마스터 생성
  const mold = await Mold.create({
    // 기본 정보 (본사 사양에서 복사)
    mold_code: moldCode,
    mold_name: `${hqSpec.car_model} ${hqSpec.part_name}`,
    part_number: hqSpec.part_number,
    part_name: hqSpec.part_name,
    car_model: hqSpec.car_model,
    car_year: hqSpec.car_year,
    
    // 금형 사양 (제작처 사양에서 복사)
    cavity: makerSpec.actual_cavity_count,
    material: makerSpec.actual_material,
    tonnage: hqSpec.tonnage,
    
    // 제작 정보
    maker_id: makerSpec.maker_id,
    manufacturing_date: makerSpec.completed_date,
    
    // 성능 정보
    target_shots: makerSpec.max_shots,
    cycle_time: makerSpec.cycle_time,
    
    // 단계 정보
    development_stage: hqSpec.development_stage,
    production_stage: hqSpec.production_stage,
    
    // 초기 상태
    status: 'ready',                  // 생산 준비 완료
    current_location: 'maker',
    plant_id: null,                   // 아직 배정 안됨
    
    // 연동 정보
    specification_id: hqSpec.id,
    maker_specification_id: makerSpec.id,
    
    // 외부 시스템 연동
    external_system_id: hqSpec.external_system_id,
    external_sync_enabled: hqSpec.external_sync_enabled,
    
    created_at: new Date(),
    updated_at: new Date()
  });
  
  // maker_info 테이블에 상세 사양 저장
  await MakerInfo.create({
    mold_id: mold.id,
    material: makerSpec.actual_material,
    core_material: makerSpec.core_material,
    cavity_material: makerSpec.cavity_material,
    hardness: makerSpec.hardness,
    cooling_type: makerSpec.cooling_type,
    ejection_type: makerSpec.ejection_type,
    hot_runner: makerSpec.hot_runner,
    slide_count: makerSpec.slide_count,
    lifter_count: makerSpec.lifter_count,
    cycle_time: makerSpec.cycle_time,
    max_shots: makerSpec.max_shots,
    specifications: makerSpec.specifications,
    summary: `${hqSpec.car_model} ${hqSpec.part_name} 금형`
  });
  
  return mold;
}
```

---

### Step 5: 자동 연동 → 생산처 대시보드

**트리거**: 본사에서 생산처 배정 시 (`plant_id` 설정)
**테이블**: `plant_molds` (신규)

#### 생산처 배정 및 연동

```javascript
async function assignToPlant(moldId, plantId) {
  const mold = await Mold.findByPk(moldId);
  
  // 1. 금형 마스터 업데이트
  await mold.update({
    plant_id: plantId,
    current_location: 'plant',
    status: 'in_production'
  });
  
  // 2. 생산처 대시보드 레코드 생성
  const plantMold = await PlantMold.create({
    mold_id: moldId,
    plant_id: plantId,
    
    // 금형 마스터 정보 복사 (읽기 전용)
    mold_code: mold.mold_code,
    mold_name: mold.mold_name,
    part_number: mold.part_number,
    part_name: mold.part_name,
    car_model: mold.car_model,
    cavity: mold.cavity,
    target_shots: mold.target_shots,
    
    // 생산처 입력 항목 (초기값 null)
    current_shots: 0,
    production_quantity: 0,
    production_line: null,
    injection_machine: null,
    
    // 상태
    status: 'assigned',
    assigned_date: new Date(),
    
    synced_from_master: true,
    synced_at: new Date()
  });
  
  // 3. 생산처에 알림
  await Notification.create({
    user_id: plantId,
    type: 'mold_assigned',
    title: '새로운 금형 배정',
    message: `${mold.mold_name} 금형이 배정되었습니다.`,
    related_id: moldId
  });
  
  return plantMold;
}
```

---

### Step 6: 생산처 - 생산 정보 입력

**담당**: 생산처 작업자
**테이블**: `plant_molds`, `daily_checks`

#### 생산처 입력 항목

```javascript
{
  // 금형 마스터 정보 (읽기 전용)
  mold_code: "M-2024-001",
  mold_name: "GV80 프론트 범퍼",
  part_number: "P-2024-001",
  
  // 생산처 입력 항목
  production_line: "Line 1",
  injection_machine: "850T-01",
  current_shots: 50000,
  production_quantity: 5000,
  
  // 일상점검 시 입력
  daily_production: 500,
  temperature: 180,
  pressure: 120,
  
  // 사출 조건
  injection_conditions: {
    temperature: [180, 190, 200],
    pressure: [120, 130, 140],
    speed: [50, 60, 70]
  }
}
```

---

### Step 7: 금형 마스터 자동 업데이트

**트리거**: 생산처에서 데이터 입력 시
**방향**: 생산처 → 금형 마스터

#### 자동 업데이트 로직

```javascript
// 일상점검 시 자동 업데이트
async function updateMoldMasterFromPlant(dailyCheckId) {
  const dailyCheck = await DailyCheck.findByPk(dailyCheckId);
  const mold = await Mold.findByPk(dailyCheck.mold_id);
  
  // 1. 타수 업데이트
  const shots = await Shot.findOne({ where: { mold_id: mold.id } });
  const newTotalShots = shots.count_total + dailyCheck.production_quantity;
  
  await shots.update({
    count_total: newTotalShots,
    count_daily: dailyCheck.production_quantity,
    last_updated: new Date()
  });
  
  // 2. 금형 마스터 업데이트
  await mold.update({
    current_shots: newTotalShots,
    last_production_date: dailyCheck.check_date,
    updated_at: new Date()
  });
  
  // 3. 생산처 대시보드 업데이트
  const plantMold = await PlantMold.findOne({
    where: {
      mold_id: mold.id,
      plant_id: dailyCheck.user.plant_id
    }
  });
  
  await plantMold.update({
    current_shots: newTotalShots,
    production_quantity: plantMold.production_quantity + dailyCheck.production_quantity,
    last_production_date: dailyCheck.check_date,
    synced_to_master: true,
    last_sync_date: new Date()
  });
  
  // 4. 타수 임계치 확인 및 알림
  if (newTotalShots >= mold.target_shots * 0.9) {
    await Notification.create({
      user_id: mold.maker_id,
      type: 'shots_threshold',
      title: '타수 임계치 도달',
      message: `${mold.mold_name} 금형이 수명의 90%에 도달했습니다.`,
      mold_id: mold.id,
      priority: 'high'
    });
  }
}
```

---

## 🔄 단계 변경 관리

### 개발 → 양산 단계 전환

```javascript
async function changeDevelopmentStage(moldId, newStage) {
  const mold = await Mold.findByPk(moldId);
  
  // 1. 금형 마스터 업데이트
  await mold.update({
    development_stage: newStage,
    stage_changed_at: new Date()
  });
  
  // 2. 이력 기록
  await StageChangeHistory.create({
    mold_id: moldId,
    previous_stage: mold.development_stage,
    new_stage: newStage,
    changed_by: userId,
    changed_at: new Date(),
    reason: '양산 전환'
  });
  
  // 3. 관련 시스템 알림
  await notifyStageChange(mold, newStage);
}
```

---

## 🔗 외부 시스템 연동 구조

### 부품정보 시스템 연동

```javascript
// 외부 시스템에서 기본 정보 가져오기
async function syncFromExternalSystem(externalId) {
  // 1. 외부 API 호출
  const externalData = await axios.get(
    `${EXTERNAL_API_URL}/parts/${externalId}`
  );
  
  // 2. 데이터 매핑
  const mappedData = {
    part_number: externalData.partNumber,
    part_name: externalData.partName,
    car_model: externalData.carModel,
    car_year: externalData.carYear,
    specifications: externalData.specifications,
    external_system_id: externalId,
    external_sync_enabled: true,
    last_sync_date: new Date()
  };
  
  // 3. 금형 사양 생성 또는 업데이트
  const spec = await MoldSpecification.findOne({
    where: { external_system_id: externalId }
  });
  
  if (spec) {
    await spec.update(mappedData);
  } else {
    await MoldSpecification.create(mappedData);
  }
  
  return mappedData;
}

// 주기적 동기화
async function scheduleExternalSync() {
  // 매일 자정에 실행
  cron.schedule('0 0 * * *', async () => {
    const specs = await MoldSpecification.findAll({
      where: { external_sync_enabled: true }
    });
    
    for (const spec of specs) {
      await syncFromExternalSystem(spec.external_system_id);
    }
  });
}
```

---

## 📊 데이터베이스 스키마 추가

### 1. mold_specifications (본사 금형제작사양)

```sql
CREATE TABLE mold_specifications (
  id SERIAL PRIMARY KEY,
  
  -- 기본 정보 (외부 시스템 연동)
  part_number VARCHAR(50) NOT NULL,
  part_name VARCHAR(200) NOT NULL,
  car_model VARCHAR(100),
  car_year VARCHAR(10),
  
  -- 금형 사양
  mold_type VARCHAR(50),
  cavity_count INTEGER,
  material VARCHAR(100),
  tonnage INTEGER,
  
  -- 제작 정보
  target_maker_id INTEGER REFERENCES users(id),
  development_stage VARCHAR(20), -- '개발', '양산'
  production_stage VARCHAR(20),
  
  -- 제작 일정
  order_date DATE,
  target_delivery_date DATE,
  actual_delivery_date DATE,
  
  -- 예산
  estimated_cost DECIMAL(12, 2),
  actual_cost DECIMAL(12, 2),
  
  -- 상태
  status VARCHAR(20), -- 'draft', 'sent_to_maker', 'in_production', 'completed'
  
  -- 외부 시스템 연동
  external_system_id VARCHAR(100),
  external_sync_enabled BOOLEAN DEFAULT FALSE,
  last_sync_date TIMESTAMP,
  
  -- 연동 정보
  mold_id INTEGER REFERENCES molds(id),
  
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mold_specifications_part ON mold_specifications(part_number);
CREATE INDEX idx_mold_specifications_maker ON mold_specifications(target_maker_id);
CREATE INDEX idx_mold_specifications_external ON mold_specifications(external_system_id);
```

### 2. maker_specifications (제작처 사양)

```sql
CREATE TABLE maker_specifications (
  id SERIAL PRIMARY KEY,
  specification_id INTEGER NOT NULL REFERENCES mold_specifications(id),
  maker_id INTEGER NOT NULL REFERENCES users(id),
  
  -- 본사 입력 항목 (읽기 전용)
  part_number VARCHAR(50),
  part_name VARCHAR(200),
  car_model VARCHAR(100),
  mold_type VARCHAR(50),
  cavity_count INTEGER,
  material VARCHAR(100),
  tonnage INTEGER,
  development_stage VARCHAR(20),
  
  -- 제작처 입력 항목
  actual_material VARCHAR(100),
  actual_cavity_count INTEGER,
  core_material VARCHAR(100),
  cavity_material VARCHAR(100),
  hardness VARCHAR(50),
  
  cooling_type VARCHAR(50),
  ejection_type VARCHAR(50),
  hot_runner BOOLEAN,
  slide_count INTEGER,
  lifter_count INTEGER,
  
  cycle_time INTEGER,
  max_shots INTEGER,
  
  -- 제작 진행
  production_progress INTEGER DEFAULT 0,
  current_stage VARCHAR(50),
  
  -- 도면 및 사진
  drawings JSONB,
  production_images JSONB,
  
  -- 완료 정보
  completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  
  -- 상태
  status VARCHAR(20), -- 'pending', 'in_progress', 'completed'
  
  -- 연동 정보
  synced_from_hq BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMP,
  
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_maker_specifications_spec ON maker_specifications(specification_id);
CREATE INDEX idx_maker_specifications_maker ON maker_specifications(maker_id);
```

### 3. plant_molds (생산처 금형)

```sql
CREATE TABLE plant_molds (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  plant_id INTEGER NOT NULL REFERENCES users(id),
  
  -- 금형 마스터 정보 (읽기 전용)
  mold_code VARCHAR(50),
  mold_name VARCHAR(200),
  part_number VARCHAR(50),
  part_name VARCHAR(200),
  car_model VARCHAR(100),
  cavity INTEGER,
  target_shots INTEGER,
  
  -- 생산처 입력 항목
  current_shots INTEGER DEFAULT 0,
  production_quantity INTEGER DEFAULT 0,
  production_line VARCHAR(100),
  injection_machine VARCHAR(100),
  
  -- 사출 조건
  injection_conditions JSONB,
  
  -- 상태
  status VARCHAR(20), -- 'assigned', 'in_production', 'maintenance', 'idle'
  assigned_date DATE,
  last_production_date DATE,
  
  -- 연동 정보
  synced_from_master BOOLEAN DEFAULT FALSE,
  synced_to_master BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMP,
  last_sync_date TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_plant_molds_mold ON plant_molds(mold_id);
CREATE INDEX idx_plant_molds_plant ON plant_molds(plant_id);
```

### 4. stage_change_history (단계 변경 이력)

```sql
CREATE TABLE stage_change_history (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  previous_stage VARCHAR(20),
  new_stage VARCHAR(20),
  change_type VARCHAR(20), -- 'development', 'production'
  reason TEXT,
  changed_by INTEGER REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_stage_change_mold ON stage_change_history(mold_id);
```

---

## 🎯 핵심 특징

### 1. 단방향 데이터 흐름
- 본사 → 제작처 → 마스터 → 생산처
- 명확한 책임 분리
- 데이터 일관성 보장

### 2. 자동 연동
- 수동 입력 최소화
- 실시간 동기화
- 오류 방지

### 3. 외부 시스템 연동 준비
- 부품정보 시스템 연동 가능
- 확장 가능한 구조
- API 기반 통합

### 4. 단계 변경 유연성
- 개발 ↔ 양산 전환 가능
- 이력 관리
- 알림 자동 발송

---

## 🏗️ 금형개발 계획 관리

### 개발 단계 구조

금형 제작 완료 후 금형 마스터에 등록되면, 5단계 개발 계획이 자동으로 생성됩니다.

```
[금형 마스터 생성]
    ↓ 자동 생성
[개발 계획 5단계]
  1. 기획 (Planning)
  2. 설계 (Design)
  3. 제작 (Manufacturing)
  4. 시운전 (Trial Run)
  5. 양산 (Mass Production)
```

### 테이블 구조

#### 1. mold_development (금형개발 - 기본 정보)
```javascript
{
  mold_id: 1,
  development_type: "신규",
  development_stage: "설계", // 현재 단계
  start_date: "2024-01-15",
  target_date: "2024-06-15",
  overall_progress: 45, // 전체 진행률 (%)
  budget: 50000000,
  actual_cost: 22500000,
  responsible_person: "김철수"
}
```

#### 2. development_plan (개발계획 - 단계별 상세)
```javascript
// 각 단계별로 5개 레코드 생성
{
  mold_id: 1,
  development_id: 1,
  phase_number: 2, // 설계 단계
  phase_name: "설계",
  phase_order: 2,
  
  // 일정
  planned_start_date: "2024-02-01",
  planned_end_date: "2024-03-15",
  actual_start_date: "2024-02-01",
  actual_end_date: null,
  
  // 진행률
  progress_percentage: 70,
  status: "in_progress",
  
  // 주요 활동
  key_activities: [
    {activity: "2D 도면 작성", completed: true},
    {activity: "3D 모델링", completed: true},
    {activity: "구조 해석", completed: false},
    {activity: "설계 검토", completed: false}
  ],
  
  // 산출물
  deliverables: [
    {name: "2D 도면", completed: true, file_url: "..."},
    {name: "3D 모델", completed: true, file_url: "..."},
    {name: "해석 보고서", completed: false}
  ],
  
  // 마일스톤
  milestones: [
    {name: "초기 설계 완료", date: "2024-02-15", completed: true},
    {name: "설계 검토 회의", date: "2024-03-10", completed: false}
  ],
  
  // 팀 구성
  responsible_person: "이영희",
  team_members: [
    {name: "이영희", role: "설계 리더"},
    {name: "박민수", role: "3D 모델링"},
    {name: "정수진", role: "구조 해석"}
  ],
  
  // 이슈 및 리스크
  issues: [
    {
      issue: "냉각 채널 설계 변경 필요",
      severity: "medium",
      status: "in_progress",
      assigned_to: "이영희",
      due_date: "2024-03-05"
    }
  ],
  
  risks: [
    {
      risk: "복잡한 슬라이드 구조로 인한 일정 지연 가능성",
      probability: "medium",
      impact: "high",
      mitigation: "외부 전문가 자문 예정"
    }
  ],
  
  // 비용
  planned_cost: 10000000,
  actual_cost: 7000000,
  
  // 품질 지표
  quality_metrics: {
    design_review_score: 85,
    rework_count: 1,
    defect_rate: 0.2
  },
  
  // 승인
  approval_required: true,
  approval_status: "pending",
  
  // 첨부
  attachments: [
    {name: "설계도면_v2.pdf", url: "...", uploaded_at: "2024-02-20"},
    {name: "해석결과.xlsx", url: "...", uploaded_at: "2024-02-25"}
  ]
}
```

#### 3. development_progress_history (개발 진행 이력)
```javascript
{
  development_plan_id: 2, // 설계 단계
  mold_id: 1,
  previous_progress: 60,
  new_progress: 70,
  previous_status: "in_progress",
  new_status: "in_progress",
  
  change_description: "3D 모델링 완료 및 구조 해석 진행 중",
  achievements: "- 3D 모델 완성\n- 초기 구조 해석 50% 완료",
  next_steps: "- 구조 해석 완료\n- 설계 검토 회의 준비",
  
  updated_by: 5,
  update_date: "2024-03-01T14:30:00Z",
  
  attachments: [
    {name: "진행상황_사진.jpg", url: "..."}
  ]
}
```

### 자동 생성 로직

```javascript
// 금형 마스터 생성 시 개발 계획 자동 생성
async function createDevelopmentPlan(moldId) {
  // 1. 기본 개발 정보 생성
  const development = await MoldDevelopment.create({
    mold_id: moldId,
    development_type: "신규",
    development_stage: "기획",
    start_date: new Date(),
    overall_progress: 0
  });
  
  // 2. 5단계 개발 계획 생성
  const phases = [
    {number: 1, name: "기획", order: 1},
    {number: 2, name: "설계", order: 2},
    {number: 3, name: "제작", order: 3},
    {number: 4, name: "시운전", order: 4},
    {number: 5, name: "양산", order: 5}
  ];
  
  for (const phase of phases) {
    await DevelopmentPlan.create({
      mold_id: moldId,
      development_id: development.id,
      phase_number: phase.number,
      phase_name: phase.name,
      phase_order: phase.order,
      progress_percentage: 0,
      status: phase.number === 1 ? 'in_progress' : 'pending',
      key_activities: getDefaultActivities(phase.name),
      deliverables: getDefaultDeliverables(phase.name)
    });
  }
  
  return development;
}

// 단계별 기본 활동 정의
function getDefaultActivities(phaseName) {
  const activities = {
    "기획": [
      {activity: "요구사항 분석", completed: false},
      {activity: "타당성 검토", completed: false},
      {activity: "예산 수립", completed: false},
      {activity: "일정 계획", completed: false}
    ],
    "설계": [
      {activity: "2D 도면 작성", completed: false},
      {activity: "3D 모델링", completed: false},
      {activity: "구조 해석", completed: false},
      {activity: "설계 검토", completed: false}
    ],
    "제작": [
      {activity: "재료 발주", completed: false},
      {activity: "가공 작업", completed: false},
      {activity: "조립", completed: false},
      {activity: "품질 검사", completed: false}
    ],
    "시운전": [
      {activity: "초도품 생산", completed: false},
      {activity: "품질 검증", completed: false},
      {activity: "조건 최적화", completed: false},
      {activity: "승인", completed: false}
    ],
    "양산": [
      {activity: "양산 준비", completed: false},
      {activity: "생산 시작", completed: false},
      {activity: "모니터링", completed: false},
      {activity: "최종 평가", completed: false}
    ]
  };
  
  return activities[phaseName] || [];
}
```

### 진행률 업데이트

```javascript
// 단계별 진행률 업데이트 시 전체 진행률 자동 계산
async function updatePhaseProgress(planId, newProgress) {
  const plan = await DevelopmentPlan.findByPk(planId);
  const oldProgress = plan.progress_percentage;
  
  // 1. 단계 진행률 업데이트
  await plan.update({
    progress_percentage: newProgress,
    status: newProgress === 100 ? 'completed' : 'in_progress'
  });
  
  // 2. 이력 기록
  await DevelopmentProgressHistory.create({
    development_plan_id: planId,
    mold_id: plan.mold_id,
    previous_progress: oldProgress,
    new_progress: newProgress,
    updated_by: userId
  });
  
  // 3. 전체 진행률 계산 (5단계 평균)
  const allPlans = await DevelopmentPlan.findAll({
    where: {development_id: plan.development_id}
  });
  
  const totalProgress = allPlans.reduce((sum, p) => 
    sum + p.progress_percentage, 0
  );
  const overallProgress = Math.round(totalProgress / allPlans.length);
  
  // 4. 개발 기본 정보 업데이트
  await MoldDevelopment.update(
    {overall_progress: overallProgress},
    {where: {id: plan.development_id}}
  );
  
  // 5. 다음 단계 자동 시작
  if (newProgress === 100) {
    const nextPhase = await DevelopmentPlan.findOne({
      where: {
        development_id: plan.development_id,
        phase_order: plan.phase_order + 1
      }
    });
    
    if (nextPhase && nextPhase.status === 'pending') {
      await nextPhase.update({
        status: 'in_progress',
        actual_start_date: new Date()
      });
    }
  }
}
```

### API 엔드포인트

```javascript
// 개발 계획 조회
GET /api/molds/:moldId/development-progress

// 단계별 상세 조회
GET /api/molds/:moldId/development-progress/:phaseNumber

// 진행률 업데이트
PATCH /api/development-plans/:planId/progress
{
  "progress_percentage": 70,
  "achievements": "3D 모델링 완료",
  "next_steps": "구조 해석 진행"
}

// 활동 완료 처리
PATCH /api/development-plans/:planId/activities/:activityIndex
{
  "completed": true
}

// 이슈 추가
POST /api/development-plans/:planId/issues
{
  "issue": "재료 수급 지연",
  "severity": "high",
  "assigned_to": "김철수"
}
```

---

## 📋 금형체크리스트 관리

### 체크리스트 구조

금형체크리스트는 **8개 카테고리**로 구성되며, 제작완료, 수리완료, 정기점검, 이관전 등 다양한 시점에 사용됩니다.

```
[금형체크리스트]
  ├─ 1. 외관 점검 (Appearance)
  ├─ 2. 치수 점검 (Dimension)
  ├─ 3. 기능 점검 (Function)
  ├─ 4. 안전 점검 (Safety)
  ├─ 5. 구조 점검 (Structure)
  ├─ 6. 부품 점검 (Parts)
  ├─ 7. 성능 점검 (Performance)
  └─ 8. 문서 점검 (Documentation)
```

### 테이블 구조

#### 1. mold_project (금형체크리스트 - 메인)

```javascript
{
  mold_id: 1,
  checklist_type: "제작완료", // '제작완료', '수리완료', '정기점검', '이관전', '기타'
  checklist_date: "2024-03-15",
  inspector_id: 5,
  inspector_name: "김철수",
  department: "품질관리팀",
  
  // 금형 기본 정보 (자동 입력)
  mold_code: "M-2024-001",
  mold_name: "GV80 프론트 범퍼",
  part_number: "P-2024-001",
  maker_name: "대한금형",
  
  // 8개 카테고리별 점검 결과 (JSONB)
  appearance_check: {
    surface_condition: {status: "OK", notes: "표면 상태 양호"},
    rust_corrosion: {status: "OK", notes: "녹/부식 없음"},
    scratches_dents: {status: "NG", notes: "코어부 미세 스크래치 발견"},
    cleanliness: {status: "OK", notes: "청결 상태 양호"}
  },
  
  dimension_check: {
    cavity_dimensions: {status: "OK", measured: "100.02mm", standard: "100±0.05mm"},
    core_dimensions: {status: "OK", measured: "99.98mm", standard: "100±0.05mm"},
    parting_line: {status: "OK", notes: "파팅라인 정렬 양호"},
    gate_size: {status: "OK", measured: "2.5mm", standard: "2.5±0.1mm"}
  },
  
  function_check: {
    ejector_operation: {status: "OK", notes: "이젝터 12개 정상 작동"},
    slide_operation: {status: "OK", notes: "슬라이드 2개 정상"},
    lifter_operation: {status: "OK", notes: "리프터 4개 정상"},
    cooling_channels: {status: "OK", notes: "냉각수로 막힘 없음"},
    hot_runner: {status: "OK", notes: "핫러너 정상 작동"}
  },
  
  safety_check: {
    sharp_edges: {status: "OK", notes: "날카로운 모서리 없음"},
    pinch_points: {status: "OK", notes: "끼임 위험 없음"},
    guard_installation: {status: "OK", notes: "안전 가드 설치 완료"},
    emergency_stop: {status: "OK", notes: "비상정지 장치 정상"}
  },
  
  structure_check: {
    mounting_holes: {status: "OK", notes: "장착 구멍 4개 정상"},
    guide_pins: {status: "OK", notes: "가이드 핀 정렬 양호"},
    locating_ring: {status: "OK", notes: "로케이팅 링 정상"},
    sprue_bushing: {status: "OK", notes: "스프루 부싱 정상"}
  },
  
  parts_check: {
    ejector_pins: {status: "OK", count: 12, notes: "전체 정상"},
    return_pins: {status: "OK", count: 4, notes: "리턴 핀 정상"},
    springs: {status: "OK", count: 8, notes: "스프링 장력 정상"},
    bolts_screws: {status: "OK", notes: "모든 볼트 체결 확인"}
  },
  
  performance_check: {
    cycle_time: {status: "OK", measured: "45s", target: "45s"},
    shot_weight: {status: "OK", measured: "125g", target: "125±2g"},
    cooling_efficiency: {status: "OK", notes: "냉각 효율 양호"},
    part_quality: {status: "OK", notes: "성형품 품질 양호"}
  },
  
  documentation_check: {
    drawings_available: {status: "OK", notes: "도면 완비"},
    specifications: {status: "OK", notes: "사양서 확인"},
    maintenance_manual: {status: "OK", notes: "정비 매뉴얼 제공"},
    parts_list: {status: "OK", notes: "부품 리스트 확인"}
  },
  
  // 종합 결과
  total_items: 32,
  ok_items: 31,
  ng_items: 1,
  na_items: 0,
  pass_rate: 96.88, // (31/32) * 100
  overall_result: "conditional_pass", // NG 1개 있지만 조건부 합격
  
  // 특이사항 및 조치사항
  special_notes: "코어부 미세 스크래치 발견",
  corrective_actions: "스크래치 부위 연마 처리 필요",
  follow_up_required: true,
  follow_up_date: "2024-03-20",
  
  // 승인
  approval_required: true,
  approval_status: "approved",
  approved_by: 3,
  approved_at: "2024-03-15T16:30:00Z",
  approval_comments: "조치 후 재검사 조건으로 승인",
  
  // 첨부
  images: [
    {category: "외관", url: "...", description: "코어부 스크래치 사진"},
    {category: "전체", url: "...", description: "금형 전체 사진"}
  ],
  attachments: [
    {name: "점검보고서.pdf", url: "...", uploaded_at: "2024-03-15T17:00:00Z"}
  ],
  
  // 서명
  inspector_signature: "data:image/png;base64,...",
  approver_signature: "data:image/png;base64,..."
}
```

#### 2. mold_project_items (체크리스트 상세 항목)

```javascript
// 각 점검 항목을 개별 레코드로 관리
{
  mold_project_id: 1,
  category: "외관",
  item_number: "1.1",
  item_name: "표면 상태",
  item_order: 1,
  
  inspection_standard: "표면에 크랙, 기포, 이물질이 없어야 함",
  acceptance_criteria: "육안 검사 시 결함 없음",
  
  status: "OK",
  measured_value: null,
  standard_value: null,
  
  notes: "표면 상태 양호",
  defect_description: null,
  corrective_action: null,
  
  is_critical: true, // 필수 항목
  severity: "high",
  
  images: []
}
```

### 8개 카테고리 상세

#### 1. 외관 점검 (Appearance Check)
- 표면 상태 (Surface Condition)
- 녹/부식 (Rust/Corrosion)
- 스크래치/찌그러짐 (Scratches/Dents)
- 청결도 (Cleanliness)

#### 2. 치수 점검 (Dimension Check)
- 캐비티 치수 (Cavity Dimensions)
- 코어 치수 (Core Dimensions)
- 파팅라인 (Parting Line)
- 게이트 크기 (Gate Size)

#### 3. 기능 점검 (Function Check)
- 이젝터 작동 (Ejector Operation)
- 슬라이드 작동 (Slide Operation)
- 리프터 작동 (Lifter Operation)
- 냉각수로 (Cooling Channels)
- 핫러너 (Hot Runner)

#### 4. 안전 점검 (Safety Check)
- 날카로운 모서리 (Sharp Edges)
- 끼임 위험 (Pinch Points)
- 안전 가드 설치 (Guard Installation)
- 비상정지 장치 (Emergency Stop)

#### 5. 구조 점검 (Structure Check)
- 장착 구멍 (Mounting Holes)
- 가이드 핀 (Guide Pins)
- 로케이팅 링 (Locating Ring)
- 스프루 부싱 (Sprue Bushing)

#### 6. 부품 점검 (Parts Check)
- 이젝터 핀 (Ejector Pins)
- 리턴 핀 (Return Pins)
- 스프링 (Springs)
- 볼트/나사 (Bolts/Screws)

#### 7. 성능 점검 (Performance Check)
- 사이클 타임 (Cycle Time)
- 샷 중량 (Shot Weight)
- 냉각 효율 (Cooling Efficiency)
- 성형품 품질 (Part Quality)

#### 8. 문서 점검 (Documentation Check)
- 도면 완비 (Drawings Available)
- 사양서 (Specifications)
- 정비 매뉴얼 (Maintenance Manual)
- 부품 리스트 (Parts List)

### 자동 계산 로직

```javascript
// 체크리스트 결과 자동 계산
async function calculateChecklistResult(projectId) {
  const project = await MoldProject.findByPk(projectId);
  
  // 1. 모든 카테고리의 항목 수집
  const categories = [
    'appearance_check',
    'dimension_check',
    'function_check',
    'safety_check',
    'structure_check',
    'parts_check',
    'performance_check',
    'documentation_check'
  ];
  
  let totalItems = 0;
  let okItems = 0;
  let ngItems = 0;
  let naItems = 0;
  
  // 2. 각 카테고리별 집계
  for (const category of categories) {
    const checkData = project[category];
    if (checkData) {
      for (const [key, value] of Object.entries(checkData)) {
        totalItems++;
        if (value.status === 'OK') okItems++;
        else if (value.status === 'NG') ngItems++;
        else if (value.status === 'N/A') naItems++;
      }
    }
  }
  
  // 3. 합격률 계산
  const passRate = totalItems > 0 
    ? ((okItems / totalItems) * 100).toFixed(2)
    : 0;
  
  // 4. 종합 결과 판정
  let overallResult;
  if (ngItems === 0) {
    overallResult = 'pass';
  } else if (ngItems <= 2 && passRate >= 90) {
    overallResult = 'conditional_pass';
  } else {
    overallResult = 'fail';
  }
  
  // 5. 업데이트
  await project.update({
    total_items: totalItems,
    ok_items: okItems,
    ng_items: ngItems,
    na_items: naItems,
    pass_rate: passRate,
    overall_result: overallResult
  });
  
  return project;
}
```

### API 엔드포인트

```javascript
// 체크리스트 생성
POST /api/molds/:moldId/checklist
{
  "checklist_type": "제작완료",
  "checklist_date": "2024-03-15",
  "inspector_id": 5
}

// 체크리스트 조회
GET /api/molds/:moldId/checklist/:checklistId

// 카테고리별 점검 결과 업데이트
PATCH /api/checklist/:checklistId/category/:categoryName
{
  "surface_condition": {"status": "OK", "notes": "양호"},
  "rust_corrosion": {"status": "OK", "notes": ""}
}

// 개별 항목 업데이트
PATCH /api/checklist/:checklistId/items/:itemId
{
  "status": "NG",
  "notes": "스크래치 발견",
  "defect_description": "코어부 미세 스크래치",
  "corrective_action": "연마 처리 필요"
}

// 승인 처리
POST /api/checklist/:checklistId/approve
{
  "approval_status": "approved",
  "approval_comments": "조건부 승인"
}

// 체크리스트 목록 조회
GET /api/molds/:moldId/checklists?type=제작완료&from=2024-01-01&to=2024-12-31
```

### 체크리스트 템플릿

```javascript
// 체크리스트 타입별 기본 템플릿 제공
const checklistTemplates = {
  "제작완료": {
    appearance_check: {
      surface_condition: {status: "", notes: ""},
      rust_corrosion: {status: "", notes: ""},
      scratches_dents: {status: "", notes: ""},
      cleanliness: {status: "", notes: ""}
    },
    dimension_check: { /* ... */ },
    // ... 8개 카테고리 전체
  },
  "수리완료": {
    // 수리 관련 항목 중심
  },
  "정기점검": {
    // 점검 항목 중심
  },
  "이관전": {
    // 이관 전 확인 항목
  }
};

// 템플릿 적용
async function createChecklistFromTemplate(moldId, type) {
  const template = checklistTemplates[type];
  
  const checklist = await MoldProject.create({
    mold_id: moldId,
    checklist_type: type,
    checklist_date: new Date(),
    ...template
  });
  
  return checklist;
}
```

---

## 🎯 체크리스트 마스터 템플릿 관리

### 템플릿 관리 구조

본사 관리자가 체크리스트 템플릿을 생성, 수정, 배포하고 전체 시스템에 적용합니다.

```
[본사 관리자]
    ↓ 템플릿 생성/수정
[체크리스트 마스터 템플릿]
    ↓ 승인
[템플릿 배포]
    ↓ 자동 적용
[협력사/제작처]
    ↓ 템플릿 사용
[체크리스트 작성]
```

### 테이블 구조

#### 1. checklist_master_templates (마스터 템플릿)

```javascript
{
  template_name: "제작완료 표준 체크리스트",
  template_code: "TMPL-PROD-001",
  checklist_type: "제작완료",
  
  // 버전 관리
  version: "v2.1",
  version_number: 21,
  is_active: true,
  
  description: "금형 제작 완료 시 사용하는 표준 체크리스트",
  usage_guide: "제작처에서 금형 제작 완료 후 품질 확인 시 사용",
  
  // 8개 카테고리 템플릿
  appearance_check_template: {
    surface_condition: {
      item_name: "표면 상태",
      inspection_standard: "표면에 크랙, 기포, 이물질이 없어야 함",
      acceptance_criteria: "육안 검사 시 결함 없음",
      is_required: true,
      is_critical: true,
      severity: "high",
      order: 1
    },
    rust_corrosion: {
      item_name: "녹/부식",
      inspection_standard: "녹 또는 부식이 없어야 함",
      acceptance_criteria: "육안 검사 시 녹/부식 없음",
      is_required: true,
      is_critical: false,
      severity: "medium",
      order: 2
    }
    // ... 더 많은 항목
  },
  
  dimension_check_template: { /* ... */ },
  function_check_template: { /* ... */ },
  safety_check_template: { /* ... */ },
  structure_check_template: { /* ... */ },
  parts_check_template: { /* ... */ },
  performance_check_template: { /* ... */ },
  documentation_check_template: { /* ... */ },
  
  // 적용 대상
  applicable_to: ["모든 금형"],
  mold_types: ["사출금형", "프레스금형"],
  
  // 승인 설정
  approval_required: true,
  approval_levels: 2, // 2단계 승인
  
  // 배포 정보
  deployed_count: 15,
  last_deployed_at: "2024-03-01T10:00:00Z",
  deployed_by: 1,
  
  // 통계
  usage_count: 245,
  average_pass_rate: 94.5,
  
  created_by: 1, // 본사 관리자
  updated_by: 1,
  approved_by: 2,
  approved_at: "2024-02-28T16:00:00Z"
}
```

#### 2. checklist_template_items (템플릿 항목 상세)

```javascript
{
  template_id: 1,
  category: "외관",
  item_number: "1.1",
  item_code: "APP-001",
  item_name: "표면 상태",
  item_order: 1,
  
  inspection_standard: "표면에 크랙, 기포, 이물질이 없어야 함",
  acceptance_criteria: "육안 검사 시 결함 없음",
  inspection_method: "육안검사",
  
  requires_measurement: false,
  
  is_required: true,
  is_critical: true, // 이 항목이 NG면 전체 불합격
  severity: "high",
  
  reference_document: "품질검사 매뉴얼 3.1절",
  reference_image_url: "https://...",
  notes: "조명을 충분히 확보하고 검사",
  
  is_active: true
}
```

### 템플릿 생성 및 수정

```javascript
// 템플릿 생성
async function createChecklistTemplate(templateData, userId) {
  // 1. 템플릿 코드 자동 생성
  const templateCode = await generateTemplateCode(templateData.checklist_type);
  
  // 2. 템플릿 생성
  const template = await ChecklistMasterTemplate.create({
    ...templateData,
    template_code: templateCode,
    version: "v1.0",
    version_number: 1,
    is_active: false, // 승인 전까지 비활성
    created_by: userId
  });
  
  // 3. 템플릿 항목 생성
  if (templateData.items) {
    for (const item of templateData.items) {
      await ChecklistTemplateItem.create({
        template_id: template.id,
        ...item
      });
    }
  }
  
  // 4. 변경 이력 기록
  await ChecklistTemplateHistory.create({
    template_id: template.id,
    change_type: 'created',
    changed_by: userId,
    new_data: template.toJSON(),
    change_description: '새 템플릿 생성'
  });
  
  return template;
}

// 템플릿 수정
async function updateChecklistTemplate(templateId, updates, userId) {
  const template = await ChecklistMasterTemplate.findByPk(templateId);
  const previousData = template.toJSON();
  
  // 1. 버전 증가
  const newVersionNumber = template.version_number + 1;
  const newVersion = `v${Math.floor(newVersionNumber / 10)}.${newVersionNumber % 10}`;
  
  // 2. 템플릿 업데이트
  await template.update({
    ...updates,
    version: newVersion,
    version_number: newVersionNumber,
    updated_by: userId,
    is_active: false // 재승인 필요
  });
  
  // 3. 변경 이력 기록
  await ChecklistTemplateHistory.create({
    template_id: templateId,
    change_type: 'updated',
    changed_by: userId,
    previous_data: previousData,
    new_data: template.toJSON(),
    change_description: '템플릿 수정',
    affected_fields: Object.keys(updates),
    requires_approval: true,
    approval_status: 'pending'
  });
  
  return template;
}
```

### 템플릿 승인

```javascript
// 템플릿 승인
async function approveTemplate(templateId, approverId) {
  const template = await ChecklistMasterTemplate.findByPk(templateId);
  
  // 1. 기존 활성 템플릿 비활성화
  await ChecklistMasterTemplate.update(
    { is_active: false },
    {
      where: {
        checklist_type: template.checklist_type,
        is_active: true,
        id: { [Op.ne]: templateId }
      }
    }
  );
  
  // 2. 새 템플릿 활성화
  await template.update({
    is_active: true,
    approved_by: approverId,
    approved_at: new Date()
  });
  
  // 3. 이력 업데이트
  await ChecklistTemplateHistory.update(
    {
      approval_status: 'approved',
      approved_by: approverId,
      approved_at: new Date()
    },
    {
      where: {
        template_id: templateId,
        approval_status: 'pending'
      }
    }
  );
  
  return template;
}
```

### 템플릿 배포

```javascript
// 템플릿 배포
async function deployTemplate(templateId, deploymentOptions, userId) {
  const template = await ChecklistMasterTemplate.findByPk(templateId);
  
  // 1. 배포 대상 결정
  let targetUsers = [];
  if (deploymentOptions.scope === 'all') {
    targetUsers = await User.findAll({
      where: { role: ['plant', 'maker'] }
    });
  } else if (deploymentOptions.scope === 'specific_plants') {
    targetUsers = await User.findAll({
      where: {
        role: 'plant',
        id: { [Op.in]: deploymentOptions.target_plants }
      }
    });
  }
  
  // 2. 배포 레코드 생성
  const deployment = await ChecklistTemplateDeployment.create({
    template_id: templateId,
    deployment_version: template.version,
    deployed_by: userId,
    deployment_scope: deploymentOptions.scope,
    target_users: targetUsers.map(u => u.id),
    target_plants: deploymentOptions.target_plants,
    deployment_type: deploymentOptions.type || 'update',
    change_summary: deploymentOptions.change_summary,
    deployment_status: 'in_progress',
    total_targets: targetUsers.length
  });
  
  // 3. 각 대상에게 배포
  let successCount = 0;
  let failCount = 0;
  
  for (const user of targetUsers) {
    try {
      // 사용자별 템플릿 적용
      await applyTemplateToUser(user.id, template);
      
      // 알림 발송
      await Notification.create({
        user_id: user.id,
        type: 'template_update',
        title: '체크리스트 템플릿 업데이트',
        message: `${template.template_name} (${template.version})이 배포되었습니다.`,
        related_id: template.id,
        priority: 'medium'
      });
      
      successCount++;
    } catch (error) {
      failCount++;
      console.error(`Failed to deploy to user ${user.id}:`, error);
    }
  }
  
  // 4. 배포 완료 처리
  await deployment.update({
    deployment_status: 'completed',
    deployment_progress: 100,
    successful_deployments: successCount,
    failed_deployments: failCount,
    notification_sent: true,
    notification_sent_at: new Date(),
    completed_at: new Date()
  });
  
  // 5. 템플릿 배포 횟수 증가
  await template.update({
    deployed_count: template.deployed_count + 1,
    last_deployed_at: new Date(),
    deployed_by: userId
  });
  
  // 6. 이력 기록
  await ChecklistTemplateHistory.create({
    template_id: templateId,
    change_type: 'deployed',
    changed_by: userId,
    change_description: `템플릿 배포 완료 (${successCount}/${targetUsers.length})`
  });
  
  return deployment;
}

// 사용자에게 템플릿 적용
async function applyTemplateToUser(userId, template) {
  // 사용자의 기존 템플릿 설정 업데이트 또는 생성
  await UserTemplateSettings.upsert({
    user_id: userId,
    template_id: template.id,
    template_version: template.version,
    applied_at: new Date(),
    is_active: true
  });
}
```

### 템플릿 롤백

```javascript
// 템플릿 롤백
async function rollbackTemplate(deploymentId, userId) {
  const deployment = await ChecklistTemplateDeployment.findByPk(deploymentId);
  
  if (!deployment.can_rollback) {
    throw new Error('이 배포는 롤백할 수 없습니다.');
  }
  
  if (new Date() > new Date(deployment.rollback_available_until)) {
    throw new Error('롤백 가능 기간이 만료되었습니다.');
  }
  
  const previousTemplate = await ChecklistMasterTemplate.findByPk(
    deployment.previous_template_id
  );
  
  // 이전 템플릿으로 재배포
  await deployTemplate(
    previousTemplate.id,
    {
      scope: deployment.deployment_scope,
      target_plants: deployment.target_plants,
      type: 'rollback',
      change_summary: `${deployment.deployment_version}에서 ${previousTemplate.version}으로 롤백`
    },
    userId
  );
  
  // 롤백 기록
  await ChecklistTemplateHistory.create({
    template_id: deployment.template_id,
    change_type: 'rollback',
    changed_by: userId,
    change_description: `템플릿 롤백: ${deployment.deployment_version} → ${previousTemplate.version}`
  });
}
```

### API 엔드포인트

```javascript
// 템플릿 관리 (본사 관리자만)
POST /api/admin/checklist-templates
GET /api/admin/checklist-templates
GET /api/admin/checklist-templates/:id
PUT /api/admin/checklist-templates/:id
DELETE /api/admin/checklist-templates/:id

// 템플릿 승인
POST /api/admin/checklist-templates/:id/approve

// 템플릿 배포
POST /api/admin/checklist-templates/:id/deploy
{
  "scope": "all", // 'all', 'specific_plants', 'specific_makers'
  "target_plants": [1, 2, 3],
  "type": "update",
  "change_summary": "외관 점검 항목 2개 추가"
}

// 배포 이력 조회
GET /api/admin/checklist-templates/:id/deployments

// 템플릿 롤백
POST /api/admin/template-deployments/:deploymentId/rollback

// 템플릿 변경 이력
GET /api/admin/checklist-templates/:id/history

// 템플릿 통계
GET /api/admin/checklist-templates/:id/statistics

// 사용자용 - 현재 활성 템플릿 조회
GET /api/checklist-templates/active?type=제작완료
```

### 템플릿 버전 관리

```javascript
// 버전 비교
async function compareTemplateVersions(templateId1, templateId2) {
  const template1 = await ChecklistMasterTemplate.findByPk(templateId1);
  const template2 = await ChecklistMasterTemplate.findByPk(templateId2);
  
  const differences = {
    version_change: {
      from: template1.version,
      to: template2.version
    },
    added_items: [],
    removed_items: [],
    modified_items: []
  };
  
  // 카테고리별 비교
  const categories = [
    'appearance_check_template',
    'dimension_check_template',
    'function_check_template',
    'safety_check_template',
    'structure_check_template',
    'parts_check_template',
    'performance_check_template',
    'documentation_check_template'
  ];
  
  for (const category of categories) {
    const items1 = template1[category] || {};
    const items2 = template2[category] || {};
    
    // 추가된 항목
    for (const key in items2) {
      if (!items1[key]) {
        differences.added_items.push({
          category,
          item: key,
          data: items2[key]
        });
      }
    }
    
    // 제거된 항목
    for (const key in items1) {
      if (!items2[key]) {
        differences.removed_items.push({
          category,
          item: key,
          data: items1[key]
        });
      }
    }
    
    // 수정된 항목
    for (const key in items1) {
      if (items2[key] && JSON.stringify(items1[key]) !== JSON.stringify(items2[key])) {
        differences.modified_items.push({
          category,
          item: key,
          before: items1[key],
          after: items2[key]
        });
      }
    }
  }
  
  return differences;
}
```

---

## 📝 협력사 문서 마스터 관리 및 리비젼 시스템

### 문서 관리 구조

협력사에서 작성하는 모든 자료(일상점검, 정기점검, 수리요청, 습합점검, 세척점검 등)는 본사 관리자가 마스터 템플릿을 관리하고 리비젼을 통해 버전 관리합니다.

```
[협력사 문서 작성]
    ↓ 본사 검토
[본사 관리자 수정]
    ↓ 리비젼 생성
[승인 프로세스]
    ↓ 승인 완료
[자동 배포]
    ↓ 전체 협력사 적용
[리비젼 관리]
```

### 관리 대상 문서

#### 1. 점검 관련 문서
- **일상점검** (daily_checks)
- **정기점검** (inspections)
- **습합점검** (fitting_checks)
- **세척점검** (cleaning_checks)

#### 2. 수리 관련 문서
- **수리요청** (repairs)
- **수리관리표** (repair_management)
- **수리진행현황** (repair_progress)

#### 3. 이관 관련 문서
- **이관요청** (transfer_logs)
- **이관관리** (transfer_management)
- **이관체크리스트** (transfer_checklist)

#### 4. 기타 문서
- **금형체크리스트** (mold_project)
- **금형개발계획** (development_plan)

---

### 테이블 구조

#### 1. document_master_templates (문서 마스터 템플릿)

```javascript
{
  template_name: "일상점검 표준 양식",
  template_code: "DOC-DAILY-001",
  document_type: "daily_check",
  category: "점검",
  
  // 버전 관리
  version: "v2.3",
  version_number: 23,
  is_active: true,
  
  // 템플릿 구조 정의
  template_structure: {
    fields: [
      {
        name: "check_date",
        type: "date",
        required: true,
        label: "점검일자",
        validation: "required|date"
      },
      {
        name: "findings",
        type: "textarea",
        required: false,
        label: "발견사항",
        maxLength: 500
      },
      {
        name: "corrective_actions",
        type: "textarea",
        required: true,
        label: "조치사항",
        maxLength: 500
      }
    ],
    sections: [
      {
        name: "기본정보",
        fields: ["check_date", "inspector", "mold_code"]
      },
      {
        name: "점검내용",
        fields: ["findings", "corrective_actions", "images"]
      }
    ]
  },
  
  // 필수/선택 필드
  required_fields: ["check_date", "inspector", "corrective_actions"],
  optional_fields: ["findings", "images", "notes"],
  
  // 유효성 검사 규칙
  validation_rules: {
    check_date: "required|date|not_future",
    corrective_actions: "required|min:10|max:500"
  },
  
  // 적용 대상
  applicable_to: ["모든 협력사"],
  target_roles: ["plant", "maker"],
  
  // 승인 설정
  approval_required: true,
  approval_workflow: {
    levels: [
      {level: 1, role: "hq_manager", required: true},
      {level: 2, role: "admin", required: true}
    ]
  },
  
  // 배포 정보
  deployed_count: 25,
  last_deployed_at: "2024-03-15T10:00:00Z",
  deployed_by: 1,
  
  // 통계
  usage_count: 1250,
  completion_rate: 94.5,
  
  created_by: 1, // 본사 관리자
  approved_by: 2
}
```

#### 2. document_revisions (문서 리비젼 관리)

```javascript
{
  document_type: "daily_check",
  document_id: 1523, // 협력사가 작성한 일상점검 ID
  template_id: 1,
  
  // 리비젼 정보
  revision_number: 2,
  revision_type: "major", // 'minor', 'major', 'patch'
  revision_reason: "점검 항목 누락 수정",
  
  // 변경 내용
  previous_data: {
    findings: "이상 없음",
    corrective_actions: ""
  },
  current_data: {
    findings: "이상 없음",
    corrective_actions: "정기 윤활 실시 완료"
  },
  changes_summary: "조치사항 필드 추가 입력",
  changed_fields: ["corrective_actions"],
  
  // 변경자 정보
  modified_by: 1, // 본사 관리자
  modified_by_role: "admin",
  modification_source: "admin_correction",
  
  // 승인 정보
  requires_approval: true,
  approval_status: "approved",
  approved_by: 2,
  approved_at: "2024-03-15T14:30:00Z",
  approval_comments: "필수 항목 누락 수정 승인",
  
  // 배포 정보
  is_deployed: true,
  deployed_at: "2024-03-15T15:00:00Z",
  deployment_id: 45,
  
  // 영향 범위
  affected_users: [15, 16, 17], // 해당 협력사 사용자들
  affected_plants: [5], // 협력사 ID
  impact_level: "medium",
  
  // 롤백 정보
  can_rollback: true,
  rollback_available_until: "2024-03-22T15:00:00Z", // 7일간 롤백 가능
  is_rolled_back: false
}
```

#### 3. template_deployment_log (템플릿 배포 로그)

```javascript
{
  template_id: 1,
  template_type: "document",
  
  // 배포 정보
  deployment_version: "v2.3",
  deployment_date: "2024-03-15T15:00:00Z",
  deployed_by: 1,
  
  // 배포 범위
  deployment_scope: "all", // 'all', 'specific_plants', 'specific_users'
  target_users: null, // 전체 배포
  target_plants: null,
  target_document_types: ["daily_check"],
  
  // 배포 방식
  deployment_method: "immediate",
  deployment_strategy: "replace_all", // 'replace_all', 'merge', 'append'
  
  // 배포 상태
  deployment_status: "completed",
  deployment_progress: 100,
  
  // 배포 결과
  total_targets: 50, // 50개 협력사
  successful_deployments: 48,
  failed_deployments: 2,
  
  // 영향 분석
  affected_documents_count: 1250, // 영향받는 기존 문서 수
  affected_users_count: 150,
  
  // 변경 사항
  change_summary: "조치사항 필드 필수 입력으로 변경",
  change_details: {
    added_fields: [],
    removed_fields: [],
    modified_fields: [
      {
        field: "corrective_actions",
        before: {required: false},
        after: {required: true}
      }
    ]
  },
  
  // 알림
  notification_sent: true,
  notification_sent_at: "2024-03-15T15:05:00Z",
  
  // 롤백 정보
  can_rollback: true,
  previous_template_id: 1, // 이전 버전
  
  completed_at: "2024-03-15T15:30:00Z"
}
```

---

### 문서 수정 및 배포 프로세스

#### Step 1: 협력사 문서 작성

```javascript
// 협력사가 일상점검 작성
POST /api/daily-checks
{
  "mold_id": 123,
  "check_date": "2024-03-15",
  "findings": "이상 없음",
  "corrective_actions": "", // 누락
  "images": []
}
```

#### Step 2: 본사 관리자 검토 및 수정

```javascript
// 본사 관리자가 수정 필요 발견
// 1. 수정 사항 기록
POST /api/admin/modifications
{
  "target_table": "daily_checks",
  "target_record_id": 1523,
  "mold_id": 123,
  "modification_type": "correction",
  "modification_reason": "필수 항목 누락",
  "previous_data": {
    "corrective_actions": ""
  },
  "new_data": {
    "corrective_actions": "정기 윤활 실시 완료"
  },
  "changed_fields": ["corrective_actions"],
  "modified_by": 1
}

// 2. 리비젼 생성
POST /api/admin/document-revisions
{
  "document_type": "daily_check",
  "document_id": 1523,
  "revision_type": "major",
  "revision_reason": "점검 항목 누락 수정",
  "previous_data": {...},
  "current_data": {...},
  "modified_by": 1
}
```

#### Step 3: 승인 프로세스

```javascript
// 승인 요청
POST /api/admin/modifications/:id/request-approval
{
  "approval_level": 1,
  "approver_id": 2,
  "comments": "필수 항목 누락 수정 요청"
}

// 승인 처리
POST /api/admin/modifications/:id/approve
{
  "approval_status": "approved",
  "comments": "승인 완료"
}
```

#### Step 4: 자동 배포

```javascript
// 승인 완료 후 자동 배포 트리거
async function autoDeployAfterApproval(modificationId) {
  const modification = await AdminModification.findByPk(modificationId);
  
  // 1. 배포 레코드 생성
  const deployment = await AutoDeployment.create({
    modification_id: modificationId,
    deployment_type: 'immediate',
    deployment_trigger: 'approval',
    target_scope: 'plant',
    target_plants: [modification.plant_id],
    deployment_status: 'in_progress'
  });
  
  // 2. 실제 데이터 업데이트
  await updateTargetRecord(
    modification.target_table,
    modification.target_record_id,
    modification.new_data
  );
  
  // 3. 리비젼 배포 처리
  await DocumentRevision.update(
    {
      is_deployed: true,
      deployed_at: new Date(),
      deployment_id: deployment.id
    },
    {
      where: {
        document_type: modification.target_table,
        document_id: modification.target_record_id
      }
    }
  );
  
  // 4. 알림 발송
  await sendNotificationToAffectedUsers(modification);
  
  // 5. 배포 완료
  await deployment.update({
    deployment_status: 'completed',
    deployment_progress: 100,
    success_count: 1,
    actual_deployment_time: new Date()
  });
}
```

#### Step 5: 템플릿 업데이트 및 전체 배포

```javascript
// 동일한 오류가 반복되면 템플릿 자체를 수정
async function updateTemplateAndDeploy(templateId, updates) {
  const template = await DocumentMasterTemplate.findByPk(templateId);
  
  // 1. 템플릿 버전 증가
  const newVersionNumber = template.version_number + 1;
  const newVersion = `v${Math.floor(newVersionNumber / 10)}.${newVersionNumber % 10}`;
  
  // 2. 템플릿 업데이트
  await template.update({
    ...updates,
    version: newVersion,
    version_number: newVersionNumber,
    is_active: false // 재승인 필요
  });
  
  // 3. 승인 후 전체 배포
  await deployTemplateToAll(template);
}

// 전체 협력사에 배포
async function deployTemplateToAll(template) {
  const allPlants = await User.findAll({
    where: { role: 'plant' }
  });
  
  const deployment = await TemplateDeploymentLog.create({
    template_id: template.id,
    deployment_version: template.version,
    deployed_by: userId,
    deployment_scope: 'all',
    deployment_method: 'immediate',
    deployment_strategy: 'replace_all',
    total_targets: allPlants.length
  });
  
  // 각 협력사에 알림
  for (const plant of allPlants) {
    await Notification.create({
      user_id: plant.id,
      type: 'template_update',
      title: '문서 양식 업데이트',
      message: `${template.template_name} (${template.version})이 업데이트되었습니다.`,
      related_id: template.id
    });
  }
  
  return deployment;
}
```

---

### 리비젼 관리 기능

#### 1. 리비젼 이력 조회

```javascript
// 특정 문서의 모든 리비젼 조회
GET /api/documents/:type/:id/revisions

Response:
{
  "document_type": "daily_check",
  "document_id": 1523,
  "revisions": [
    {
      "revision_number": 1,
      "revision_type": "minor",
      "modified_by": "김관리자",
      "modified_at": "2024-03-10T10:00:00Z",
      "changes_summary": "이미지 추가"
    },
    {
      "revision_number": 2,
      "revision_type": "major",
      "modified_by": "이관리자",
      "modified_at": "2024-03-15T14:30:00Z",
      "changes_summary": "조치사항 필드 추가 입력"
    }
  ]
}
```

#### 2. 리비젼 비교

```javascript
// 두 리비젼 간 차이 비교
GET /api/documents/:type/:id/revisions/compare?from=1&to=2

Response:
{
  "from_revision": 1,
  "to_revision": 2,
  "differences": {
    "added": [],
    "removed": [],
    "modified": [
      {
        "field": "corrective_actions",
        "before": "",
        "after": "정기 윤활 실시 완료"
      }
    ]
  }
}
```

#### 3. 리비젼 롤백

```javascript
// 이전 버전으로 롤백
POST /api/documents/:type/:id/revisions/:revisionId/rollback
{
  "reason": "잘못된 수정 복구",
  "rollback_to_revision": 1
}

// 롤백 처리
async function rollbackRevision(documentType, documentId, targetRevision) {
  const revision = await DocumentRevision.findOne({
    where: {
      document_type: documentType,
      document_id: documentId,
      revision_number: targetRevision
    }
  });
  
  if (!revision.can_rollback) {
    throw new Error('롤백 불가능한 리비젼입니다.');
  }
  
  // 1. 데이터 복원
  await updateTargetRecord(
    documentType,
    documentId,
    revision.previous_data
  );
  
  // 2. 롤백 기록
  await DocumentRevision.update(
    {
      is_rolled_back: true,
      rolled_back_at: new Date(),
      rolled_back_by: userId
    },
    {
      where: { id: revision.id }
    }
  );
  
  // 3. 새 리비젼 생성 (롤백 이력)
  await DocumentRevision.create({
    document_type: documentType,
    document_id: documentId,
    revision_number: revision.revision_number + 1,
    revision_type: 'rollback',
    revision_reason: '이전 버전으로 롤백',
    previous_data: revision.current_data,
    current_data: revision.previous_data,
    modified_by: userId
  });
}
```

---

### API 엔드포인트

```javascript
// 문서 마스터 템플릿 관리
POST   /api/admin/document-templates
GET    /api/admin/document-templates
GET    /api/admin/document-templates/:id
PUT    /api/admin/document-templates/:id
DELETE /api/admin/document-templates/:id

// 템플릿 배포
POST   /api/admin/document-templates/:id/deploy
GET    /api/admin/document-templates/:id/deployments

// 문서 수정 및 리비젼
POST   /api/admin/documents/:type/:id/revisions
GET    /api/admin/documents/:type/:id/revisions
GET    /api/admin/documents/:type/:id/revisions/:revisionId
POST   /api/admin/documents/:type/:id/revisions/:revisionId/rollback

// 리비젼 비교
GET    /api/admin/documents/:type/:id/revisions/compare

// 배포 로그
GET    /api/admin/template-deployments
GET    /api/admin/template-deployments/:id

// 협력사용 - 현재 활성 템플릿 조회
GET    /api/document-templates/active?type=daily_check
```

---

### 통계 및 모니터링

```javascript
// 템플릿 사용 통계
GET /api/admin/document-templates/:id/statistics

Response:
{
  "template_id": 1,
  "template_name": "일상점검 표준 양식",
  "version": "v2.3",
  "statistics": {
    "total_usage": 1250,
    "completion_rate": 94.5,
    "average_completion_time": "5.2 minutes",
    "error_rate": 2.3,
    "common_errors": [
      {"field": "corrective_actions", "count": 45, "percentage": 3.6}
    ],
    "revision_count": 15,
    "deployment_count": 25,
    "affected_plants": 50,
    "affected_users": 150
  }
}
```

---

## 결론

이 구조를 통해:
- ✅ 체계적인 데이터 흐름 관리
- ✅ 자동 연동으로 효율성 향상
- ✅ 외부 시스템 연동 준비
- ✅ 단계별 유연한 관리
- ✅ 데이터 일관성 보장
- ✅ 금형개발 5단계 체계적 관리
- ✅ 진행률 자동 계산 및 이력 관리
- ✅ 금형체크리스트 8개 카테고리 표준화
- ✅ 합격률 자동 계산 및 승인 프로세스
- ✅ 체크리스트 마스터 템플릿 중앙 관리
- ✅ 버전 관리 및 배포 자동화
- ✅ 템플릿 롤백 기능
- ✅ 협력사 문서 마스터 관리
- ✅ 문서 리비젼 및 버전 관리
- ✅ 자동 배포 및 알림 시스템
