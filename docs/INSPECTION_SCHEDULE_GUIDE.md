# 생산수량 기반 점검 스케줄 및 QR 알람 가이드

## 개요

본사에서 협력사별 금형의 목표 생산수량을 지정하고, 생산수량에 따라 자동으로 점검 일정을 관리하며, QR 스캔 시 실시간 알람을 표시하는 시스템입니다.

---

## 주요 기능

### 1. 생산수량 기반 점검 스케줄 (`inspection_schedules`)

**본사 설정 항목:**
- 목표 생산수량
- 점검 유형 (정기/습합/세척)
- 점검 주기 (수량 기준, 일수 기준)
- 알람 임계값

**자동 계산:**
- 다음 점검 예정 수량/일
- 점검 지연 여부
- 알람 발생 시점

### 2. QR 스캔 알람 (`qr_scan_alerts`)

**알람 유형:**
- `inspection_due` - 점검 예정 (3일 이내)
- `inspection_overdue` - 점검 지연
- `production_target` - 생산 목표 달성
- `urgent_repair` - 긴급 수리 필요
- `maintenance_required` - 타수 임계치 도달
- `status_warning` - 상태 주의

**우선순위:**
- Urgent (🔴) - 전체 화면 모달
- High (🟠) - 상단 고정 배너
- Medium (🟡) - 알림 패널
- Low (🟢) - 토스트 메시지

---

## 운영 프로세스

### 본사: 점검 스케줄 설정
```
1. 금형 선택
2. 협력사 선택
3. 목표 생산수량 입력 (예: 100,000개)
4. 점검 유형 선택 (습합점검)
5. 점검 주기 설정 (10,000개마다)
6. 알람 임계값 설정 (9,000개)
7. 저장
```

### 협력사: 생산수량 입력
```
1. QR 코드 스캔
2. 알람 확인 (있는 경우)
3. 당일 생산수량 입력
4. 자동 누적 계산
5. 다음 점검 예정 확인
```

### 협력사: QR 스캔 시 알람 확인
```
1. QR 스캔
2. 로그인
3. 알람 자동 생성 및 표시
4. 알람 확인
5. 필요 시 액션 (점검 실시, 수리 요청)
```

---

## API 엔드포인트

### 본사
- `POST /api/hq/inspection-schedules` - 스케줄 생성
- `GET /api/hq/inspection-schedules` - 스케줄 목록
- `PUT /api/hq/inspection-schedules/:id` - 스케줄 수정

### 협력사
- `POST /api/plant/production-quantity` - 생산수량 입력
- `GET /api/plant/inspection-schedules` - 내 점검 스케줄
- `POST /api/plant/inspections` - 점검 실시

### QR 스캔
- `GET /api/qr/scan-alerts/:moldId` - 알람 조회
- `POST /api/qr/scan-alerts/:id/acknowledge` - 알람 확인

---

## 알람 생성 로직

```javascript
// QR 스캔 시 자동 알람 생성
async function generateQRScanAlerts(moldId, userId) {
  const alerts = [];
  
  // 1. 점검 스케줄 확인
  const schedules = await InspectionSchedule.findAll({
    where: { mold_id: moldId, schedule_status: 'active' }
  });
  
  for (const schedule of schedules) {
    if (schedule.days_until_due <= 3) {
      alerts.push({
        alert_type: 'inspection_due',
        alert_priority: 'medium',
        alert_message: `${schedule.days_until_due}일 후 점검 예정`
      });
    }
    
    if (schedule.is_overdue) {
      alerts.push({
        alert_type: 'inspection_overdue',
        alert_priority: 'high',
        alert_message: `점검이 ${schedule.overdue_days}일 지연`
      });
    }
  }
  
  // 2. 금형 상태 확인
  const mold = await Mold.findByPk(moldId);
  if (mold.status === 'urgent_repair') {
    alerts.push({
      alert_type: 'urgent_repair',
      alert_priority: 'urgent',
      alert_message: '긴급 수리 필요'
    });
  }
  
  return alerts;
}
```
