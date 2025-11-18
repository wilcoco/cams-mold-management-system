# Apple Design System 가이드

## 개요

QR + GPS 기반 금형관리시스템의 UI/UX는 Apple Design System을 기반으로 설계되었습니다.

---

## 🎨 컬러 시스템

### Primary Colors (Sky Blue) - #0ea5e9

**용도**: 주요 액션, 링크, 강조 요소

| 단계 | HEX | 사용 예시 |
|------|-----|----------|
| 50 | #f0f9ff | 배경 하이라이트 |
| 100 | #e0f2fe | 호버 배경 |
| 200 | #bae6fd | 선택 배경 |
| 300 | #7dd3fc | 비활성 상태 |
| 400 | #38bdf8 | 보조 버튼 |
| **500** | **#0ea5e9** | **기본 버튼, 링크** |
| 600 | #0284c7 | 호버 상태 |
| 700 | #0369a1 | 액티브 상태 |
| 800 | #075985 | 강조 텍스트 |
| 900 | #0c4a6e | 다크 배경 |

### Neutral Colors (Gray) - #737373

**용도**: 텍스트, 배경, 테두리

| 단계 | HEX | 사용 예시 |
|------|-----|----------|
| 50 | #fafafa | 페이지 배경 |
| 100 | #f5f5f5 | 카드 배경 |
| 200 | #e5e5e5 | 테두리 |
| 300 | #d4d4d4 | 비활성 테두리 |
| 400 | #a3a3a3 | 플레이스홀더 |
| **500** | **#737373** | **보조 텍스트** |
| 600 | #525252 | 기본 텍스트 |
| 700 | #404040 | 강조 텍스트 |
| 800 | #262626 | 헤더 텍스트 |
| 900 | #171717 | 타이틀 텍스트 |

### Accent Colors

| 컬러 | HEX | 용도 |
|------|-----|------|
| Orange | #ff9500 | 경고, 대기 상태 |
| Green | #30d158 | 성공, 완료 상태 |
| Red | #ff3b30 | 오류, 긴급 상태 |
| Yellow | #ffcc00 | 주의 |
| Blue | #007aff | 정보 |
| Purple | #af52de | 특별 상태 |

---

## 📝 타이포그래피

### 폰트 패밀리

```css
font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', 
             'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

### 폰트 크기

| 크기 | rem | px | 용도 |
|------|-----|----|----|
| xs | 0.75rem | 12px | 캡션, 라벨 |
| sm | 0.875rem | 14px | 보조 텍스트 |
| base | 1rem | 16px | 본문 텍스트 |
| lg | 1.125rem | 18px | 강조 텍스트 |
| xl | 1.25rem | 20px | 서브 타이틀 |
| 2xl | 1.5rem | 24px | 섹션 제목 |
| 3xl | 1.875rem | 30px | 페이지 제목 |
| 4xl | 2.25rem | 36px | 메인 타이틀 |

### 폰트 굵기

- Light: 300
- Regular: 400
- Medium: 500
- Semibold: 600
- Bold: 700

---

## 🎭 애니메이션

### Fade In
```css
animation: fade-in 0.2s ease-out;
```
**용도**: 모달, 툴팁, 알림 표시

### Slide Up
```css
animation: slide-up 0.2s ease-out;
```
**용도**: 바텀 시트, 카드 등장

### Slide Down
```css
animation: slide-down 0.2s ease-out;
```
**용도**: 드롭다운, 메뉴 펼치기

### Scale In
```css
animation: scale-in 0.2s ease-out;
```
**용도**: 버튼 클릭, 아이콘 강조

### Pulse
```css
animation: pulse 2s infinite;
```
**용도**: 로딩 상태, 알림 배지

---

## 🌑 그림자 (Shadow)

### Apple Shadow
```css
box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 
            0 1px 2px rgba(0, 0, 0, 0.04);
```
**용도**: 카드, 버튼, 모달

### Apple Shadow Large
```css
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12), 
            0 2px 4px rgba(0, 0, 0, 0.08);
```
**용도**: 드롭다운, 팝오버, 플로팅 버튼

---

## 📐 Border Radius

| 크기 | 값 | 용도 |
|------|-----|------|
| sm | 0.375rem (6px) | 작은 버튼, 배지 |
| md | 0.5rem (8px) | 입력 필드 |
| lg | 0.75rem (12px) | 버튼 |
| xl | 1rem (16px) | 카드 |
| 2xl | 1rem (16px) | 큰 카드 |
| 3xl | 1.5rem (24px) | 모달, 바텀 시트 |
| full | 9999px | 원형 버튼, 아바타 |

---

## 🎯 컴포넌트 스타일

### Button

#### Primary Button
```jsx
<button className="bg-primary-500 text-white px-5 py-2.5 rounded-xl 
                   shadow-apple hover:bg-primary-600 hover:shadow-apple-lg 
                   active:scale-95 transition-all">
  저장
</button>
```

#### Secondary Button
```jsx
<button className="bg-neutral-100 text-neutral-900 px-5 py-2.5 rounded-xl 
                   hover:bg-neutral-200 transition-all">
  취소
</button>
```

#### Success Button
```jsx
<button className="bg-accent-green text-white px-5 py-2.5 rounded-xl 
                   shadow-apple hover:shadow-apple-lg active:scale-95">
  완료
</button>
```

#### Warning Button
```jsx
<button className="bg-accent-orange text-white px-5 py-2.5 rounded-xl 
                   shadow-apple hover:shadow-apple-lg active:scale-95">
  경고
</button>
```

#### Error Button
```jsx
<button className="bg-accent-red text-white px-5 py-2.5 rounded-xl 
                   shadow-apple hover:shadow-apple-lg active:scale-95">
  삭제
</button>
```

### Card
```jsx
<div className="bg-white rounded-2xl shadow-apple p-6 
                hover:shadow-apple-lg transition-all">
  카드 내용
</div>
```

### Input
```jsx
<input className="w-full px-4 py-3 rounded-xl border border-neutral-200 
                  focus:border-primary-500 focus:ring-2 focus:ring-primary-100 
                  transition-all" />
```

### Badge
```jsx
<span className="inline-flex items-center px-3 py-1 rounded-full 
                 bg-primary-100 text-primary-700 text-sm font-medium">
  진행중
</span>
```

---

## 📱 반응형 디자인

### Breakpoints

| 크기 | 최소 너비 | 용도 |
|------|----------|------|
| sm | 640px | 모바일 가로 |
| md | 768px | 태블릿 세로 |
| lg | 1024px | 태블릿 가로 |
| xl | 1280px | 데스크톱 |
| 2xl | 1536px | 큰 데스크톱 |

### 모바일 우선 설계

```jsx
<div className="text-sm md:text-base lg:text-lg">
  반응형 텍스트
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  반응형 그리드
</div>
```

---

## 🌓 다크 모드

### 자동 감지
```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #000000;
    --text-primary: #ffffff;
  }
}
```

### Tailwind 클래스
```jsx
<div className="bg-white dark:bg-neutral-900 
                text-neutral-900 dark:text-white">
  다크 모드 지원
</div>
```

---

## ✨ 특수 효과

### Glass Effect (유리 효과)
```jsx
<div className="bg-white/80 backdrop-blur-lg border border-white/20 
                rounded-2xl shadow-apple">
  Glass 효과
</div>
```

### Gradient Background
```jsx
<div className="bg-gradient-to-r from-primary-500 to-primary-700 
                text-white rounded-2xl p-6">
  그라데이션 배경
</div>
```

---

## 🎨 상태별 컬러 가이드

### 금형 상태
- **정상**: `bg-accent-green text-white`
- **점검 필요**: `bg-accent-orange text-white`
- **수리 필요**: `bg-accent-red text-white`
- **대기**: `bg-neutral-400 text-white`

### 점검 결과
- **양호**: `bg-accent-green/10 text-accent-green`
- **정비요**: `bg-accent-orange/10 text-accent-orange`
- **수리요**: `bg-accent-red/10 text-accent-red`

### 우선순위
- **긴급**: `bg-accent-red text-white`
- **높음**: `bg-accent-orange text-white`
- **중간**: `bg-accent-blue text-white`
- **낮음**: `bg-neutral-400 text-white`

---

## 📋 아이콘 가이드

### 추천 아이콘 라이브러리
- **Lucide React**: Apple 스타일과 잘 어울리는 아이콘
- **Heroicons**: Tailwind에서 제공하는 아이콘

### 아이콘 크기
- xs: 16px
- sm: 20px
- base: 24px
- lg: 28px
- xl: 32px

---

## 🎯 접근성 (Accessibility)

### 포커스 스타일
```jsx
<button className="focus:outline-none focus:ring-2 focus:ring-primary-500 
                   focus:ring-offset-2">
  접근성 버튼
</button>
```

### 색상 대비
- 텍스트와 배경의 명도 대비: 최소 4.5:1
- 큰 텍스트: 최소 3:1

### 키보드 네비게이션
- Tab으로 이동 가능
- Enter/Space로 활성화
- Esc로 닫기

---

## 📐 간격 (Spacing)

| 크기 | 값 | 용도 |
|------|-----|------|
| xs | 0.25rem (4px) | 아이콘 간격 |
| sm | 0.5rem (8px) | 작은 여백 |
| md | 1rem (16px) | 기본 여백 |
| lg | 1.5rem (24px) | 섹션 간격 |
| xl | 2rem (32px) | 큰 섹션 간격 |
| 2xl | 3rem (48px) | 페이지 간격 |

---

## 🎬 트랜지션

### 속도
- **fast**: 150ms - 버튼 호버, 작은 변화
- **base**: 200ms - 일반적인 트랜지션
- **slow**: 300ms - 모달, 큰 변화

### Easing
```css
transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 📱 모바일 최적화

### 터치 타겟
- 최소 크기: 44x44px
- 권장 크기: 48x48px

### 스와이프 제스처
- 좌우 스와이프: 이전/다음
- 위로 스와이프: 상세 보기
- 아래로 스와이프: 닫기

---

## 🎨 예제 화면

### 로그인 화면
```jsx
<div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    <div className="bg-white rounded-3xl shadow-apple p-8 animate-slide-up">
      <h1 className="text-3xl font-bold text-neutral-900 mb-8">
        금형관리시스템
      </h1>
      <input 
        type="text" 
        placeholder="아이디"
        className="w-full px-4 py-3 rounded-xl border border-neutral-200 
                   focus:border-primary-500 focus:ring-2 focus:ring-primary-100 
                   mb-4 transition-all"
      />
      <input 
        type="password" 
        placeholder="비밀번호"
        className="w-full px-4 py-3 rounded-xl border border-neutral-200 
                   focus:border-primary-500 focus:ring-2 focus:ring-primary-100 
                   mb-6 transition-all"
      />
      <button className="w-full bg-primary-500 text-white py-3 rounded-xl 
                         shadow-apple hover:bg-primary-600 hover:shadow-apple-lg 
                         active:scale-95 transition-all">
        로그인
      </button>
    </div>
  </div>
</div>
```

### 대시보드 카드
```jsx
<div className="bg-white rounded-2xl shadow-apple p-6 
                hover:shadow-apple-lg transition-all animate-fade-in">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-xl font-semibold text-neutral-900">
      금형 현황
    </h3>
    <span className="inline-flex items-center px-3 py-1 rounded-full 
                     bg-accent-green/10 text-accent-green text-sm font-medium">
      정상
    </span>
  </div>
  <div className="space-y-3">
    <div className="flex justify-between">
      <span className="text-neutral-600">총 금형</span>
      <span className="font-semibold text-neutral-900">150개</span>
    </div>
    <div className="flex justify-between">
      <span className="text-neutral-600">가동 중</span>
      <span className="font-semibold text-accent-green">120개</span>
    </div>
    <div className="flex justify-between">
      <span className="text-neutral-600">점검 필요</span>
      <span className="font-semibold text-accent-orange">20개</span>
    </div>
  </div>
</div>
```

---

## 결론

이 디자인 시스템을 따라 일관되고 직관적인 UI/UX를 구현하여 사용자 경험을 극대화합니다.
