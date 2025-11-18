# 데이터베이스 스키마 상세 명세
**QR + GPS 기반 금형관리시스템 Ver.09**

---

## 📊 테이블 구조 개요

총 **50개 테이블**로 구성되며, 10개 카테고리로 분류됩니다.

---

## 1. 사용자 및 권한

### 1.1 users (사용자)
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100),
  phone VARCHAR(20),
  role_group VARCHAR(20) NOT NULL, -- 'hq', 'plant', 'maker'
  role_detail VARCHAR(50),
  plant_id INTEGER,
  maker_id INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_role_group ON users(role_group);
CREATE INDEX idx_users_plant_id ON users(plant_id);
CREATE INDEX idx_users_maker_id ON users(maker_id);
```

### 1.2 qr_sessions (QR 세션)
```sql
CREATE TABLE qr_sessions (
  id SERIAL PRIMARY KEY,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  user_id INTEGER NOT NULL REFERENCES users(id),
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  expires_at TIMESTAMP NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_qr_sessions_token ON qr_sessions(session_token);
CREATE INDEX idx_qr_sessions_user ON qr_sessions(user_id);
```

---

## 2. 데이터 흐름 및 자동 연동

### 주요 테이블
- `mold_specifications` - 본사 금형제작사양 (1차 입력)
- `maker_specifications` - 제작처 사양 (자동 연동 + 추가 입력)
- `plant_molds` - 생산처 금형 (자동 연동)
- `stage_change_history` - 단계 변경 이력

### 2.1 mold_specifications (본사 금형제작사양)
```sql
CREATE TABLE mold_specifications (
  id SERIAL PRIMARY KEY,
  
  -- 기본 정보 (외부 시스템 연동 가능)
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
  external_system_id VARCHAR(100), -- 부품정보 시스템 ID
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
CREATE INDEX idx_mold_specifications_status ON mold_specifications(status);
```

### 2.2 maker_specifications (제작처 사양)
```sql
CREATE TABLE maker_specifications (
  id SERIAL PRIMARY KEY,
  specification_id INTEGER NOT NULL REFERENCES mold_specifications(id),
  maker_id INTEGER NOT NULL REFERENCES users(id),
  
  -- 본사 입력 항목 (읽기 전용, 자동 연동)
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
  
  -- 구조 정보
  cooling_type VARCHAR(50),
  ejection_type VARCHAR(50),
  hot_runner BOOLEAN,
  slide_count INTEGER,
  lifter_count INTEGER,
  
  -- 성능 정보
  cycle_time INTEGER, -- 초
  max_shots INTEGER,
  
  -- 제작 진행
  production_progress INTEGER DEFAULT 0, -- 0-100%
  current_stage VARCHAR(50),
  
  -- 도면 및 사진
  drawings JSONB, -- 도면 URL 배열
  production_images JSONB, -- 제작 과정 사진
  
  -- 완료 정보
  completed BOOLEAN DEFAULT FALSE,
  completed_date DATE,
  
  -- 상태
  status VARCHAR(20), -- 'pending', 'in_progress', 'completed'
  
  -- 연동 정보
  synced_from_hq BOOLEAN DEFAULT FALSE,
  synced_at TIMESTAMP,
  
  -- 기타
  notes TEXT,
  specifications JSONB, -- 상세 사양
  
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_maker_specifications_spec ON maker_specifications(specification_id);
CREATE INDEX idx_maker_specifications_maker ON maker_specifications(maker_id);
CREATE INDEX idx_maker_specifications_status ON maker_specifications(status);
```

### 2.3 plant_molds (생산처 금형)
```sql
CREATE TABLE plant_molds (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  plant_id INTEGER NOT NULL REFERENCES users(id),
  
  -- 금형 마스터 정보 (읽기 전용, 자동 연동)
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
CREATE INDEX idx_plant_molds_status ON plant_molds(status);
```

### 2.4 stage_change_history (단계 변경 이력)
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
CREATE INDEX idx_stage_change_date ON stage_change_history(changed_at);
```

---

## 3. 금형정보 관리

### 주요 테이블
- `molds` - 금형 마스터
- `mold_development` - 금형개발 (기본 정보)
- `development_plan` - 개발계획 (단계별 상세)
- `development_progress_history` - 개발 진행 이력
- `mold_project` - 금형체크리스트 (8개 카테고리)
- `mold_project_items` - 체크리스트 상세 항목
- `checklist_master_templates` - 체크리스트 마스터 템플릿
- `checklist_template_items` - 템플릿 항목 마스터
- `checklist_template_deployment` - 템플릿 배포 이력
- `checklist_template_history` - 템플릿 변경 이력
- `mold_replication` - 금형육성
- `mold_drawings` - 경도측정
- `maker_info` - 금형정보 요약

### 3.1 molds (금형 마스터)
```sql
CREATE TABLE molds (
  id SERIAL PRIMARY KEY,
  mold_code VARCHAR(50) UNIQUE NOT NULL,
  mold_name VARCHAR(200) NOT NULL,
  car_model VARCHAR(100),
  part_name VARCHAR(200),
  cavity INTEGER,
  plant_id INTEGER NOT NULL,
  maker_id INTEGER NOT NULL,
  qr_token VARCHAR(255) UNIQUE,
  sop_date DATE,
  eop_date DATE,
  target_shots INTEGER,
  status VARCHAR(20) DEFAULT 'active', -- 'active', 'repair', 'transfer', 'idle', 'scrapped'
  location VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_molds_plant ON molds(plant_id);
CREATE INDEX idx_molds_maker ON molds(maker_id);
CREATE INDEX idx_molds_qr_token ON molds(qr_token);
CREATE INDEX idx_molds_status ON molds(status);
```

### 2.2 mold_development (금형개발 - 기본 정보)
```sql
CREATE TABLE mold_development (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  
  -- 기본 정보
  development_type VARCHAR(50), -- '신규', '개조', '복제'
  development_stage VARCHAR(50), -- '기획', '설계', '제작', '시운전', '양산'
  
  -- 일정
  start_date DATE,
  target_date DATE,
  completion_date DATE,
  
  -- 예산
  budget DECIMAL(12, 2),
  actual_cost DECIMAL(12, 2),
  
  -- 담당자
  responsible_person VARCHAR(100),
  
  -- 전체 진행률
  overall_progress INTEGER DEFAULT 0, -- 0-100%
  
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mold_development_mold ON mold_development(mold_id);
CREATE INDEX idx_mold_development_stage ON mold_development(development_stage);
```

### 2.3 development_plan (개발계획 - 단계별 상세)
```sql
CREATE TABLE development_plan (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  development_id INTEGER REFERENCES mold_development(id),
  
  -- 단계 정보
  phase_number INTEGER NOT NULL, -- 1, 2, 3, 4, 5
  phase_name VARCHAR(100) NOT NULL, -- '기획', '설계', '제작', '시운전', '양산'
  phase_order INTEGER NOT NULL, -- 정렬 순서
  
  -- 일정
  planned_start_date DATE,
  planned_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- 진행률
  progress_percentage INTEGER DEFAULT 0, -- 0-100%
  
  -- 상태
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'delayed', 'on_hold'
  
  -- 주요 활동 및 산출물
  key_activities JSONB, -- [{"activity": "요구사항 분석", "completed": true}, ...]
  deliverables JSONB, -- [{"name": "기획서", "completed": true, "file_url": "..."}, ...]
  
  -- 마일스톤
  milestones JSONB, -- [{"name": "설계 검토", "date": "2024-03-15", "completed": true}, ...]
  
  -- 담당자 및 참여자
  responsible_person VARCHAR(100),
  team_members JSONB, -- [{"name": "홍길동", "role": "설계"}, ...]
  
  -- 이슈 및 리스크
  issues JSONB, -- [{"issue": "재료 수급 지연", "severity": "high", "status": "resolved"}, ...]
  risks JSONB, -- [{"risk": "납기 지연 가능성", "probability": "medium", "impact": "high"}, ...]
  
  -- 비용
  planned_cost DECIMAL(12, 2),
  actual_cost DECIMAL(12, 2),
  
  -- 품질 지표
  quality_metrics JSONB, -- {"defect_rate": 0.5, "rework_count": 2}
  
  -- 승인 정보
  approval_required BOOLEAN DEFAULT FALSE,
  approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  approval_comments TEXT,
  
  -- 첨부 파일
  attachments JSONB, -- [{"name": "설계도면.pdf", "url": "...", "uploaded_at": "..."}, ...]
  
  -- 메모
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_development_plan_mold ON development_plan(mold_id);
CREATE INDEX idx_development_plan_development ON development_plan(development_id);
CREATE INDEX idx_development_plan_phase ON development_plan(phase_number);
CREATE INDEX idx_development_plan_status ON development_plan(status);
```

### 2.3.1 development_progress_history (개발 진행 이력)
```sql
CREATE TABLE development_progress_history (
  id SERIAL PRIMARY KEY,
  development_plan_id INTEGER NOT NULL REFERENCES development_plan(id),
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  
  -- 변경 정보
  previous_progress INTEGER,
  new_progress INTEGER,
  previous_status VARCHAR(20),
  new_status VARCHAR(20),
  
  -- 변경 내용
  change_description TEXT,
  achievements TEXT, -- 달성 사항
  next_steps TEXT, -- 다음 단계
  
  -- 변경자
  updated_by INTEGER REFERENCES users(id),
  update_date TIMESTAMP DEFAULT NOW(),
  
  -- 첨부
  attachments JSONB,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_dev_progress_history_plan ON development_progress_history(development_plan_id);
CREATE INDEX idx_dev_progress_history_mold ON development_progress_history(mold_id);
CREATE INDEX idx_dev_progress_history_date ON development_progress_history(update_date);
```

### 2.4 mold_project (금형체크리스트)
```sql
CREATE TABLE mold_project (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  
  -- 기본 정보
  checklist_type VARCHAR(50), -- '제작완료', '수리완료', '정기점검', '이관전', '기타'
  checklist_date DATE NOT NULL,
  inspector_id INTEGER REFERENCES users(id), -- 점검자
  inspector_name VARCHAR(100),
  department VARCHAR(100), -- 부서
  
  -- 금형 기본 정보 (자동 입력)
  mold_code VARCHAR(50),
  mold_name VARCHAR(200),
  part_number VARCHAR(50),
  maker_name VARCHAR(200), -- 제작처
  
  -- 1. 외관 점검 (Appearance Check)
  appearance_check JSONB, -- {
    -- "surface_condition": {"status": "OK", "notes": "양호"},
    -- "rust_corrosion": {"status": "OK", "notes": ""},
    -- "scratches_dents": {"status": "NG", "notes": "코어부 미세 스크래치"},
    -- "cleanliness": {"status": "OK", "notes": ""}
  -- }
  
  -- 2. 치수 점검 (Dimension Check)
  dimension_check JSONB, -- {
    -- "cavity_dimensions": {"status": "OK", "measured": "100.02mm", "standard": "100±0.05mm"},
    -- "core_dimensions": {"status": "OK", "measured": "99.98mm", "standard": "100±0.05mm"},
    -- "parting_line": {"status": "OK", "notes": ""},
    -- "gate_size": {"status": "OK", "measured": "2.5mm", "standard": "2.5±0.1mm"}
  -- }
  
  -- 3. 기능 점검 (Function Check)
  function_check JSONB, -- {
    -- "ejector_operation": {"status": "OK", "notes": "정상 작동"},
    -- "slide_operation": {"status": "OK", "notes": "슬라이드 2개 정상"},
    -- "lifter_operation": {"status": "OK", "notes": ""},
    -- "cooling_channels": {"status": "OK", "notes": "냉각수로 막힘 없음"},
    -- "hot_runner": {"status": "OK", "notes": "핫러너 정상"}
  -- }
  
  -- 4. 안전 점검 (Safety Check)
  safety_check JSONB, -- {
    -- "sharp_edges": {"status": "OK", "notes": "날카로운 모서리 없음"},
    -- "pinch_points": {"status": "OK", "notes": ""},
    -- "guard_installation": {"status": "OK", "notes": "안전 가드 설치 완료"},
    -- "emergency_stop": {"status": "OK", "notes": "비상정지 장치 정상"}
  -- }
  
  -- 5. 구조 점검 (Structure Check)
  structure_check JSONB, -- {
    -- "mounting_holes": {"status": "OK", "notes": "장착 구멍 4개 정상"},
    -- "guide_pins": {"status": "OK", "notes": "가이드 핀 정렬 양호"},
    -- "locating_ring": {"status": "OK", "notes": ""},
    -- "sprue_bushing": {"status": "OK", "notes": "스프루 부싱 정상"}
  -- }
  
  -- 6. 부품 점검 (Parts Check)
  parts_check JSONB, -- {
    -- "ejector_pins": {"status": "OK", "count": 12, "notes": "전체 정상"},
    -- "return_pins": {"status": "OK", "count": 4, "notes": ""},
    -- "springs": {"status": "OK", "count": 8, "notes": "스프링 장력 정상"},
    -- "bolts_screws": {"status": "OK", "notes": "모든 볼트 체결 확인"}
  -- }
  
  -- 7. 성능 점검 (Performance Check)
  performance_check JSONB, -- {
    -- "cycle_time": {"status": "OK", "measured": "45s", "target": "45s"},
    -- "shot_weight": {"status": "OK", "measured": "125g", "target": "125±2g"},
    -- "cooling_efficiency": {"status": "OK", "notes": "냉각 효율 양호"},
    -- "part_quality": {"status": "OK", "notes": "성형품 품질 양호"}
  -- }
  
  -- 8. 문서 점검 (Documentation Check)
  documentation_check JSONB, -- {
    -- "drawings_available": {"status": "OK", "notes": "도면 완비"},
    -- "specifications": {"status": "OK", "notes": "사양서 확인"},
    -- "maintenance_manual": {"status": "OK", "notes": "정비 매뉴얼 제공"},
    -- "parts_list": {"status": "OK", "notes": "부품 리스트 확인"}
  -- }
  
  -- 종합 결과
  total_items INTEGER DEFAULT 0, -- 전체 점검 항목 수
  ok_items INTEGER DEFAULT 0, -- OK 항목 수
  ng_items INTEGER DEFAULT 0, -- NG 항목 수
  na_items INTEGER DEFAULT 0, -- N/A 항목 수
  
  pass_rate DECIMAL(5, 2), -- 합격률 (%)
  overall_result VARCHAR(20), -- 'pass', 'conditional_pass', 'fail'
  
  -- 특이사항 및 조치사항
  special_notes TEXT, -- 특이사항
  corrective_actions TEXT, -- 조치사항
  follow_up_required BOOLEAN DEFAULT FALSE, -- 후속 조치 필요 여부
  follow_up_date DATE, -- 후속 조치 예정일
  
  -- 승인
  approval_required BOOLEAN DEFAULT FALSE,
  approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  approval_comments TEXT,
  
  -- 첨부 파일
  images JSONB, -- [{"category": "외관", "url": "...", "description": "..."}, ...]
  attachments JSONB, -- [{"name": "점검보고서.pdf", "url": "...", "uploaded_at": "..."}, ...]
  
  -- 서명
  inspector_signature VARCHAR(500), -- 점검자 서명 (이미지 URL)
  approver_signature VARCHAR(500), -- 승인자 서명 (이미지 URL)
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mold_project_mold ON mold_project(mold_id);
CREATE INDEX idx_mold_project_type ON mold_project(checklist_type);
CREATE INDEX idx_mold_project_date ON mold_project(checklist_date);
CREATE INDEX idx_mold_project_result ON mold_project(overall_result);
```

### 2.4.1 mold_project_items (체크리스트 상세 항목)
```sql
CREATE TABLE mold_project_items (
  id SERIAL PRIMARY KEY,
  mold_project_id INTEGER NOT NULL REFERENCES mold_project(id),
  
  -- 항목 정보
  category VARCHAR(50) NOT NULL, -- '외관', '치수', '기능', '안전', '구조', '부품', '성능', '문서'
  item_number VARCHAR(20), -- 항목 번호 (1.1, 1.2, 2.1, ...)
  item_name VARCHAR(200) NOT NULL, -- 항목명
  item_order INTEGER, -- 정렬 순서
  
  -- 점검 기준
  inspection_standard TEXT, -- 점검 기준
  acceptance_criteria TEXT, -- 합격 기준
  
  -- 점검 결과
  status VARCHAR(10), -- 'OK', 'NG', 'N/A'
  measured_value VARCHAR(100), -- 측정값
  standard_value VARCHAR(100), -- 기준값
  
  -- 상세 정보
  notes TEXT, -- 비고
  defect_description TEXT, -- 불량 내용 (NG인 경우)
  corrective_action TEXT, -- 조치 방법
  
  -- 중요도
  is_critical BOOLEAN DEFAULT FALSE, -- 필수 항목 여부
  severity VARCHAR(20), -- 'low', 'medium', 'high', 'critical'
  
  -- 첨부
  images JSONB, -- 해당 항목 관련 이미지
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mold_project_items_project ON mold_project_items(mold_project_id);
CREATE INDEX idx_mold_project_items_category ON mold_project_items(category);
CREATE INDEX idx_mold_project_items_status ON mold_project_items(status);
```

### 2.4.2 checklist_master_templates (체크리스트 마스터 템플릿)
```sql
CREATE TABLE checklist_master_templates (
  id SERIAL PRIMARY KEY,
  
  -- 템플릿 정보
  template_name VARCHAR(200) NOT NULL, -- '제작완료 표준', '수리완료 표준', '정기점검 표준'
  template_code VARCHAR(50) UNIQUE NOT NULL, -- 'TMPL-PROD-001', 'TMPL-REPAIR-001'
  checklist_type VARCHAR(50) NOT NULL, -- '제작완료', '수리완료', '정기점검', '이관전'
  
  -- 버전 관리
  version VARCHAR(20) NOT NULL, -- 'v1.0', 'v1.1', 'v2.0'
  version_number INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE, -- 현재 활성 버전
  
  -- 템플릿 설명
  description TEXT,
  usage_guide TEXT, -- 사용 가이드
  
  -- 8개 카테고리 템플릿 (JSONB)
  appearance_check_template JSONB, -- {
    -- "surface_condition": {
    --   "item_name": "표면 상태",
    --   "inspection_standard": "표면에 크랙, 기포, 이물질이 없어야 함",
    --   "acceptance_criteria": "육안 검사 시 결함 없음",
    --   "is_required": true,
    --   "is_critical": true,
    --   "severity": "high",
    --   "order": 1
    -- }
  -- }
  
  dimension_check_template JSONB,
  function_check_template JSONB,
  safety_check_template JSONB,
  structure_check_template JSONB,
  parts_check_template JSONB,
  performance_check_template JSONB,
  documentation_check_template JSONB,
  
  -- 적용 대상
  applicable_to JSONB, -- ["모든 금형", "사출금형만", "프레스금형만"]
  mold_types JSONB, -- ["사출금형", "프레스금형", "다이캐스팅"]
  
  -- 승인 설정
  approval_required BOOLEAN DEFAULT TRUE,
  approval_levels INTEGER DEFAULT 1, -- 승인 단계 수
  
  -- 배포 정보
  deployed_count INTEGER DEFAULT 0, -- 배포된 횟수
  last_deployed_at TIMESTAMP,
  deployed_by INTEGER REFERENCES users(id),
  
  -- 통계
  usage_count INTEGER DEFAULT 0, -- 사용 횟수
  average_pass_rate DECIMAL(5, 2), -- 평균 합격률
  
  -- 관리 정보
  created_by INTEGER NOT NULL REFERENCES users(id), -- 생성자 (본사 관리자)
  updated_by INTEGER REFERENCES users(id), -- 수정자
  approved_by INTEGER REFERENCES users(id), -- 승인자
  approved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_checklist_master_type ON checklist_master_templates(checklist_type);
CREATE INDEX idx_checklist_master_active ON checklist_master_templates(is_active);
CREATE INDEX idx_checklist_master_version ON checklist_master_templates(version_number);
CREATE INDEX idx_checklist_master_code ON checklist_master_templates(template_code);
```

### 2.4.3 checklist_template_items (템플릿 항목 마스터)
```sql
CREATE TABLE checklist_template_items (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES checklist_master_templates(id),
  
  -- 항목 정보
  category VARCHAR(50) NOT NULL, -- '외관', '치수', '기능', '안전', '구조', '부품', '성능', '문서'
  item_number VARCHAR(20) NOT NULL, -- '1.1', '1.2', '2.1', ...
  item_code VARCHAR(50), -- 'APP-001', 'DIM-001'
  item_name VARCHAR(200) NOT NULL,
  item_order INTEGER NOT NULL,
  
  -- 점검 기준
  inspection_standard TEXT NOT NULL, -- 점검 기준
  acceptance_criteria TEXT NOT NULL, -- 합격 기준
  inspection_method VARCHAR(100), -- '육안검사', '측정', '기능시험'
  
  -- 측정 정보
  requires_measurement BOOLEAN DEFAULT FALSE,
  measurement_unit VARCHAR(20), -- 'mm', 'g', 's', '℃'
  standard_value VARCHAR(100), -- '100±0.05mm'
  tolerance_upper DECIMAL(10, 4), -- 상한 공차
  tolerance_lower DECIMAL(10, 4), -- 하한 공차
  
  -- 중요도
  is_required BOOLEAN DEFAULT TRUE, -- 필수 항목
  is_critical BOOLEAN DEFAULT FALSE, -- 필수 항목 (불합격 시 전체 불합격)
  severity VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  
  -- 참고 정보
  reference_document VARCHAR(200), -- 참고 문서
  reference_image_url VARCHAR(500), -- 참고 이미지
  notes TEXT, -- 비고
  
  -- 활성화
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_template_items_template ON checklist_template_items(template_id);
CREATE INDEX idx_template_items_category ON checklist_template_items(category);
CREATE INDEX idx_template_items_order ON checklist_template_items(item_order);
CREATE INDEX idx_template_items_code ON checklist_template_items(item_code);
```

### 2.4.4 checklist_template_deployment (템플릿 배포 이력)
```sql
CREATE TABLE checklist_template_deployment (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES checklist_master_templates(id),
  
  -- 배포 정보
  deployment_version VARCHAR(20) NOT NULL,
  deployment_date TIMESTAMP DEFAULT NOW(),
  deployed_by INTEGER NOT NULL REFERENCES users(id),
  
  -- 배포 대상
  deployment_scope VARCHAR(50), -- 'all', 'specific_plants', 'specific_makers'
  target_users JSONB, -- [1, 2, 3, ...] 대상 사용자 ID 배열
  target_plants JSONB, -- 대상 협력사
  target_makers JSONB, -- 대상 제작처
  
  -- 배포 내용
  deployment_type VARCHAR(50), -- 'new', 'update', 'patch'
  change_summary TEXT, -- 변경 사항 요약
  change_details JSONB, -- 상세 변경 내역
  
  -- 배포 상태
  deployment_status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed'
  deployment_progress INTEGER DEFAULT 0, -- 0-100%
  
  -- 배포 결과
  total_targets INTEGER DEFAULT 0, -- 전체 대상 수
  successful_deployments INTEGER DEFAULT 0, -- 성공 수
  failed_deployments INTEGER DEFAULT 0, -- 실패 수
  
  -- 알림
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMP,
  
  -- 롤백 정보
  can_rollback BOOLEAN DEFAULT TRUE,
  previous_template_id INTEGER REFERENCES checklist_master_templates(id),
  rollback_available_until TIMESTAMP,
  
  -- 메모
  deployment_notes TEXT,
  
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_template_deployment_template ON checklist_template_deployment(template_id);
CREATE INDEX idx_template_deployment_status ON checklist_template_deployment(deployment_status);
CREATE INDEX idx_template_deployment_date ON checklist_template_deployment(deployment_date);
```

### 2.4.5 checklist_template_history (템플릿 변경 이력)
```sql
CREATE TABLE checklist_template_history (
  id SERIAL PRIMARY KEY,
  template_id INTEGER NOT NULL REFERENCES checklist_master_templates(id),
  
  -- 변경 정보
  change_type VARCHAR(50) NOT NULL, -- 'created', 'updated', 'item_added', 'item_removed', 'item_modified', 'deployed', 'deactivated'
  change_date TIMESTAMP DEFAULT NOW(),
  changed_by INTEGER NOT NULL REFERENCES users(id),
  
  -- 변경 전후 데이터
  previous_data JSONB, -- 변경 전 데이터
  new_data JSONB, -- 변경 후 데이터
  
  -- 변경 상세
  change_description TEXT,
  affected_fields JSONB, -- 변경된 필드 목록
  
  -- 승인 정보
  requires_approval BOOLEAN DEFAULT FALSE,
  approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_template_history_template ON checklist_template_history(template_id);
CREATE INDEX idx_template_history_type ON checklist_template_history(change_type);
CREATE INDEX idx_template_history_date ON checklist_template_history(change_date);
```

### 2.5 mold_replication (금형육성)
```sql
CREATE TABLE mold_replication (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  replication_type VARCHAR(50), -- '신규육성', '추가육성', '대체육성'
  target_quantity INTEGER, -- 목표 육성 수량
  current_quantity INTEGER DEFAULT 0, -- 현재 육성 수량
  replication_reason TEXT, -- 육성 사유
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  responsible_maker_id INTEGER, -- 담당 제작처
  specifications JSONB, -- 육성 사양
  status VARCHAR(20), -- 'planned', 'in_progress', 'completed', 'cancelled'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 2.6 mold_drawings (경도측정)
```sql
CREATE TABLE mold_drawings (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  measurement_date DATE NOT NULL, -- 측정일
  measurement_location VARCHAR(100), -- 측정 위치 (캐비티, 코어, 슬라이드 등)
  hardness_value DECIMAL(5, 1), -- 경도값 (HRC)
  hardness_standard VARCHAR(50), -- 경도 기준 (HRC, HB, HV)
  target_hardness VARCHAR(50), -- 목표 경도 범위
  result VARCHAR(20), -- '적합', '부적합', '주의'
  measured_by VARCHAR(100), -- 측정자
  measurement_equipment VARCHAR(100), -- 측정 장비
  notes TEXT, -- 비고
  image_url VARCHAR(500), -- 측정 사진
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 2.7 maker_info (금형사양요약)
```sql
CREATE TABLE maker_info (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  -- 기본 사양
  material VARCHAR(100), -- 재질
  weight DECIMAL(10, 2), -- 중량(kg)
  dimensions VARCHAR(100), -- 치수 (LxWxH)
  cavity_count INTEGER, -- 캐비티 수
  
  -- 재질 정보
  core_material VARCHAR(100), -- 코어 재질
  cavity_material VARCHAR(100), -- 캐비티 재질
  hardness VARCHAR(50), -- 경도 (HRC)
  
  -- 구조 정보
  cooling_type VARCHAR(50), -- 냉각방식
  ejection_type VARCHAR(50), -- 이젝션 방식
  hot_runner BOOLEAN, -- 핫러너 유무
  slide_count INTEGER, -- 슬라이드 개수
  lifter_count INTEGER, -- 리프터 개수
  
  -- 성능 정보
  cycle_time INTEGER, -- 사이클 타임(초)
  max_shots INTEGER, -- 최대 타수
  
  -- 기타
  specifications JSONB, -- 상세 사양 (JSON)
  summary TEXT, -- 사양 요약
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

## 4. 사출정보 관리

### 주요 테이블
- `plant_info` - 사출조건 관리 (생산정보)
- `injection_conditions` - 사출조건 수정관리
- `production_lines` - 라인/사출기
- `revision_history` - 리비젼 관리
- `change_trend_analysis` - 변경이력 추이분석

### 4.1 plant_info (사출조건 관리 - 생산정보)
```sql
CREATE TABLE plant_info (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  production_line VARCHAR(100), -- 생산라인
  injection_machine VARCHAR(100), -- 사출기
  cycle_time INTEGER, -- 사이클 타임(초)
  temperature_settings JSONB, -- 온도 설정
  pressure_settings JSONB, -- 압력 설정
  speed_settings JSONB, -- 속도 설정
  material_type VARCHAR(100), -- 원재료
  color_code VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.2 injection_conditions (사출조건 수정관리)
```sql
CREATE TABLE injection_conditions (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  plant_info_id INTEGER REFERENCES plant_info(id),
  modified_by INTEGER REFERENCES users(id),
  modification_date TIMESTAMP DEFAULT NOW(),
  previous_conditions JSONB, -- 변경 전 조건
  new_conditions JSONB, -- 변경 후 조건
  reason TEXT, -- 변경 사유
  approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 production_lines (라인/사출기)
```sql
CREATE TABLE production_lines (
  id SERIAL PRIMARY KEY,
  plant_id INTEGER NOT NULL,
  line_code VARCHAR(50) UNIQUE NOT NULL,
  line_name VARCHAR(100),
  machine_code VARCHAR(50),
  machine_model VARCHAR(100),
  tonnage INTEGER, -- 톤수
  max_shot_weight INTEGER, -- 최대 사출량(g)
  status VARCHAR(20), -- 'active', 'maintenance', 'idle'
  location VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 4.4 revision_history (리비전 관리)
```sql
CREATE TABLE revision_history (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  revision_number VARCHAR(50) NOT NULL, -- 'Rev.01', 'Rev.02', ...
  revision_date DATE NOT NULL,
  revision_type VARCHAR(50), -- '설계변경', '사양변경', '조건변경', '수리변경'
  
  -- 변경 내용
  changed_by INTEGER REFERENCES users(id),
  change_category VARCHAR(50), -- '금형사양', '사출조건', '도면', '부품'
  change_description TEXT, -- 변경 내역 상세
  change_reason TEXT, -- 변경 사유
  
  -- 변경 전후 비교
  before_value JSONB, -- 변경 전 값
  after_value JSONB, -- 변경 후 값
  
  -- 승인 정보
  approval_required BOOLEAN DEFAULT FALSE,
  approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  
  -- 첨부 파일
  attachments JSONB, -- 관련 문서, 도면 등
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_revision_mold ON revision_history(mold_id);
CREATE INDEX idx_revision_number ON revision_history(revision_number);
CREATE INDEX idx_revision_date ON revision_history(revision_date);
```

### 4.5 change_trend_analysis (변경이력 추이분석)
```sql
CREATE TABLE change_trend_analysis (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  analysis_period VARCHAR(50), -- '월간', '분기', '연간'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  
  -- 변경 통계
  total_changes INTEGER DEFAULT 0, -- 총 변경 건수
  design_changes INTEGER DEFAULT 0, -- 설계 변경
  spec_changes INTEGER DEFAULT 0, -- 사양 변경
  condition_changes INTEGER DEFAULT 0, -- 조건 변경
  repair_changes INTEGER DEFAULT 0, -- 수리 변경
  
  -- 변경 빈도 분석
  change_frequency DECIMAL(5, 2), -- 월평균 변경 빈도
  change_trend VARCHAR(20), -- 'increasing', 'stable', 'decreasing'
  
  -- 주요 변경 사유
  top_change_reasons JSONB, -- [{"reason": "불량 개선", "count": 5}, ...]
  
  -- 영향 분석
  quality_impact VARCHAR(20), -- '개선', '유지', '악화'
  cost_impact DECIMAL(12, 2), -- 비용 영향
  downtime_hours INTEGER, -- 변경으로 인한 다운타임(시간)
  
  -- 분석 결과
  analysis_summary TEXT, -- 분석 요약
  recommendations TEXT, -- 권장사항
  
  analyzed_by INTEGER REFERENCES users(id),
  analyzed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_change_trend_mold ON change_trend_analysis(mold_id);
CREATE INDEX idx_change_trend_period ON change_trend_analysis(start_date, end_date);
```

---

## 5. 점검 관리

### 주요 테이블
- `daily_checks` - 일상점검
- `inspections` - 정기점검
- `fitting_checks` - 습합점검
- `cleaning_checks` - 세척점검
- `inspection_schedules` - 점검 스케줄 (생산수량 기반)
- `qr_scan_alerts` - QR 스캔 알람

### 5.1 daily_checks (일상점검 - 방상점검 + 생산수량 입력)
```sql
CREATE TABLE daily_checks (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  check_date DATE NOT NULL,
  shift VARCHAR(20), -- '주간', '야간'
  
  -- 생산수량 입력 (필수)
  production_quantity INTEGER NOT NULL, -- 당일 생산수량
  cumulative_quantity INTEGER, -- 누적 생산수량 (자동 계산)
  production_start_time TIME, -- 생산 시작 시간
  production_end_time TIME, -- 생산 종료 시간
  production_hours DECIMAL(5, 2), -- 생산 시간
  
  -- 점검 항목
  check_items JSONB, -- 점검 항목
  temperature_ok BOOLEAN,
  pressure_ok BOOLEAN,
  oil_level_ok BOOLEAN,
  abnormal_sound BOOLEAN,
  visual_inspection_ok BOOLEAN,
  
  -- 위치 정보
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  
  -- 기타
  notes TEXT,
  images JSONB, -- 이미지 URL 배열
  
  -- 자동 연결 정보
  inspection_schedule_updated BOOLEAN DEFAULT FALSE, -- 점검 스케줄 업데이트 여부
  shots_updated BOOLEAN DEFAULT FALSE, -- 타수 업데이트 여부
  alerts_generated BOOLEAN DEFAULT FALSE, -- 알람 생성 여부
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_daily_checks_mold ON daily_checks(mold_id);
CREATE INDEX idx_daily_checks_date ON daily_checks(check_date);
CREATE INDEX idx_daily_checks_quantity ON daily_checks(production_quantity);
```

### 5.2 inspections (정기점검)
```sql
CREATE TABLE inspections (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  inspection_type VARCHAR(50), -- '1차', '2차', '3차', '특별'
  scheduled_date DATE,
  actual_date DATE,
  inspector_id INTEGER REFERENCES users(id),
  inspection_items JSONB, -- 점검 항목 및 결과
  overall_status VARCHAR(20), -- 'pass', 'fail', 'conditional'
  findings TEXT, -- 발견사항
  recommendations TEXT, -- 권고사항
  next_inspection_date DATE,
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  images JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.3 fitting_checks (습합점검)
```sql
CREATE TABLE fitting_checks (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  check_date DATE NOT NULL,
  parting_line_ok BOOLEAN, -- 파팅라인 상태
  core_cavity_fit BOOLEAN, -- 코어/캐비티 밀착
  gate_ok BOOLEAN, -- 게이트 상태
  ejector_ok BOOLEAN, -- 이젝터 상태
  cooling_channel_ok BOOLEAN, -- 냉각수로 상태
  findings TEXT,
  corrective_actions TEXT, -- 조치사항
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  images JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.4 cleaning_checks (세척점검)
```sql
CREATE TABLE cleaning_checks (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  cleaning_date DATE NOT NULL,
  cleaning_type VARCHAR(50), -- '일반세척', '정밀세척', '초음파세척'
  cleaning_areas JSONB, -- 세척 부위
  cleaning_agent VARCHAR(100), -- 세척제
  duration_minutes INTEGER, -- 소요시간
  before_images JSONB,
  after_images JSONB,
  cleanliness_rating INTEGER, -- 1-5
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 5.5 inspection_schedules (점검 스케줄 - 생산수량 기반)
```sql
CREATE TABLE inspection_schedules (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  plant_id INTEGER NOT NULL, -- 협력사
  
  -- 본사 지정 생산수량 기준
  target_production_quantity INTEGER NOT NULL, -- 목표 생산수량
  current_production_quantity INTEGER DEFAULT 0, -- 현재 생산수량
  production_start_date DATE, -- 생산 시작일
  
  -- 점검 주기 설정 (본사 지정)
  inspection_type VARCHAR(50), -- '정기점검', '습합점검', '세척점검'
  inspection_interval_quantity INTEGER, -- 점검 주기 (생산수량 기준)
  inspection_interval_days INTEGER, -- 점검 주기 (일수 기준)
  
  -- 다음 점검 예정
  next_inspection_quantity INTEGER, -- 다음 점검 예정 수량
  next_inspection_date DATE, -- 다음 점검 예정일
  
  -- 알람 설정
  alert_threshold_quantity INTEGER, -- 알람 발생 수량 (예: 목표의 90%)
  alert_threshold_days INTEGER, -- 알람 발생 일수 (예: 3일 전)
  alert_enabled BOOLEAN DEFAULT TRUE,
  
  -- 점검 이력
  last_inspection_date DATE, -- 최종 점검일
  last_inspection_quantity INTEGER, -- 최종 점검 시 생산수량
  total_inspections_completed INTEGER DEFAULT 0, -- 완료된 점검 횟수
  
  -- 상태
  schedule_status VARCHAR(20), -- 'active', 'paused', 'completed', 'overdue'
  is_overdue BOOLEAN DEFAULT FALSE, -- 점검 지연 여부
  overdue_days INTEGER, -- 지연 일수
  
  -- 담당자
  assigned_inspector INTEGER REFERENCES users(id), -- 지정 점검자
  
  -- 메모
  notes TEXT,
  
  created_by INTEGER REFERENCES users(id), -- 생성자 (본사)
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_inspection_schedules_mold ON inspection_schedules(mold_id);
CREATE INDEX idx_inspection_schedules_plant ON inspection_schedules(plant_id);
CREATE INDEX idx_inspection_schedules_next_date ON inspection_schedules(next_inspection_date);
CREATE INDEX idx_inspection_schedules_status ON inspection_schedules(schedule_status);
```

### 5.6 qr_scan_alerts (QR 스캔 알람)
```sql
CREATE TABLE qr_scan_alerts (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  qr_session_id INTEGER REFERENCES qr_sessions(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  
  -- 스캔 정보
  scan_timestamp TIMESTAMP DEFAULT NOW(),
  scan_location_lat DECIMAL(10, 8),
  scan_location_lng DECIMAL(11, 8),
  
  -- 알람 유형
  alert_type VARCHAR(50), -- 'inspection_due', 'inspection_overdue', 'production_target', 'maintenance_required', 'urgent_repair', 'status_warning'
  alert_priority VARCHAR(20), -- 'low', 'medium', 'high', 'urgent'
  
  -- 알람 내용
  alert_title VARCHAR(200) NOT NULL,
  alert_message TEXT NOT NULL,
  alert_details JSONB, -- 상세 정보
  
  -- 점검 관련 알람
  inspection_schedule_id INTEGER REFERENCES inspection_schedules(id),
  inspection_type VARCHAR(50), -- '정기점검', '습합점검', '세척점검'
  due_date DATE, -- 예정일
  days_until_due INTEGER, -- 남은 일수
  production_quantity_gap INTEGER, -- 목표 수량과의 차이
  
  -- 금형 상태 알람
  mold_status VARCHAR(20), -- 금형 현재 상태
  total_shots INTEGER, -- 현재 타수
  max_shots INTEGER, -- 최대 타수
  shots_remaining INTEGER, -- 남은 타수
  
  -- 알람 표시 설정
  is_displayed BOOLEAN DEFAULT FALSE, -- 표시 여부
  display_timestamp TIMESTAMP, -- 표시 시간
  is_acknowledged BOOLEAN DEFAULT FALSE, -- 확인 여부
  acknowledged_timestamp TIMESTAMP, -- 확인 시간
  acknowledged_by INTEGER REFERENCES users(id),
  
  -- 액션 필요 여부
  requires_action BOOLEAN DEFAULT FALSE,
  action_type VARCHAR(50), -- 'inspection', 'repair', 'approval', 'report'
  action_url VARCHAR(500), -- 액션 링크
  
  -- 알람 만료
  expires_at TIMESTAMP, -- 알람 만료 시간
  is_expired BOOLEAN DEFAULT FALSE,
  
  -- 관련 데이터
  related_inspection_id INTEGER, -- 관련 점검 ID
  related_repair_id INTEGER, -- 관련 수리 ID
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_qr_scan_alerts_mold ON qr_scan_alerts(mold_id);
CREATE INDEX idx_qr_scan_alerts_user ON qr_scan_alerts(user_id);
CREATE INDEX idx_qr_scan_alerts_type ON qr_scan_alerts(alert_type);
CREATE INDEX idx_qr_scan_alerts_priority ON qr_scan_alerts(alert_priority);
CREATE INDEX idx_qr_scan_alerts_displayed ON qr_scan_alerts(is_displayed);
CREATE INDEX idx_qr_scan_alerts_acknowledged ON qr_scan_alerts(is_acknowledged);
CREATE INDEX idx_qr_scan_alerts_scan_time ON qr_scan_alerts(scan_timestamp);
```

---

## 6. 수리 관리

### 6.1 repairs (수리요청)
```sql
CREATE TABLE repairs (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  requested_by INTEGER NOT NULL REFERENCES users(id),
  assigned_to INTEGER REFERENCES users(id),
  status VARCHAR(20) NOT NULL, -- 'requested', 'accepted', 'in_progress', 'paused', 'completed', 'cancelled'
  priority VARCHAR(20), -- 'low', 'medium', 'high', 'urgent'
  issue_description TEXT NOT NULL,
  issue_category VARCHAR(50), -- '마모', '파손', '변형', '누수', '기타'
  requested_date TIMESTAMP DEFAULT NOW(),
  accepted_date TIMESTAMP,
  started_date TIMESTAMP,
  completed_date TIMESTAMP,
  estimated_completion TIMESTAMP,
  estimated_cost DECIMAL(10, 2),
  actual_cost DECIMAL(10, 2),
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  images JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_repairs_mold ON repairs(mold_id);
CREATE INDEX idx_repairs_status ON repairs(status);
```

### 6.2 repair_management (금형수리 관리표)
```sql
CREATE TABLE repair_management (
  id SERIAL PRIMARY KEY,
  repair_id INTEGER NOT NULL REFERENCES repairs(id),
  work_order_number VARCHAR(50) UNIQUE,
  repair_type VARCHAR(50), -- '예방정비', '긴급수리', '개선'
  work_description TEXT,
  parts_used JSONB, -- 사용 부품
  labor_hours DECIMAL(5, 2),
  technician_id INTEGER REFERENCES users(id),
  supervisor_id INTEGER REFERENCES users(id),
  quality_check_ok BOOLEAN,
  test_run_ok BOOLEAN,
  completion_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 6.3 repair_progress (금형수리 진행현황)
```sql
CREATE TABLE repair_progress (
  id SERIAL PRIMARY KEY,
  repair_id INTEGER NOT NULL REFERENCES repairs(id),
  progress_date TIMESTAMP DEFAULT NOW(),
  progress_percentage INTEGER, -- 0-100
  current_stage VARCHAR(50), -- '접수', '진단', '부품발주', '수리중', '테스트', '완료'
  work_details TEXT,
  issues_encountered TEXT,
  updated_by INTEGER REFERENCES users(id),
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  transfer_type VARCHAR(20) NOT NULL, -- 'out', 'in'
  status VARCHAR(20) NOT NULL, -- 'requested', 'approved', 'in_transit', 'completed', 'rejected'
  requested_by INTEGER NOT NULL REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  request_date TIMESTAMP DEFAULT NOW(),
  approved_date TIMESTAMP,
  completed_date TIMESTAMP,
  from_location VARCHAR(200),
  to_location VARCHAR(200),
  transport_method VARCHAR(50), -- '자체운송', '외주운송'
  driver_name VARCHAR(100),
  vehicle_number VARCHAR(50),
  gps_lat DECIMAL(10, 8),
  gps_lng DECIMAL(11, 8),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transfer_logs_mold ON transfer_logs(mold_id);
CREATE INDEX idx_transfer_logs_status ON transfer_logs(status);
```

### 7.2 transfer_management (이관관리)
```sql
CREATE TABLE transfer_management (
  id SERIAL PRIMARY KEY,
  transfer_log_id INTEGER NOT NULL REFERENCES transfer_logs(id),
  packing_completed BOOLEAN DEFAULT FALSE,
  packing_date TIMESTAMP,
  loading_completed BOOLEAN DEFAULT FALSE,
  loading_date TIMESTAMP,
  departure_time TIMESTAMP,
  arrival_time TIMESTAMP,
  unloading_completed BOOLEAN DEFAULT FALSE,
  unloading_date TIMESTAMP,
  inspection_completed BOOLEAN DEFAULT FALSE,
  inspection_date TIMESTAMP,
  damage_reported BOOLEAN DEFAULT FALSE,
  damage_description TEXT,
  responsible_person VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### 7.3 transfer_checklist (이관 체크리스트)
```sql
CREATE TABLE transfer_checklist (
  id SERIAL PRIMARY KEY,
  transfer_log_id INTEGER NOT NULL REFERENCES transfer_logs(id),
  checklist_items JSONB, -- 체크리스트 항목
  mold_cleaning_ok BOOLEAN,
  rust_prevention_ok BOOLEAN,
  protective_cover_ok BOOLEAN,
  accessories_included BOOLEAN,
  documents_included BOOLEAN,
  photos_taken BOOLEAN,
  checked_by INTEGER REFERENCES users(id),
  checked_at TIMESTAMP,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 7.4 transfer_approvals (승인)
```sql
CREATE TABLE transfer_approvals (
  id SERIAL PRIMARY KEY,
  transfer_log_id INTEGER NOT NULL REFERENCES transfer_logs(id),
  approval_level INTEGER, -- 1차, 2차, 3차 승인
  approver_id INTEGER NOT NULL REFERENCES users(id),
  approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
  approval_date TIMESTAMP,
  comments TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 8. 금형 폐기 관리

### 주요 테이블
- `mold_disposal` - 금형 폐기
- `disposal_approval` - 폐기 승인
- `disposal_records` - 폐기 기록

### 8.1 mold_disposal (금형 폐기)
```sql
CREATE TABLE mold_disposal (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  disposal_request_date DATE NOT NULL,
  requested_by INTEGER NOT NULL REFERENCES users(id),
  
  -- 폐기 사유
  disposal_reason VARCHAR(50), -- '수명종료', '품질불량', '설계변경', '생산중단', '파손'
  disposal_reason_detail TEXT, -- 상세 사유
  
  -- 금형 상태
  total_shots INTEGER, -- 총 타수
  last_inspection_date DATE, -- 최종 점검일
  condition_assessment TEXT, -- 상태 평가
  
  -- 폐기 방법
  disposal_method VARCHAR(50), -- '고철처리', '재활용', '보관', '매각'
  disposal_location VARCHAR(200), -- 폐기 장소
  disposal_company VARCHAR(200), -- 폐기 업체
  
  -- 비용
  estimated_disposal_cost DECIMAL(12, 2), -- 예상 폐기 비용
  actual_disposal_cost DECIMAL(12, 2), -- 실제 폐기 비용
  salvage_value DECIMAL(12, 2), -- 잔존 가치
  
  -- 상태
  disposal_status VARCHAR(20), -- 'requested', 'approved', 'in_progress', 'completed', 'rejected'
  
  -- 첨부 자료
  attachments JSONB, -- 사진, 문서 등
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_disposal_mold ON mold_disposal(mold_id);
CREATE INDEX idx_disposal_status ON mold_disposal(disposal_status);
CREATE INDEX idx_disposal_request_date ON mold_disposal(disposal_request_date);
```

### 8.2 disposal_approval (폐기 승인)
```sql
CREATE TABLE disposal_approval (
  id SERIAL PRIMARY KEY,
  disposal_id INTEGER NOT NULL REFERENCES mold_disposal(id),
  
  -- 승인 단계
  approval_level INTEGER NOT NULL, -- 1차(담당자), 2차(팀장), 3차(본부장)
  approval_role VARCHAR(50), -- '담당자', '팀장', '본부장', '임원'
  approver_id INTEGER NOT NULL REFERENCES users(id),
  
  -- 승인 정보
  approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected', 'conditional'
  approval_date TIMESTAMP,
  
  -- 승인 의견
  approval_comments TEXT,
  conditions TEXT, -- 조건부 승인 시 조건
  
  -- 검토 사항
  technical_review BOOLEAN, -- 기술적 검토 완료
  financial_review BOOLEAN, -- 재무적 검토 완료
  legal_review BOOLEAN, -- 법적 검토 완료
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_disposal_approval_disposal ON disposal_approval(disposal_id);
CREATE INDEX idx_disposal_approval_status ON disposal_approval(approval_status);
```

### 8.3 disposal_records (폐기 기록)
```sql
CREATE TABLE disposal_records (
  id SERIAL PRIMARY KEY,
  disposal_id INTEGER NOT NULL REFERENCES mold_disposal(id),
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  
  -- 폐기 실행 정보
  disposal_date DATE NOT NULL, -- 실제 폐기일
  disposal_time TIME, -- 폐기 시간
  executed_by INTEGER REFERENCES users(id), -- 폐기 실행자
  
  -- 폐기 전 최종 확인
  final_inspection_completed BOOLEAN DEFAULT FALSE,
  final_inspection_date DATE,
  final_inspector INTEGER REFERENCES users(id),
  
  -- 폐기 프로세스
  disassembly_completed BOOLEAN DEFAULT FALSE, -- 분해 완료
  cleaning_completed BOOLEAN DEFAULT FALSE, -- 세척 완료
  documentation_completed BOOLEAN DEFAULT FALSE, -- 문서화 완료
  
  -- 부품 처리
  salvaged_parts JSONB, -- 재활용 부품 목록
  scrapped_parts JSONB, -- 폐기 부품 목록
  
  -- 환경 처리
  hazardous_materials JSONB, -- 유해물질 처리 내역
  environmental_compliance BOOLEAN DEFAULT TRUE, -- 환경 규정 준수
  
  -- 최종 처리
  disposal_certificate_number VARCHAR(100), -- 폐기 증명서 번호
  disposal_certificate_url VARCHAR(500), -- 증명서 파일
  
  -- 사진 기록
  before_disposal_images JSONB, -- 폐기 전 사진
  during_disposal_images JSONB, -- 폐기 중 사진
  after_disposal_images JSONB, -- 폐기 후 사진
  
  -- 비용 정산
  final_cost DECIMAL(12, 2), -- 최종 비용
  salvage_income DECIMAL(12, 2), -- 잔존가치 회수액
  net_cost DECIMAL(12, 2), -- 순 비용
  
  -- 기타
  notes TEXT,
  lessons_learned TEXT, -- 교훈 사항
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_disposal_records_disposal ON disposal_records(disposal_id);
CREATE INDEX idx_disposal_records_mold ON disposal_records(mold_id);
CREATE INDEX idx_disposal_records_date ON disposal_records(disposal_date);
```

---

## 9. 관리자 수정 및 배포 관리

### 주요 테이블
- `admin_modifications` - 관리자 수정 이력
- `modification_approvals` - 수정 승인
- `auto_deployment` - 자동 배포 기록
- `document_master_templates` - 문서 마스터 템플릿
- `document_revisions` - 문서 리비젼 관리
- `template_deployment_log` - 템플릿 배포 로그

### 9.1 admin_modifications (관리자 수정 이력)
```sql
CREATE TABLE admin_modifications (
  id SERIAL PRIMARY KEY,
  
  -- 수정 대상
  target_table VARCHAR(100) NOT NULL, -- 'daily_checks', 'inspections', 'repairs', 'fitting_checks', 'cleaning_checks', etc.
  target_record_id INTEGER NOT NULL, -- 수정 대상 레코드 ID
  mold_id INTEGER REFERENCES molds(id),
  
  -- 원본 작성자 (협력사)
  original_author_id INTEGER NOT NULL REFERENCES users(id),
  original_author_role VARCHAR(20), -- 'plant', 'maker'
  original_created_at TIMESTAMP,
  
  -- 수정자 (관리자)
  modified_by INTEGER NOT NULL REFERENCES users(id),
  modification_date TIMESTAMP DEFAULT NOW(),
  modification_reason TEXT NOT NULL, -- 수정 사유
  
  -- 수정 내용
  field_name VARCHAR(100), -- 수정된 필드명
  original_value JSONB, -- 수정 전 값 (전체 레코드)
  modified_value JSONB, -- 수정 후 값 (전체 레코드)
  changes_summary JSONB, -- 변경 사항 요약 [{"field": "status", "before": "pass", "after": "fail"}]
  
  -- 수정 유형
  modification_type VARCHAR(50), -- 'correction', 'enhancement', 'data_quality', 'compliance'
  severity VARCHAR(20), -- 'minor', 'major', 'critical'
  
  -- 승인 정보
  requires_approval BOOLEAN DEFAULT FALSE,
  approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected'
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  approval_comments TEXT,
  
  -- 배포 정보
  is_deployed BOOLEAN DEFAULT FALSE,
  deployment_status VARCHAR(20), -- 'pending', 'in_progress', 'completed', 'failed'
  deployed_at TIMESTAMP,
  deployment_method VARCHAR(50), -- 'auto', 'manual', 'scheduled'
  
  -- 알림 정보
  notification_sent BOOLEAN DEFAULT FALSE,
  notified_users JSONB, -- 알림 받은 사용자 목록
  notification_sent_at TIMESTAMP,
  
  -- 롤백 정보
  can_rollback BOOLEAN DEFAULT TRUE,
  is_rolled_back BOOLEAN DEFAULT FALSE,
  rolled_back_by INTEGER REFERENCES users(id),
  rolled_back_at TIMESTAMP,
  rollback_reason TEXT,
  
  -- 메타데이터
  modification_notes TEXT,
  attachments JSONB, -- 첨부 파일 (증빙 자료)
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_admin_modifications_target ON admin_modifications(target_table, target_record_id);
CREATE INDEX idx_admin_modifications_mold ON admin_modifications(mold_id);
CREATE INDEX idx_admin_modifications_author ON admin_modifications(original_author_id);
CREATE INDEX idx_admin_modifications_modifier ON admin_modifications(modified_by);
CREATE INDEX idx_admin_modifications_date ON admin_modifications(modification_date);
CREATE INDEX idx_admin_modifications_status ON admin_modifications(approval_status);
CREATE INDEX idx_admin_modifications_deployed ON admin_modifications(is_deployed);
```

### 9.2 modification_approvals (수정 승인)
```sql
CREATE TABLE modification_approvals (
  id SERIAL PRIMARY KEY,
  modification_id INTEGER NOT NULL REFERENCES admin_modifications(id),
  
  -- 승인 단계
  approval_level INTEGER NOT NULL, -- 1차, 2차, 3차
  approval_role VARCHAR(50), -- '팀장', '부서장', '본부장'
  approver_id INTEGER NOT NULL REFERENCES users(id),
  
  -- 승인 정보
  approval_status VARCHAR(20), -- 'pending', 'approved', 'rejected', 'conditional'
  approval_date TIMESTAMP,
  approval_comments TEXT,
  
  -- 조건부 승인
  conditions TEXT,
  conditions_met BOOLEAN,
  
  -- 검토 사항
  data_accuracy_verified BOOLEAN DEFAULT FALSE, -- 데이터 정확성 검증
  compliance_checked BOOLEAN DEFAULT FALSE, -- 규정 준수 확인
  impact_assessed BOOLEAN DEFAULT FALSE, -- 영향도 평가
  
  -- 검토 의견
  review_notes TEXT,
  risk_level VARCHAR(20), -- 'low', 'medium', 'high'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_modification_approvals_modification ON modification_approvals(modification_id);
CREATE INDEX idx_modification_approvals_approver ON modification_approvals(approver_id);
CREATE INDEX idx_modification_approvals_status ON modification_approvals(approval_status);
```

### 9.3 auto_deployment (자동 배포 기록)
```sql
CREATE TABLE auto_deployment (
  id SERIAL PRIMARY KEY,
  modification_id INTEGER NOT NULL REFERENCES admin_modifications(id),
  
  -- 배포 정보
  deployment_type VARCHAR(50), -- 'immediate', 'scheduled', 'batch'
  deployment_trigger VARCHAR(50), -- 'approval', 'time_based', 'manual'
  scheduled_time TIMESTAMP, -- 예약 배포 시간
  actual_deployment_time TIMESTAMP,
  
  -- 배포 대상
  target_users JSONB, -- 배포 대상 사용자 목록
  target_plants JSONB, -- 배포 대상 협력사 목록
  target_scope VARCHAR(50), -- 'single_user', 'plant', 'all_plants', 'system_wide'
  
  -- 배포 상태
  deployment_status VARCHAR(20), -- 'pending', 'in_progress', 'completed', 'failed', 'rolled_back'
  deployment_progress INTEGER DEFAULT 0, -- 0-100%
  
  -- 배포 단계
  stages JSONB, -- [{"stage": "validation", "status": "completed"}, {"stage": "deployment", "status": "in_progress"}]
  current_stage VARCHAR(50),
  
  -- 배포 결과
  success_count INTEGER DEFAULT 0, -- 성공 건수
  failure_count INTEGER DEFAULT 0, -- 실패 건수
  total_count INTEGER, -- 전체 건수
  
  -- 에러 처리
  errors JSONB, -- 에러 목록
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  
  -- 알림 발송
  notifications_sent JSONB, -- 발송된 알림 목록
  notification_status VARCHAR(20), -- 'pending', 'sent', 'failed'
  
  -- 롤백 정보
  rollback_available BOOLEAN DEFAULT TRUE,
  rollback_executed BOOLEAN DEFAULT FALSE,
  rollback_time TIMESTAMP,
  rollback_reason TEXT,
  
  -- 배포 로그
  deployment_log TEXT, -- 상세 배포 로그
  
  -- 실행자
  executed_by INTEGER REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_auto_deployment_modification ON auto_deployment(modification_id);
CREATE INDEX idx_auto_deployment_status ON auto_deployment(deployment_status);
CREATE INDEX idx_auto_deployment_time ON auto_deployment(actual_deployment_time);
CREATE INDEX idx_auto_deployment_trigger ON auto_deployment(deployment_trigger);
```

### 9.4 document_master_templates (문서 마스터 템플릿)
```sql
CREATE TABLE document_master_templates (
  id SERIAL PRIMARY KEY,
  
  -- 템플릿 정보
  template_name VARCHAR(200) NOT NULL,
  template_code VARCHAR(50) UNIQUE NOT NULL,
  document_type VARCHAR(50) NOT NULL,
  category VARCHAR(50),
  
  -- 버전 관리
  version VARCHAR(20) NOT NULL,
  version_number INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- 템플릿 구조
  template_structure JSONB,
  required_fields JSONB,
  optional_fields JSONB,
  validation_rules JSONB,
  
  -- 적용 대상
  applicable_to JSONB,
  target_roles JSONB,
  
  -- 승인 설정
  approval_required BOOLEAN DEFAULT TRUE,
  approval_workflow JSONB,
  
  -- 배포 정보
  deployed_count INTEGER DEFAULT 0,
  last_deployed_at TIMESTAMP,
  deployed_by INTEGER REFERENCES users(id),
  
  -- 통계
  usage_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5, 2),
  
  -- 관리 정보
  created_by INTEGER NOT NULL REFERENCES users(id),
  updated_by INTEGER REFERENCES users(id),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doc_master_type ON document_master_templates(document_type);
CREATE INDEX idx_doc_master_active ON document_master_templates(is_active);
```

### 9.5 document_revisions (문서 리비젼 관리)
```sql
CREATE TABLE document_revisions (
  id SERIAL PRIMARY KEY,
  
  -- 문서 정보
  document_type VARCHAR(50) NOT NULL,
  document_id INTEGER NOT NULL,
  template_id INTEGER REFERENCES document_master_templates(id),
  
  -- 리비젼 정보
  revision_number INTEGER NOT NULL,
  revision_type VARCHAR(50),
  revision_reason VARCHAR(100),
  
  -- 변경 내용
  previous_data JSONB,
  current_data JSONB,
  changes_summary TEXT,
  changed_fields JSONB,
  
  -- 변경자 정보
  modified_by INTEGER NOT NULL REFERENCES users(id),
  modified_by_role VARCHAR(50),
  modification_source VARCHAR(50),
  
  -- 승인 정보
  requires_approval BOOLEAN DEFAULT TRUE,
  approval_status VARCHAR(20),
  approved_by INTEGER REFERENCES users(id),
  approved_at TIMESTAMP,
  approval_comments TEXT,
  
  -- 배포 정보
  is_deployed BOOLEAN DEFAULT FALSE,
  deployed_at TIMESTAMP,
  deployment_id INTEGER REFERENCES auto_deployment(id),
  
  -- 영향 범위
  affected_users JSONB,
  affected_plants JSONB,
  impact_level VARCHAR(20),
  
  -- 롤백 정보
  can_rollback BOOLEAN DEFAULT TRUE,
  rollback_available_until TIMESTAMP,
  is_rolled_back BOOLEAN DEFAULT FALSE,
  rolled_back_at TIMESTAMP,
  rolled_back_by INTEGER REFERENCES users(id),
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doc_revision_type ON document_revisions(document_type);
CREATE INDEX idx_doc_revision_doc ON document_revisions(document_id);
```

### 9.6 template_deployment_log (템플릿 배포 로그)
```sql
CREATE TABLE template_deployment_log (
  id SERIAL PRIMARY KEY,
  
  -- 배포 대상
  template_id INTEGER REFERENCES document_master_templates(id),
  template_type VARCHAR(50),
  
  -- 배포 정보
  deployment_version VARCHAR(20),
  deployment_date TIMESTAMP DEFAULT NOW(),
  deployed_by INTEGER NOT NULL REFERENCES users(id),
  
  -- 배포 범위
  deployment_scope VARCHAR(50),
  target_users JSONB,
  target_plants JSONB,
  target_document_types JSONB,
  
  -- 배포 방식
  deployment_method VARCHAR(50),
  deployment_strategy VARCHAR(50),
  
  -- 배포 상태
  deployment_status VARCHAR(20) DEFAULT 'pending',
  deployment_progress INTEGER DEFAULT 0,
  
  -- 배포 결과
  total_targets INTEGER DEFAULT 0,
  successful_deployments INTEGER DEFAULT 0,
  failed_deployments INTEGER DEFAULT 0,
  
  -- 영향 분석
  affected_documents_count INTEGER DEFAULT 0,
  affected_users_count INTEGER DEFAULT 0,
  
  -- 변경 사항
  change_summary TEXT,
  change_details JSONB,
  
  -- 알림
  notification_sent BOOLEAN DEFAULT FALSE,
  notification_sent_at TIMESTAMP,
  
  -- 롤백 정보
  can_rollback BOOLEAN DEFAULT TRUE,
  previous_template_id INTEGER REFERENCES document_master_templates(id),
  
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_template_deploy_template ON template_deployment_log(template_id);
CREATE INDEX idx_template_deploy_status ON template_deployment_log(deployment_status);
```

---

## 10. 기타

### 10.1 shots (타수 기록)
```sql
CREATE TABLE shots (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  count_total INTEGER DEFAULT 0,
  count_daily INTEGER DEFAULT 0,
  last_updated TIMESTAMP DEFAULT NOW(),
  updated_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_shots_mold ON shots(mold_id);
```

### 10.2 notifications (알림)
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL, -- 'repair_request', 'transfer_request', 'inspection_due', etc.
  title VARCHAR(200),
  message TEXT NOT NULL,
  mold_id INTEGER REFERENCES molds(id),
  related_id INTEGER, -- repair_id, transfer_id 등
  is_read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  priority VARCHAR(20), -- 'low', 'medium', 'high'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
```

### 10.3 comments (협력사↔제작처 소통)
```sql
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  user_id INTEGER NOT NULL REFERENCES users(id),
  parent_id INTEGER REFERENCES comments(id), -- 대댓글
  content TEXT NOT NULL,
  type VARCHAR(20), -- 'comment', 'memo', 'note'
  is_private BOOLEAN DEFAULT FALSE,
  attachments JSONB, -- 첨부파일
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_comments_mold ON comments(mold_id);
```

### 10.4 mold_images (금형 이미지)
```sql
CREATE TABLE mold_images (
  id SERIAL PRIMARY KEY,
  mold_id INTEGER NOT NULL REFERENCES molds(id),
  image_type VARCHAR(50), -- 'installation', 'production', 'repair', 'inspection', 'damage'
  image_url VARCHAR(500) NOT NULL,
  thumbnail_url VARCHAR(500),
  file_size INTEGER,
  uploaded_by INTEGER NOT NULL REFERENCES users(id),
  upload_date TIMESTAMP DEFAULT NOW(),
  description TEXT,
  tags JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_mold_images_mold ON mold_images(mold_id);
CREATE INDEX idx_mold_images_type ON mold_images(image_type);
```

---

## 🔗 테이블 관계도

### 핵심 관계
- `molds` ← 모든 테이블의 중심
- `users` → 모든 작업 기록에 연결
- `repairs` ↔ `repair_management` ↔ `repair_progress`
- `transfer_logs` ↔ `transfer_management` ↔ `transfer_checklist` ↔ `transfer_approvals`

---

## 📝 마이그레이션 순서

1. **기본 테이블**: users, molds
2. **금형정보**: mold_development, development_plan, mold_project, mold_replication, mold_drawings, maker_info
3. **사출정보**: plant_info, injection_conditions, production_lines
4. **점검**: daily_checks, inspections, fitting_checks, cleaning_checks
5. **수리**: repairs, repair_management, repair_progress
6. **이관**: transfer_logs, transfer_management, transfer_checklist, transfer_approvals
7. **기타**: shots, notifications, comments, mold_images, qr_sessions

---

## 🚀 인덱스 전략

- **외래키**: 모든 외래키에 인덱스 생성
- **검색 필드**: status, date, type 등 자주 검색되는 필드
- **복합 인덱스**: (mold_id, created_at) 등 조합 검색용

---

## 📊 데이터 보존 정책

- **활성 데이터**: 모든 테이블
- **아카이브**: 3년 이상 된 completed/scrapped 데이터
- **백업**: 일일 자동 백업 (Railway)
