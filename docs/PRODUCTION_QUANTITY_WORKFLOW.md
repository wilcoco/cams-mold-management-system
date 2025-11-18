# 생산수량 기반 업무 연동 가이드

## 개요

협력사 작업자가 일상점검 시 생산수량을 입력하면, 입력된 수량을 기준으로 점검 스케줄, 타수 기록, 알람 생성 등 모든 관련 업무가 자동으로 연동됩니다.

---

## 핵심 개념

### 일상점검 = 생산수량 입력

**기존 방식:**
- 일상점검 따로
- 생산수량 입력 따로

**개선 방식:**
- 일상점검 시 생산수량 필수 입력
- 입력된 수량으로 모든 업무 자동 연동

---

## 데이터 흐름

```
[협력사 작업자]
  ↓
[QR 스캔]
  ↓
[일상점검 + 생산수량 입력]
  - 점검 항목 체크
  - 당일 생산수량 입력 (필수)
  - 생산 시간 입력
  ↓
[저장 시 자동 처리]
  ↓
┌─────────────────────────────────────┐
│ 1. 누적 생산수량 계산                 │
│    current_production_quantity 업데이트│
│                                     │
│ 2. 점검 스케줄 업데이트               │
│    inspection_schedules 자동 갱신     │
│    - 다음 점검 예정 수량 계산         │
│    - 점검 임박 여부 판단             │
│                                     │
│ 3. 타수 기록 업데이트                 │
│    shots 테이블 자동 갱신             │
│    - count_total 증가                │
│    - count_daily 업데이트            │
│                                     │
│ 4. 알람 생성                         │
│    qr_scan_alerts 자동 생성           │
│    - 점검 예정 알람                  │
│    - 생산 목표 달성 알람             │
│    - 타수 임계치 알람                │
│                                     │
│ 5. 알림 발송                         │
│    notifications 생성                │
│    - 관리자 알림                     │
│    - 협력사 알림                     │
└─────────────────────────────────────┘
```

---

## 일상점검 + 생산수량 입력 프로세스

### 1. QR 스캔 및 로그인

```
1. 작업자가 금형 QR 코드 스캔
2. 로그인 (ID/PW)
3. 일상점검 화면 로드
```

### 2. 일상점검 항목 입력

**페이지**: `/worker/mold/:moldId/daily-check`

**입력 항목:**

#### A. 생산 정보 (필수)
```
┌─────────────────────────────────────┐
│ 📊 생산 정보                          │
│                                     │
│ 당일 생산수량 *                       │
│ [_________] 개                       │
│                                     │
│ 생산 시작 시간                        │
│ [08:00] ⏰                           │
│                                     │
│ 생산 종료 시간                        │
│ [17:00] ⏰                           │
│                                     │
│ 생산 시간: 9시간 (자동 계산)          │
│                                     │
│ 누적 생산수량: 9,500개 (자동 표시)    │
│ 목표 수량: 10,000개                  │
│ 진행률: 95% ████████████░           │
└─────────────────────────────────────┘
```

#### B. 점검 항목
```
┌─────────────────────────────────────┐
│ 🔍 금형 외관                          │
│ ○ 양호  ○ 불량                       │
│                                     │
│ 🌡️ 금형 온도                         │
│ [___] ℃                             │
│                                     │
│ 💧 냉각수 상태                        │
│ ○ 정상  ○ 이상                       │
│                                     │
│ ⚙️ 에젝터 작동                        │
│ ○ 정상  ○ 이상                       │
└─────────────────────────────────────┘
```

#### C. 사진 및 메모
```
┌─────────────────────────────────────┐
│ 📷 사진 촬영                          │
│ [사진 추가]                           │
│                                     │
│ 📝 특이사항                           │
│ [___________________________]       │
└─────────────────────────────────────┘
```

### 3. 저장 시 자동 처리

**API 엔드포인트:**
```javascript
POST /api/plant/daily-checks

{
  "mold_id": 123,
  "check_date": "2024-01-15",
  "shift": "주간",
  
  // 생산 정보 (필수)
  "production_quantity": 500,
  "production_start_time": "08:00",
  "production_end_time": "17:00",
  
  // 점검 항목
  "check_items": {
    "외관": "양호",
    "온도": 180,
    "냉각수": "정상",
    "에젝터": "정상"
  },
  "temperature_ok": true,
  "pressure_ok": true,
  "oil_level_ok": true,
  "abnormal_sound": false,
  "visual_inspection_ok": true,
  
  // 위치
  "gps_lat": 37.5665,
  "gps_lng": 126.9780,
  
  // 기타
  "notes": "정상 가동 중",
  "images": ["url1", "url2"]
}
```

**백엔드 자동 처리 로직:**

```javascript
async function createDailyCheck(data) {
  const transaction = await sequelize.transaction();
  
  try {
    // 1. 일상점검 저장
    const dailyCheck = await DailyCheck.create({
      ...data,
      cumulative_quantity: 0, // 임시값
      inspection_schedule_updated: false,
      shots_updated: false,
      alerts_generated: false
    }, { transaction });
    
    // 2. 누적 생산수량 계산
    const cumulativeQuantity = await calculateCumulativeQuantity(
      data.mold_id,
      data.production_quantity
    );
    
    await dailyCheck.update({
      cumulative_quantity: cumulativeQuantity
    }, { transaction });
    
    // 3. 점검 스케줄 업데이트
    await updateInspectionSchedules(
      data.mold_id,
      cumulativeQuantity,
      dailyCheck.id,
      transaction
    );
    
    await dailyCheck.update({
      inspection_schedule_updated: true
    }, { transaction });
    
    // 4. 타수 기록 업데이트
    await updateShots(
      data.mold_id,
      data.production_quantity,
      transaction
    );
    
    await dailyCheck.update({
      shots_updated: true
    }, { transaction });
    
    // 5. 알람 생성
    const alerts = await generateProductionAlerts(
      data.mold_id,
      cumulativeQuantity,
      dailyCheck.id,
      transaction
    );
    
    await dailyCheck.update({
      alerts_generated: true
    }, { transaction });
    
    // 6. 알림 발송
    await sendNotifications(data.mold_id, alerts, transaction);
    
    await transaction.commit();
    
    return {
      dailyCheck,
      cumulativeQuantity,
      alerts,
      message: "일상점검 및 생산수량이 저장되었습니다."
    };
    
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
}
```

---

## 자동 연동 상세

### 1. 누적 생산수량 계산

```javascript
async function calculateCumulativeQuantity(moldId, dailyQuantity) {
  // 이전 누적 수량 조회
  const lastCheck = await DailyCheck.findOne({
    where: { mold_id: moldId },
    order: [['check_date', 'DESC']],
    limit: 1
  });
  
  const previousCumulative = lastCheck?.cumulative_quantity || 0;
  const newCumulative = previousCumulative + dailyQuantity;
  
  return newCumulative;
}
```

### 2. 점검 스케줄 자동 업데이트

```javascript
async function updateInspectionSchedules(moldId, cumulativeQuantity, dailyCheckId, transaction) {
  // 활성 점검 스케줄 조회
  const schedules = await InspectionSchedule.findAll({
    where: {
      mold_id: moldId,
      schedule_status: 'active'
    },
    transaction
  });
  
  for (const schedule of schedules) {
    // 현재 생산수량 업데이트
    await schedule.update({
      current_production_quantity: cumulativeQuantity,
      updated_at: new Date()
    }, { transaction });
    
    // 점검 예정 수량 도달 여부 확인
    if (cumulativeQuantity >= schedule.next_inspection_quantity) {
      // 점검 예정 알람 생성
      await QRScanAlert.create({
        mold_id: moldId,
        user_id: schedule.assigned_inspector,
        alert_type: 'inspection_due',
        alert_priority: 'high',
        alert_title: `${schedule.inspection_type} 예정 수량 도달`,
        alert_message: `목표 생산수량 ${schedule.next_inspection_quantity}개에 도달했습니다.`,
        inspection_schedule_id: schedule.id,
        production_quantity_gap: 0,
        requires_action: true,
        action_type: 'inspection'
      }, { transaction });
      
      // 스케줄 상태 업데이트
      await schedule.update({
        schedule_status: 'overdue',
        is_overdue: true
      }, { transaction });
    }
    
    // 임계값 도달 여부 확인 (90%)
    else if (cumulativeQuantity >= schedule.alert_threshold_quantity) {
      // 점검 임박 알람 생성
      await QRScanAlert.create({
        mold_id: moldId,
        user_id: schedule.assigned_inspector,
        alert_type: 'inspection_due',
        alert_priority: 'medium',
        alert_title: `${schedule.inspection_type} 임박`,
        alert_message: `목표 생산수량의 90%에 도달했습니다.`,
        inspection_schedule_id: schedule.id,
        production_quantity_gap: schedule.next_inspection_quantity - cumulativeQuantity,
        requires_action: true,
        action_type: 'inspection'
      }, { transaction });
    }
  }
}
```

### 3. 타수 기록 자동 업데이트

```javascript
async function updateShots(moldId, dailyQuantity, transaction) {
  // 타수 레코드 조회 또는 생성
  let shots = await Shot.findOne({
    where: { mold_id: moldId },
    transaction
  });
  
  if (!shots) {
    shots = await Shot.create({
      mold_id: moldId,
      count_total: 0,
      count_daily: 0
    }, { transaction });
  }
  
  // 타수 업데이트
  const newTotal = shots.count_total + dailyQuantity;
  
  await shots.update({
    count_total: newTotal,
    count_daily: dailyQuantity,
    last_updated: new Date()
  }, { transaction });
  
  // 타수 임계치 확인 (90%)
  const mold = await Mold.findByPk(moldId, { transaction });
  if (mold.target_shots && newTotal >= mold.target_shots * 0.9) {
    // 타수 임계치 알람 생성
    await QRScanAlert.create({
      mold_id: moldId,
      alert_type: 'maintenance_required',
      alert_priority: 'high',
      alert_title: '타수 임계치 도달',
      alert_message: `금형 수명의 90%에 도달했습니다. (${newTotal}/${mold.target_shots})`,
      total_shots: newTotal,
      max_shots: mold.target_shots,
      shots_remaining: mold.target_shots - newTotal,
      requires_action: true,
      action_type: 'inspection'
    }, { transaction });
  }
  
  return shots;
}
```

### 4. 알람 자동 생성

```javascript
async function generateProductionAlerts(moldId, cumulativeQuantity, dailyCheckId, transaction) {
  const alerts = [];
  
  // 점검 스케줄 기반 알람
  const schedules = await InspectionSchedule.findAll({
    where: {
      mold_id: moldId,
      schedule_status: 'active'
    },
    transaction
  });
  
  for (const schedule of schedules) {
    // 생산 목표 달성 알람
    if (cumulativeQuantity >= schedule.target_production_quantity) {
      const alert = await QRScanAlert.create({
        mold_id: moldId,
        alert_type: 'production_target',
        alert_priority: 'low',
        alert_title: '생산 목표 달성',
        alert_message: `목표 생산수량 ${schedule.target_production_quantity}개를 달성했습니다!`,
        inspection_schedule_id: schedule.id,
        production_quantity_gap: 0,
        requires_action: false
      }, { transaction });
      
      alerts.push(alert);
    }
  }
  
  return alerts;
}
```

### 5. 알림 자동 발송

```javascript
async function sendNotifications(moldId, alerts, transaction) {
  const mold = await Mold.findByPk(moldId, { transaction });
  
  for (const alert of alerts) {
    // 관리자 알림
    const hqUsers = await User.findAll({
      where: { role_group: 'hq' },
      transaction
    });
    
    for (const user of hqUsers) {
      await Notification.create({
        user_id: user.id,
        type: alert.alert_type,
        title: alert.alert_title,
        message: alert.alert_message,
        mold_id: moldId,
        related_id: alert.id,
        priority: alert.alert_priority
      }, { transaction });
    }
    
    // 협력사 알림
    const plantUsers = await User.findAll({
      where: {
        role_group: 'plant',
        plant_id: mold.plant_id
      },
      transaction
    });
    
    for (const user of plantUsers) {
      await Notification.create({
        user_id: user.id,
        type: alert.alert_type,
        title: alert.alert_title,
        message: alert.alert_message,
        mold_id: moldId,
        related_id: alert.id,
        priority: alert.alert_priority
      }, { transaction });
    }
  }
}
```

---

## 응답 예시

### 일상점검 저장 성공 응답

```json
{
  "success": true,
  "message": "일상점검 및 생산수량이 저장되었습니다.",
  "data": {
    "daily_check_id": 12345,
    "production_quantity": 500,
    "cumulative_quantity": 9500,
    "target_quantity": 10000,
    "progress_rate": 95,
    
    "updated_schedules": [
      {
        "schedule_id": 1,
        "inspection_type": "습합점검",
        "next_inspection_quantity": 10000,
        "quantity_gap": 500,
        "status": "임박"
      }
    ],
    
    "shots": {
      "count_total": 950000,
      "count_daily": 500,
      "max_shots": 1000000,
      "remaining": 50000,
      "usage_rate": 95
    },
    
    "alerts": [
      {
        "alert_type": "inspection_due",
        "alert_priority": "medium",
        "alert_title": "습합점검 임박",
        "alert_message": "목표 생산수량의 95%에 도달했습니다. 습합점검을 준비하세요.",
        "requires_action": true
      }
    ],
    
    "notifications_sent": {
      "hq": 3,
      "plant": 5
    }
  }
}
```

---

## 화면 예시

### 일상점검 + 생산수량 입력 화면

```jsx
<MobileLayout>
  <DailyCheckForm>
    {/* 생산 정보 섹션 */}
    <Section title="📊 생산 정보" required>
      <Input
        label="당일 생산수량"
        type="number"
        value={productionQuantity}
        onChange={setProductionQuantity}
        required
        placeholder="예: 500"
        unit="개"
      />
      
      <TimeInput
        label="생산 시작 시간"
        value={startTime}
        onChange={setStartTime}
      />
      
      <TimeInput
        label="생산 종료 시간"
        value={endTime}
        onChange={setEndTime}
      />
      
      <InfoBox>
        <InfoItem label="생산 시간" value={`${productionHours}시간`} />
        <InfoItem label="누적 생산수량" value={`${cumulativeQuantity}개`} />
        <InfoItem label="목표 수량" value={`${targetQuantity}개`} />
        <ProgressBar value={progressRate} />
      </InfoBox>
    </Section>
    
    {/* 점검 항목 섹션 */}
    <Section title="🔍 점검 항목">
      <CheckItem label="금형 외관" />
      <CheckItem label="금형 온도" />
      <CheckItem label="냉각수 상태" />
      <CheckItem label="에젝터 작동" />
    </Section>
    
    {/* 사진 및 메모 섹션 */}
    <Section title="📷 사진 및 메모">
      <ImageUpload />
      <TextArea label="특이사항" />
    </Section>
    
    {/* 저장 버튼 */}
    <Button
      variant="primary"
      size="large"
      onClick={handleSubmit}
      disabled={!productionQuantity}
    >
      저장 및 자동 연동
    </Button>
  </DailyCheckForm>
</MobileLayout>
```

---

## 관리자 대시보드

### 생산수량 기반 현황 대시보드

**페이지**: `/admin/production-dashboard`

**표시 항목:**

```
┌─────────────────────────────────────┐
│ 📊 생산 현황                          │
│                                     │
│ 금형: M-2024-001                    │
│ 협력사: ABC 금형                     │
│                                     │
│ 누적 생산수량: 9,500개               │
│ 목표 수량: 10,000개                  │
│ 진행률: 95% ████████████░           │
│                                     │
│ 다음 점검 예정:                      │
│ • 습합점검: 500개 남음 (5%)          │
│ • 정기점검: 50,500개 남음 (505%)     │
│                                     │
│ 타수 현황:                           │
│ • 현재 타수: 950,000타               │
│ • 최대 타수: 1,000,000타             │
│ • 남은 타수: 50,000타 (5%)           │
│                                     │
│ 생성된 알람: 2건                     │
│ • 습합점검 임박                      │
│ • 타수 임계치 도달                   │
└─────────────────────────────────────┘
```

---

## API 엔드포인트

### 협력사

```
POST   /api/plant/daily-checks                    # 일상점검 + 생산수량 입력
GET    /api/plant/daily-checks/:moldId            # 일상점검 이력
GET    /api/plant/production-summary/:moldId      # 생산 요약
```

### 관리자

```
GET    /api/admin/production-dashboard            # 생산 현황 대시보드
GET    /api/admin/production-summary/:moldId      # 금형별 생산 요약
GET    /api/admin/production-alerts               # 생산 관련 알람 목록
```

---

## 결론

이 시스템을 통해:
- ✅ 일상점검 시 생산수량 필수 입력
- ✅ 입력된 수량으로 모든 업무 자동 연동
- ✅ 점검 스케줄 자동 업데이트
- ✅ 타수 기록 자동 업데이트
- ✅ 알람 자동 생성
- ✅ 알림 자동 발송
- ✅ 중복 입력 제거
- ✅ 데이터 일관성 보장
