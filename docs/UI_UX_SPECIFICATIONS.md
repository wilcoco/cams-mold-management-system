# UI/UX 상세 명세서

**QR + GPS 기반 금형관리시스템 Ver.09**

---

## 🎨 헤더 디자인 (공통)

모든 페이지 상단에 회사 영문명이 표시됩니다.

```jsx
<header className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
  <div className="flex items-center gap-3">
    <h1 className="text-sm font-light tracking-wider">
      Creative Auto Module System
    </h1>
  </div>
  <div className="flex items-center gap-4">
    {/* 페이지별 추가 요소 */}
  </div>
</header>
```

### 헤더 스타일

```css
/* Header */
background: #0f172a;        /* Slate 900 */
color: #ffffff;
padding: 12px 24px;
font-size: 14px;
font-weight: 300;
letter-spacing: 0.05em;     /* 자간 */
```

---

## 📱 로그인 화면

### 화면 구조

참고 사이트의 로그인 화면 구조를 기반으로 설계되었습니다.

```
┌─────────────────────────────────────┐
│ Creative Auto Module System         │
├─────────────────────────────────────┤
│                                     │
│         [로고 또는 시스템명]          │
│                                     │
│    ┌─────────────────────────┐    │
│    │   아이디 입력             │    │
│    └─────────────────────────┘    │
│                                     │
│    ┌─────────────────────────┐    │
│    │   비밀번호 입력           │    │
│    └─────────────────────────┘    │
│                                     │
│    [ ] 로그인 상태 유지              │
│                                     │
│    ┌─────────────────────────┐    │
│    │      로그인 버튼          │    │
│    └─────────────────────────┘    │
│                                     │
│    비밀번호 찾기  |  회원가입        │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 디자인 스펙

### 컬러 스킴

```css
/* Primary Colors */
--primary: #0ea5e9;        /* Sky Blue - 로그인 버튼 */
--primary-hover: #0284c7;  /* Darker Blue - 호버 상태 */

/* Neutral Colors */
--background: #f8fafc;     /* Light Gray - 배경 */
--card-bg: #ffffff;        /* White - 로그인 카드 배경 */
--border: #e2e8f0;         /* Light Gray - 테두리 */
--text-primary: #1e293b;   /* Dark Gray - 주요 텍스트 */
--text-secondary: #64748b; /* Medium Gray - 보조 텍스트 */

/* Status Colors */
--error: #ff3b30;          /* Red - 에러 메시지 */
--success: #30d158;        /* Green - 성공 메시지 */
```

### 타이포그래피

```css
/* Font Family */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
             'Helvetica Neue', Arial, sans-serif;

/* Font Sizes */
--text-3xl: 30px;  /* 로고/제목 */
--text-xl: 20px;   /* 부제목 */
--text-base: 16px; /* 일반 텍스트 */
--text-sm: 14px;   /* 작은 텍스트 */
--text-xs: 12px;   /* 매우 작은 텍스트 */

/* Font Weights */
--font-light: 300;
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### 레이아웃

```css
/* Login Card */
width: 400px;
max-width: 90vw;
padding: 48px 40px;
border-radius: 24px; /* rounded-3xl */
box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12); /* shadow-apple-lg */

/* Input Fields */
height: 48px;
padding: 12px 16px;
border-radius: 12px; /* rounded-xl */
border: 1px solid #e2e8f0;
font-size: 16px;

/* Input Focus */
border-color: #0ea5e9;
box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);

/* Login Button */
height: 48px;
border-radius: 12px;
font-size: 16px;
font-weight: 600;
background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
box-shadow: 0 2px 8px rgba(14, 165, 233, 0.3);

/* Spacing */
gap: 16px; /* 요소 간 간격 */
```

---

## 🔐 로그인 화면 상세

### 컴포넌트 구조

```jsx
<div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
  <div className="w-full max-w-md">
    {/* 로고 및 제목 */}
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 
                      bg-primary rounded-2xl mb-4 shadow-apple">
        {/* 로고 아이콘 */}
        <svg className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        금형관리시스템
      </h1>
      <p className="text-sm text-slate-600">
        QR + GPS 기반 통합 관리 플랫폼
      </p>
    </div>

    {/* 로그인 카드 */}
    <div className="bg-white rounded-3xl shadow-apple-lg p-10">
      <form onSubmit={handleLogin}>
        {/* 아이디 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            아이디
          </label>
          <input
            type="text"
            className="w-full h-12 px-4 border border-slate-200 rounded-xl
                       focus:border-primary focus:ring-4 focus:ring-primary/10
                       transition-all duration-200"
            placeholder="아이디를 입력하세요"
          />
        </div>

        {/* 비밀번호 입력 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-2">
            비밀번호
          </label>
          <input
            type="password"
            className="w-full h-12 px-4 border border-slate-200 rounded-xl
                       focus:border-primary focus:ring-4 focus:ring-primary/10
                       transition-all duration-200"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        {/* 로그인 상태 유지 */}
        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="remember"
            className="w-4 h-4 text-primary border-slate-300 rounded
                       focus:ring-2 focus:ring-primary/20"
          />
          <label htmlFor="remember" className="ml-2 text-sm text-slate-600">
            로그인 상태 유지
          </label>
        </div>

        {/* 로그인 버튼 */}
        <button
          type="submit"
          className="w-full h-12 bg-gradient-to-r from-primary to-sky-600
                     text-white font-semibold rounded-xl
                     shadow-lg shadow-primary/30
                     hover:shadow-xl hover:shadow-primary/40
                     active:scale-[0.98]
                     transition-all duration-200"
        >
          로그인
        </button>

        {/* 하단 링크 */}
        <div className="flex items-center justify-center gap-4 mt-6 
                        text-sm text-slate-600">
          <a href="/forgot-password" 
             className="hover:text-primary transition-colors">
            비밀번호 찾기
          </a>
          <span className="text-slate-300">|</span>
          <a href="/register" 
             className="hover:text-primary transition-colors">
            회원가입
          </a>
        </div>
      </form>
    </div>

    {/* 푸터 */}
    <div className="text-center mt-8 text-xs text-slate-500">
      © 2024 금형관리시스템. All rights reserved.
    </div>
  </div>
</div>
```

---

## 🎭 상태별 UI

### 1. 기본 상태 (Default)

```css
/* Input Field */
border: 1px solid #e2e8f0;
background: #ffffff;

/* Login Button */
background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
cursor: pointer;
```

### 2. 포커스 상태 (Focus)

```css
/* Input Field Focus */
border-color: #0ea5e9;
box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
outline: none;
```

### 3. 호버 상태 (Hover)

```css
/* Login Button Hover */
box-shadow: 0 4px 16px rgba(14, 165, 233, 0.4);
transform: translateY(-1px);

/* Link Hover */
color: #0ea5e9;
text-decoration: underline;
```

### 4. 에러 상태 (Error)

```css
/* Input Field Error */
border-color: #ff3b30;
box-shadow: 0 0 0 4px rgba(255, 59, 48, 0.1);

/* Error Message */
color: #ff3b30;
font-size: 14px;
margin-top: 8px;
display: flex;
align-items: center;
gap: 4px;
```

```jsx
{/* 에러 메시지 예시 */}
<div className="flex items-center gap-2 mt-2 text-sm text-red-500">
  <svg className="w-4 h-4" />
  <span>아이디 또는 비밀번호가 올바르지 않습니다.</span>
</div>
```

### 5. 로딩 상태 (Loading)

```jsx
<button
  disabled
  className="w-full h-12 bg-slate-300 text-slate-500 font-semibold 
             rounded-xl cursor-not-allowed"
>
  <div className="flex items-center justify-center gap-2">
    <svg className="animate-spin w-5 h-5" />
    <span>로그인 중...</span>
  </div>
</button>
```

---

## 🔄 애니메이션

### 페이지 진입 애니메이션

```css
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.login-card {
  animation: fadeIn 0.4s ease-out;
}
```

### 버튼 클릭 애니메이션

```css
.login-button:active {
  transform: scale(0.98);
  transition: transform 0.1s ease;
}
```

### Input 포커스 애니메이션

```css
.input-field {
  transition: all 0.2s ease;
}

.input-field:focus {
  border-color: #0ea5e9;
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
}
```

---

## 📱 반응형 디자인

### 데스크톱 (≥ 768px)

```css
.login-container {
  width: 400px;
  padding: 48px 40px;
}

.logo-size {
  width: 64px;
  height: 64px;
}

.title-size {
  font-size: 30px;
}
```

### 태블릿 (≥ 640px, < 768px)

```css
.login-container {
  width: 90vw;
  max-width: 400px;
  padding: 40px 32px;
}

.logo-size {
  width: 56px;
  height: 56px;
}

.title-size {
  font-size: 26px;
}
```

### 모바일 (< 640px)

```css
.login-container {
  width: 100%;
  padding: 32px 24px;
  margin: 16px;
}

.logo-size {
  width: 48px;
  height: 48px;
}

.title-size {
  font-size: 24px;
}

.input-field {
  height: 44px;
  font-size: 16px; /* iOS zoom 방지 */
}
```

---

## 🔒 보안 기능

### 1. 비밀번호 표시/숨김

```jsx
<div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    className="w-full h-12 px-4 pr-12 border rounded-xl"
  />
  <button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 
               text-slate-400 hover:text-slate-600"
  >
    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
  </button>
</div>
```

### 2. 로그인 시도 제한

```jsx
{loginAttempts >= 5 && (
  <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-4">
    <p className="text-sm text-red-600">
      로그인 시도 횟수를 초과했습니다. 
      {remainingTime}초 후에 다시 시도해주세요.
    </p>
  </div>
)}
```

### 3. CAPTCHA (5회 실패 시)

```jsx
{showCaptcha && (
  <div className="mb-4">
    <label className="block text-sm font-medium text-slate-700 mb-2">
      보안 문자
    </label>
    <div className="flex gap-2">
      <img src={captchaImage} alt="CAPTCHA" className="h-12 rounded-lg" />
      <input
        type="text"
        placeholder="보안 문자 입력"
        className="flex-1 h-12 px-4 border rounded-xl"
      />
    </div>
  </div>
)}
```

---

## 🌐 다국어 지원

### 언어 선택

```jsx
<div className="absolute top-4 right-4">
  <select className="px-3 py-1 border border-slate-200 rounded-lg text-sm">
    <option value="ko">한국어</option>
    <option value="en">English</option>
    <option value="zh">中文</option>
  </select>
</div>
```

---

## ♿ 접근성 (Accessibility)

### ARIA 속성

```jsx
<form role="form" aria-label="로그인 폼">
  <div>
    <label htmlFor="username" className="...">
      아이디
    </label>
    <input
      id="username"
      type="text"
      aria-required="true"
      aria-invalid={errors.username ? "true" : "false"}
      aria-describedby={errors.username ? "username-error" : undefined}
    />
    {errors.username && (
      <div id="username-error" role="alert" className="text-red-500">
        {errors.username}
      </div>
    )}
  </div>
</form>
```

### 키보드 네비게이션

```jsx
// Tab 순서
1. 아이디 입력
2. 비밀번호 입력
3. 로그인 상태 유지 체크박스
4. 로그인 버튼
5. 비밀번호 찾기 링크
6. 회원가입 링크

// Enter 키로 로그인
<form onSubmit={handleLogin} onKeyDown={handleKeyDown}>
  {/* ... */}
</form>
```

---

## 🧪 테스트 케이스

### 1. 정상 로그인

```javascript
// Given: 유효한 아이디와 비밀번호
username: "admin@company.com"
password: "ValidPassword123!"

// When: 로그인 버튼 클릭
// Then: 대시보드로 이동
```

### 2. 잘못된 자격증명

```javascript
// Given: 잘못된 아이디 또는 비밀번호
username: "wrong@email.com"
password: "WrongPassword"

// When: 로그인 버튼 클릭
// Then: 에러 메시지 표시
"아이디 또는 비밀번호가 올바르지 않습니다."
```

### 3. 빈 필드

```javascript
// Given: 빈 입력 필드
username: ""
password: ""

// When: 로그인 버튼 클릭
// Then: 유효성 검사 에러 표시
"아이디를 입력하세요."
"비밀번호를 입력하세요."
```

### 4. 로그인 상태 유지

```javascript
// Given: "로그인 상태 유지" 체크
rememberMe: true

// When: 로그인 성공
// Then: 토큰을 localStorage에 저장 (7일 유효)
```

---

## 📊 API 연동

### 로그인 API

```javascript
POST /api/auth/login

// Request
{
  "username": "user@company.com",
  "password": "password123",
  "rememberMe": true
}

// Response (Success)
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "user@company.com",
      "name": "홍길동",
      "role": "plant",
      "company": "협력사A"
    },
    "expiresIn": 3600
  }
}

// Response (Error)
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "아이디 또는 비밀번호가 올바르지 않습니다."
  }
}
```

### 로그인 처리 로직

```javascript
async function handleLogin(e) {
  e.preventDefault();
  
  // 1. 유효성 검사
  if (!username || !password) {
    setErrors({
      username: !username ? "아이디를 입력하세요." : "",
      password: !password ? "비밀번호를 입력하세요." : ""
    });
    return;
  }
  
  // 2. 로딩 상태
  setLoading(true);
  setErrors({});
  
  try {
    // 3. API 호출
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, rememberMe })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // 4. 토큰 저장
      if (rememberMe) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('refreshToken', data.data.refreshToken);
      } else {
        sessionStorage.setItem('token', data.data.token);
      }
      
      // 5. 사용자 정보 저장
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // 6. 대시보드로 이동
      const dashboardPath = getDashboardPath(data.data.user.role);
      navigate(dashboardPath);
      
    } else {
      // 7. 에러 처리
      setErrors({
        general: data.error.message
      });
      
      // 8. 로그인 시도 횟수 증가
      setLoginAttempts(prev => prev + 1);
    }
    
  } catch (error) {
    setErrors({
      general: "로그인 중 오류가 발생했습니다. 다시 시도해주세요."
    });
  } finally {
    setLoading(false);
  }
}

// 역할별 대시보드 경로
function getDashboardPath(role) {
  const paths = {
    'admin': '/admin/dashboard',
    'hq': '/hq/dashboard',
    'plant': '/partner/dashboard',
    'maker': '/maker/dashboard'
  };
  return paths[role] || '/dashboard';
}
```

---

## 🎯 사용자 경험 (UX) 개선

### 1. 자동 포커스

```javascript
useEffect(() => {
  // 페이지 로드 시 아이디 입력 필드에 자동 포커스
  usernameRef.current?.focus();
}, []);
```

### 2. Enter 키 지원

```javascript
function handleKeyDown(e) {
  if (e.key === 'Enter' && !loading) {
    handleLogin(e);
  }
}
```

### 3. 비밀번호 강도 표시 (회원가입 시)

```jsx
<div className="mt-2">
  <div className="flex gap-1">
    <div className={`h-1 flex-1 rounded ${strength >= 1 ? 'bg-red-500' : 'bg-slate-200'}`} />
    <div className={`h-1 flex-1 rounded ${strength >= 2 ? 'bg-yellow-500' : 'bg-slate-200'}`} />
    <div className={`h-1 flex-1 rounded ${strength >= 3 ? 'bg-green-500' : 'bg-slate-200'}`} />
  </div>
  <p className="text-xs text-slate-600 mt-1">
    {strengthText}
  </p>
</div>
```

### 4. 로딩 인디케이터

```jsx
{loading && (
  <div className="absolute inset-0 bg-white/80 flex items-center justify-center rounded-3xl">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-slate-600">로그인 중...</p>
    </div>
  </div>
)}
```

---

## 📷 QR 코드 스캔 페이지

### 화면 구조

참고 사이트의 QR 스캔 페이지 구조를 기반으로 설계되었습니다.

```
┌─────────────────────────────────────┐
│ Creative Auto Module System         │
├─────────────────────────────────────┤
│  [← 뒤로]    QR 스캔    [설정 ⚙]   │
├─────────────────────────────────────┤
│                                     │
│     ┌─────────────────────┐        │
│     │                     │        │
│     │   [카메라 뷰파인더]   │        │
│     │                     │        │
│     │   ┌───────────┐     │        │
│     │   │           │     │        │
│     │   │  스캔 영역  │     │        │
│     │   │           │     │        │
│     │   └───────────┘     │        │
│     │                     │        │
│     └─────────────────────┘        │
│                                     │
│   금형 QR 코드를 스캔하세요          │
│                                     │
│   ┌─────────────────────────┐      │
│   │  [💡] 수동 입력          │      │
│   └─────────────────────────┘      │
│                                     │
│   ┌─────────────────────────┐      │
│   │  [📋] 최근 스캔 이력      │      │
│   └─────────────────────────┘      │
│                                     │
└─────────────────────────────────────┘
```

---

## 🎨 QR 스캔 페이지 디자인 스펙

### 컬러 스킴

```css
/* Camera View */
--camera-bg: #000000;           /* Black - 카메라 배경 */
--scan-frame: #0ea5e9;          /* Sky Blue - 스캔 프레임 */
--scan-frame-active: #30d158;   /* Green - 스캔 성공 */
--scan-frame-error: #ff3b30;    /* Red - 스캔 실패 */

/* Overlay */
--overlay-bg: rgba(0, 0, 0, 0.5);  /* Semi-transparent black */
--scan-guide-text: #ffffff;         /* White - 가이드 텍스트 */

/* Buttons */
--manual-input-bg: #ffffff;         /* White */
--manual-input-border: #e2e8f0;     /* Light Gray */
```

### 레이아웃

```css
/* Camera Viewport */
width: 100%;
height: 60vh;
background: #000000;
position: relative;

/* Scan Frame */
width: 280px;
height: 280px;
border: 3px solid #0ea5e9;
border-radius: 24px;
position: absolute;
top: 50%;
left: 50%;
transform: translate(-50%, -50%);

/* Scan Corners (4개 모서리 강조) */
width: 40px;
height: 40px;
border: 4px solid #0ea5e9;
position: absolute;

/* Guide Text */
font-size: 16px;
color: #ffffff;
text-align: center;
margin-top: 16px;
text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
```

---

## 📱 QR 스캔 페이지 상세

### 컴포넌트 구조

```jsx
<div className="min-h-screen bg-slate-50 flex flex-col">
  {/* 상단 헤더 - 회사명 */}
  <header className="bg-slate-900 text-white px-6 py-3">
    <h1 className="text-sm font-light tracking-wider">
      Creative Auto Module System
    </h1>
  </header>

  {/* 페이지 헤더 */}
  <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
      <ArrowLeftIcon className="w-6 h-6 text-slate-700" />
    </button>
    <h2 className="text-lg font-semibold text-slate-900">QR 스캔</h2>
    <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
      <SettingsIcon className="w-6 h-6 text-slate-700" />
    </button>
  </div>

  {/* 카메라 뷰 */}
  <div className="relative bg-black" style={{height: '60vh'}}>
    {/* 카메라 스트림 */}
    <video
      ref={videoRef}
      autoPlay
      playsInline
      className="w-full h-full object-cover"
    />

    {/* 오버레이 및 스캔 프레임 */}
    <div className="absolute inset-0 flex items-center justify-center">
      {/* 반투명 오버레이 (스캔 영역 제외) */}
      <div className="absolute inset-0 bg-black/50" />
      
      {/* 스캔 프레임 */}
      <div className="relative z-10 w-[280px] h-[280px]">
        {/* 메인 프레임 */}
        <div className={`
          w-full h-full rounded-3xl border-3 transition-colors duration-300
          ${scanning ? 'border-primary' : 'border-white/50'}
          ${scanSuccess ? 'border-green-500' : ''}
          ${scanError ? 'border-red-500' : ''}
        `}>
          {/* 4개 모서리 강조 */}
          <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-3xl" />
          <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-3xl" />
          <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-3xl" />
          <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-3xl" />
          
          {/* 스캔 라인 애니메이션 */}
          {scanning && (
            <div className="absolute inset-x-0 h-1 bg-primary/50 animate-scan-line" />
          )}
        </div>
        
        {/* 스캔 가이드 텍스트 */}
        <p className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-white text-center text-sm whitespace-nowrap drop-shadow-lg">
          {scanStatus === 'idle' && '금형 QR 코드를 스캔하세요'}
          {scanStatus === 'scanning' && '스캔 중...'}
          {scanStatus === 'success' && '✓ 스캔 완료!'}
          {scanStatus === 'error' && '✗ 인식 실패. 다시 시도하세요'}
        </p>
      </div>
    </div>

    {/* 플래시 토글 버튼 */}
    <button
      onClick={toggleFlash}
      className="absolute top-4 right-4 p-3 bg-black/50 rounded-full backdrop-blur-sm"
    >
      {flashOn ? (
        <FlashOnIcon className="w-6 h-6 text-yellow-400" />
      ) : (
        <FlashOffIcon className="w-6 h-6 text-white" />
      )}
    </button>
  </div>

  {/* 하단 액션 영역 */}
  <div className="flex-1 bg-slate-50 p-4 space-y-3">
    {/* 수동 입력 버튼 */}
    <button
      onClick={() => setShowManualInput(true)}
      className="w-full flex items-center justify-center gap-3 p-4 
                 bg-white border border-slate-200 rounded-2xl
                 hover:bg-slate-50 active:scale-[0.98]
                 transition-all duration-200 shadow-sm"
    >
      <KeyboardIcon className="w-5 h-5 text-slate-600" />
      <span className="font-medium text-slate-700">수동 입력</span>
    </button>

    {/* 최근 스캔 이력 */}
    <button
      onClick={() => navigate('/scan-history')}
      className="w-full flex items-center justify-center gap-3 p-4 
                 bg-white border border-slate-200 rounded-2xl
                 hover:bg-slate-50 active:scale-[0.98]
                 transition-all duration-200 shadow-sm"
    >
      <HistoryIcon className="w-5 h-5 text-slate-600" />
      <span className="font-medium text-slate-700">최근 스캔 이력</span>
    </button>

    {/* 도움말 */}
    <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-2xl">
      <div className="flex items-start gap-3">
        <InfoIcon className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-blue-900">
          <p className="font-medium mb-1">스캔 팁</p>
          <ul className="space-y-1 text-blue-700">
            <li>• QR 코드를 프레임 안에 맞춰주세요</li>
            <li>• 조명이 충분한 곳에서 스캔하세요</li>
            <li>• 카메라와 QR 코드 사이 거리: 10~30cm</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</div>
```

---

## 🎭 스캔 상태별 UI

### 1. 대기 상태 (Idle)

```css
/* Scan Frame */
border-color: rgba(255, 255, 255, 0.5);
animation: none;

/* Guide Text */
"금형 QR 코드를 스캔하세요"
color: #ffffff;
```

### 2. 스캔 중 (Scanning)

```css
/* Scan Frame */
border-color: #0ea5e9;
animation: pulse 2s infinite;

/* Scan Line */
display: block;
animation: scan-line 2s linear infinite;

/* Guide Text */
"스캔 중..."
color: #0ea5e9;
```

### 3. 스캔 성공 (Success)

```css
/* Scan Frame */
border-color: #30d158;
animation: success-pulse 0.5s ease-out;

/* Guide Text */
"✓ 스캔 완료!"
color: #30d158;
font-weight: 600;

/* Success Feedback */
- 햅틱 피드백 (진동)
- 성공 사운드
- 0.5초 후 자동 이동
```

### 4. 스캔 실패 (Error)

```css
/* Scan Frame */
border-color: #ff3b30;
animation: shake 0.5s ease-out;

/* Guide Text */
"✗ 인식 실패. 다시 시도하세요"
color: #ff3b30;
font-weight: 600;

/* Error Feedback */
- 햅틱 피드백 (진동)
- 에러 사운드
- 2초 후 대기 상태로 복귀
```

---

## 🔄 애니메이션

### 스캔 라인 애니메이션

```css
@keyframes scan-line {
  0% {
    top: 0;
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  90% {
    opacity: 1;
  }
  100% {
    top: 100%;
    opacity: 0;
  }
}

.animate-scan-line {
  animation: scan-line 2s linear infinite;
}
```

### 펄스 애니메이션

```css
@keyframes pulse {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.8;
    transform: scale(1.02);
  }
}
```

### 성공 애니메이션

```css
@keyframes success-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}
```

### 실패 애니메이션 (흔들림)

```css
@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  10%, 30%, 50%, 70%, 90% {
    transform: translateX(-5px);
  }
  20%, 40%, 60%, 80% {
    transform: translateX(5px);
  }
}
```

---

## 📱 반응형 디자인

### 데스크톱 (≥ 768px)

```css
.camera-view {
  height: 60vh;
  max-height: 600px;
}

.scan-frame {
  width: 320px;
  height: 320px;
}
```

### 모바일 (< 768px)

```css
.camera-view {
  height: 60vh;
}

.scan-frame {
  width: 280px;
  height: 280px;
}

/* 가로 모드 */
@media (orientation: landscape) {
  .camera-view {
    height: 80vh;
  }
}
```

---

## 🎯 카메라 기능

### 카메라 초기화

```javascript
async function initializeCamera() {
  try {
    // 1. 카메라 권한 요청
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment', // 후면 카메라
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }
    });
    
    // 2. 비디오 엘리먼트에 스트림 연결
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
    
    // 3. QR 스캐너 시작
    startQRScanner();
    
  } catch (error) {
    console.error('Camera initialization failed:', error);
    
    if (error.name === 'NotAllowedError') {
      showError('카메라 권한이 필요합니다.');
    } else if (error.name === 'NotFoundError') {
      showError('카메라를 찾을 수 없습니다.');
    } else {
      showError('카메라를 시작할 수 없습니다.');
    }
  }
}
```

### QR 코드 스캔

```javascript
function startQRScanner() {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  
  const scanInterval = setInterval(() => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      // 1. 비디오 프레임을 캔버스에 그리기
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // 2. 이미지 데이터 가져오기
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      
      // 3. QR 코드 디코딩 (jsQR 라이브러리 사용)
      const code = jsQR(imageData.data, imageData.width, imageData.height);
      
      if (code) {
        // 4. QR 코드 발견
        clearInterval(scanInterval);
        handleQRCodeDetected(code.data);
      }
    }
  }, 100); // 100ms마다 스캔
  
  return () => clearInterval(scanInterval);
}
```

### QR 코드 처리

```javascript
async function handleQRCodeDetected(qrData) {
  setScanStatus('scanning');
  
  try {
    // 1. QR 데이터 검증
    const moldCode = validateQRCode(qrData);
    
    if (!moldCode) {
      throw new Error('유효하지 않은 QR 코드입니다.');
    }
    
    // 2. 서버에 QR 스캔 기록
    const response = await fetch('/api/qr-sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        mold_code: moldCode,
        scan_location_lat: gpsLat,
        scan_location_lng: gpsLng
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // 3. 성공 처리
      setScanStatus('success');
      playSuccessSound();
      vibrateDevice(200);
      
      // 4. 금형 상세 페이지로 이동
      setTimeout(() => {
        navigate(`/molds/${data.data.mold_id}`, {
          state: { sessionId: data.data.session_id }
        });
      }, 500);
      
    } else {
      throw new Error(data.error.message);
    }
    
  } catch (error) {
    // 5. 에러 처리
    setScanStatus('error');
    playErrorSound();
    vibrateDevice([100, 50, 100]);
    
    showError(error.message);
    
    // 6. 2초 후 재시도 가능하도록
    setTimeout(() => {
      setScanStatus('idle');
    }, 2000);
  }
}
```

### 플래시 토글

```javascript
async function toggleFlash() {
  try {
    const stream = videoRef.current?.srcObject;
    const track = stream?.getVideoTracks()[0];
    
    if (!track) return;
    
    const capabilities = track.getCapabilities();
    
    if (capabilities.torch) {
      await track.applyConstraints({
        advanced: [{ torch: !flashOn }]
      });
      
      setFlashOn(!flashOn);
    } else {
      showError('이 기기는 플래시를 지원하지 않습니다.');
    }
  } catch (error) {
    console.error('Flash toggle failed:', error);
  }
}
```

---

## 📋 수동 입력 모달

### 모달 구조

```jsx
{showManualInput && (
  <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
    <div className="bg-white w-full sm:w-96 sm:rounded-3xl rounded-t-3xl p-6 
                    animate-slide-up sm:animate-fade-in">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-slate-900">
          금형 코드 입력
        </h2>
        <button
          onClick={() => setShowManualInput(false)}
          className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <XIcon className="w-5 h-5 text-slate-500" />
        </button>
      </div>

      {/* 입력 필드 */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          금형 코드
        </label>
        <input
          type="text"
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value.toUpperCase())}
          placeholder="M-2024-001"
          className="w-full h-12 px-4 border border-slate-200 rounded-xl
                     focus:border-primary focus:ring-4 focus:ring-primary/10
                     transition-all duration-200"
          autoFocus
        />
        <p className="mt-2 text-xs text-slate-500">
          예: M-2024-001, M-2024-002
        </p>
      </div>

      {/* 버튼 */}
      <div className="flex gap-3">
        <button
          onClick={() => setShowManualInput(false)}
          className="flex-1 h-12 border border-slate-200 rounded-xl
                     text-slate-700 font-medium
                     hover:bg-slate-50 active:scale-[0.98]
                     transition-all duration-200"
        >
          취소
        </button>
        <button
          onClick={handleManualSubmit}
          disabled={!manualCode}
          className="flex-1 h-12 bg-primary text-white font-semibold rounded-xl
                     hover:bg-primary-hover active:scale-[0.98]
                     disabled:bg-slate-300 disabled:cursor-not-allowed
                     transition-all duration-200"
        >
          확인
        </button>
      </div>
    </div>
  </div>
)}
```

---

## 📊 API 연동

### QR 스캔 세션 생성

```javascript
POST /api/qr-sessions

Request:
{
  "mold_code": "M-2024-001",
  "scan_location_lat": 37.5665,
  "scan_location_lng": 126.9780
}

Response (Success):
{
  "success": true,
  "data": {
    "session_id": 123,
    "mold_id": 45,
    "mold_code": "M-2024-001",
    "mold_name": "GV80 프론트 범퍼",
    "session_expires_at": "2024-03-15T18:00:00Z",
    "alerts": [
      {
        "type": "inspection_due",
        "priority": "high",
        "message": "정기점검 예정일이 3일 남았습니다."
      }
    ]
  }
}

Response (Error):
{
  "success": false,
  "error": {
    "code": "INVALID_QR_CODE",
    "message": "유효하지 않은 QR 코드입니다."
  }
}
```

### 최근 스캔 이력 조회

```javascript
GET /api/qr-sessions/recent?limit=10

Response:
{
  "success": true,
  "data": [
    {
      "session_id": 123,
      "mold_code": "M-2024-001",
      "mold_name": "GV80 프론트 범퍼",
      "scan_timestamp": "2024-03-15T10:30:00Z",
      "location": "협력사A"
    },
    // ...
  ]
}
```

---

## 🔔 알림 및 피드백

### 햅틱 피드백

```javascript
function vibrateDevice(pattern) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

// 사용 예시
vibrateDevice(200);           // 성공: 200ms
vibrateDevice([100, 50, 100]); // 실패: 100ms, 50ms 대기, 100ms
```

### 사운드 피드백

```javascript
function playSuccessSound() {
  const audio = new Audio('/sounds/success.mp3');
  audio.volume = 0.5;
  audio.play().catch(console.error);
}

function playErrorSound() {
  const audio = new Audio('/sounds/error.mp3');
  audio.volume = 0.5;
  audio.play().catch(console.error);
}
```

### 토스트 알림

```javascript
function showToast(message, type = 'info') {
  // type: 'success', 'error', 'warning', 'info'
  toast({
    title: message,
    variant: type,
    duration: 3000
  });
}
```

---

## 🧪 테스트 케이스

### 1. 정상 스캔

```javascript
// Given: 유효한 QR 코드
qrCode: "M-2024-001"

// When: QR 코드 스캔
// Then: 
- 스캔 성공 애니메이션
- 성공 사운드 및 햅틱
- 금형 상세 페이지로 이동
```

### 2. 잘못된 QR 코드

```javascript
// Given: 유효하지 않은 QR 코드
qrCode: "INVALID-CODE"

// When: QR 코드 스캔
// Then:
- 에러 애니메이션
- 에러 사운드 및 햅틱
- 에러 메시지 표시
- 2초 후 재시도 가능
```

### 3. 카메라 권한 거부

```javascript
// Given: 카메라 권한 없음
// When: 페이지 진입
// Then:
- 권한 요청 다이얼로그
- 거부 시 에러 메시지
- 수동 입력 옵션 제공
```

### 4. GPS 위치 오차

```javascript
// Given: GPS 위치 오차 > 50m
// When: QR 코드 스캔
// Then:
- 경고 메시지 표시
- 위치 재확인 요청
- 관리자 승인 필요
```

---

## 📊 관리자 대시보드 (요약)

관리자 대시보드는 시스템 전체를 관리하고 GPS 기반 금형 위치를 실시간으로 모니터링할 수 있는 통합 대시보드입니다.

### 주요 기능

1. **시스템 전체 관리**
   - 사용자 관리 (156명)
   - 권한 관리
   - 시스템 모니터링
   - 데이터 백업

2. **GPS 금형 위치 추적 맵**
   - 실시간 위치 표시 (1,234개 금형)
   - 마커 클러스터링
   - 상태별 필터링 (정상/점검/긴급/대기)
   - GPS 정확도 표시 (50m 기준)

3. **통계 대시보드**
   - 전체 금형: 1,234개
   - 가동 중: 856개 (69.3%)
   - 점검 필요: 45개
   - 수리 중: 45개 (3.6%)

4. **실시간 모니터링**
   - 최근 활동 피드
   - 알림 및 경고 (우선순위별)
   - 시스템 상태 (서버/DB/API)
   - 동시 접속자 추적

### 상세 문서

관리자 대시보드의 상세한 기능 및 사용 방법은 **[ADMIN_DASHBOARD_GUIDE.md](./ADMIN_DASHBOARD_GUIDE.md)**를 참조하세요.

---

## 📋 금형 체크리스트 페이지

### 화면 구조

금형 제작 완료 시 8개 카테고리에 대한 상세 점검을 수행하는 페이지입니다.

```
┌─────────────────────────────────────────────────────────────┐
│ Creative Auto Module System                                 │
├─────────────────────────────────────────────────────────────┤
│ [← 뒤로] 금형 체크리스트                                    │
│ M-2024-001 - GV80 프론트 범퍼                               │
│                                                              │
│ [총 점검항목: 103] [완료: 95] [진행률: 92%] [승인대기]      │
│ [점검완료 및 승인요청]                                       │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 금형 체크리스트                                      │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│ │ 차종: NO5 (기본차)                                   │   │
│ │ PART NUMBER: 86563/4-P1010                           │   │
│ │ PART NAME: COVER-FOG LAMP, L/RH                      │   │
│ │ 작성일: 2024-03-15 | 작성자: 점검자                  │   │
│ │ 양산처: 지금강 | 제작처: 아이에이테크                │   │
│ │ [부품 그림] [이미지 업로드]                          │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 1. 외관 검사 (15개 항목)           [점검대상 ✓]     │   │
│ │ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ │   │
│ │ No. | 점검 항목 | 규격/사양 | 확인                  │   │
│ │  1  | 금형 외관 | [입력]    | [✓]                  │   │
│ │  2  | 파팅라인  | [입력]    | [✓]                  │   │
│ │ ...                                                  │   │
│ │ [관련 자료 첨부] [파일 첨부]                         │   │
│ │ 📎 외관검사_1.jpg [미리보기] [다운로드] [삭제]      │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ┌──────────────────────────────────────────────────────┐   │
│ │ 2. 치수 검사 (20개 항목)           [점검대상 ✓]     │   │
│ └──────────────────────────────────────────────────────┘   │
│                                                              │
│ ... (8개 카테고리)                                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 8개 카테고리

1. **외관 검사** (15개 항목)
2. **치수 검사** (20개 항목)
3. **기능 검사** (12개 항목)
4. **안전 검사** (8개 항목)
5. **구조 검사** (10개 항목)
6. **부품 검사** (18개 항목)
7. **성능 검사** (14개 항목)
8. **문서 검사** (6개 항목)

---

## 🎨 금형 체크리스트 디자인 스펙

### 컬러 스킴

```css
/* Header Colors */
--header-gradient: linear-gradient(to right, #334155, #0f172a);
--category-gradient: linear-gradient(to right, #475569, #1e293b);

/* Status Colors */
--status-pending: #fbbf24;      /* Yellow - 승인대기 */
--status-approved: #10b981;     /* Green - 승인완료 */
--status-rejected: #ef4444;     /* Red - 반려 */

/* Progress Colors */
--progress-bg: #e2e8f0;         /* Light Gray */
--progress-fill: #3b82f6;       /* Blue */
```

### 헤더 영역

```jsx
<div className="bg-white shadow-md sticky top-0 z-10">
  <div className="max-w-7xl mx-auto px-4 py-4">
    <div className="flex items-center justify-between">
      {/* 좌측: 제목 */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold">금형 체크리스트</h1>
          <p className="text-sm text-slate-600">M-2024-001 - GV80 프론트 범퍼</p>
        </div>
      </div>

      {/* 우측: 진행률 & 상태 & 버튼 */}
      <div className="flex items-center gap-3">
        {/* 진행률 표시 */}
        <div className="flex items-center gap-4 px-4 py-2 bg-slate-100 rounded-lg border">
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">총 점검항목</p>
            <p className="text-2xl font-bold text-slate-800">103</p>
          </div>
          <div className="h-12 w-px bg-slate-300"></div>
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">완료</p>
            <p className="text-2xl font-bold text-blue-600">95</p>
          </div>
          <div className="h-12 w-px bg-slate-300"></div>
          <div className="text-center">
            <p className="text-xs text-slate-600 mb-1">진행률</p>
            <p className="text-2xl font-bold text-green-600">92%</p>
          </div>
        </div>

        {/* 승인 상태 */}
        <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
          <AlertCircle className="h-5 w-5" />
          <span className="font-bold">승인대기</span>
        </div>

        {/* 저장 버튼 */}
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          <Save className="h-4 w-4" />
          점검완료 및 승인요청
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## 📊 기본 정보 섹션

### 테이블 구조

```jsx
<div className="bg-white rounded-xl shadow-lg border-2 border-slate-300 mb-6">
  <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-6 py-4">
    <h2 className="text-xl font-bold text-white text-center">금형 체크리스트</h2>
  </div>
  
  <div className="p-6">
    <div className="grid md:grid-cols-[2fr,1fr] gap-6">
      {/* 좌측: 정보 테이블 */}
      <table className="w-full border-2 border-slate-400">
        <tbody>
          <tr>
            <td className="border bg-slate-200 px-4 py-2 font-bold text-center">차종</td>
            <td className="border px-4 py-2 text-center" colSpan={3}>
              <input type="text" value="NO5 (기본차)" className="w-full px-2 py-1 border rounded text-center" />
            </td>
          </tr>
          <tr>
            <td className="border bg-slate-200 px-4 py-2 font-bold">PART NUMBER</td>
            <td className="border px-4 py-2 bg-slate-50">86563/4-P1010</td>
            <td className="border bg-slate-200 px-4 py-2 font-bold">PART NAME</td>
            <td className="border px-4 py-2 bg-slate-50">COVER-FOG LAMP, L/RH</td>
          </tr>
          <tr>
            <td className="border bg-slate-200 px-4 py-2 font-bold">작성일</td>
            <td className="border px-4 py-2 bg-slate-50">2024-03-15</td>
            <td className="border bg-slate-200 px-4 py-2 font-bold">작성자</td>
            <td className="border px-4 py-2 bg-slate-50">점검자</td>
          </tr>
          <tr>
            <td className="border bg-slate-200 px-4 py-2 font-bold">양산처</td>
            <td className="border px-4 py-2">
              <input type="text" value="지금강" className="w-full px-2 py-1 border rounded" />
            </td>
            <td className="border bg-slate-200 px-4 py-2 font-bold">제작처</td>
            <td className="border px-4 py-2">
              <input type="text" value="아이에이테크" className="w-full px-2 py-1 border rounded" />
            </td>
          </tr>
        </tbody>
      </table>

      {/* 우측: 부품 그림 */}
      <div className="flex flex-col items-center">
        <label className="text-sm font-bold mb-2">부품 그림</label>
        <img src="..." className="max-w-full max-h-64 rounded-lg border-2" />
        <button className="mt-3 flex items-center gap-2 px-3 py-1.5 bg-slate-600 text-white rounded-lg">
          <Upload className="h-3 w-3" />
          이미지 업로드
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## 📋 카테고리 테이블

### 카테고리 헤더

```jsx
<div className="bg-gradient-to-r from-slate-700 to-slate-900 px-6 py-3 flex items-center justify-between">
  <h3 className="text-lg font-bold text-white">1. 외관 검사 (15개 항목)</h3>
  <label className="flex items-center gap-2 text-white text-sm cursor-pointer">
    <input type="checkbox" checked={true} className="w-4 h-4 cursor-pointer" />
    <span className="font-medium">점검대상</span>
  </label>
</div>
```

### 점검 항목 테이블

```jsx
<table className="w-full border-collapse">
  <thead>
    <tr className="bg-slate-100">
      <th className="border px-4 py-2 text-sm font-bold w-16">No.</th>
      <th className="border px-4 py-2 text-sm font-bold">점검 항목</th>
      <th className="border px-4 py-2 text-sm font-bold w-80">규격/사양</th>
      <th className="border px-4 py-2 text-sm font-bold w-24">확인</th>
    </tr>
  </thead>
  <tbody>
    <tr className="hover:bg-slate-50">
      <td className="border px-4 py-2 text-center text-sm">1</td>
      <td className="border px-4 py-2 text-sm">금형 외관 상태 확인</td>
      <td className="border px-4 py-2 text-sm">
        <input type="text" className="w-full px-2 py-1 border rounded text-center" />
      </td>
      <td className="border px-4 py-2 text-center">
        <input type="checkbox" className="w-5 h-5 cursor-pointer" />
      </td>
    </tr>
  </tbody>
</table>
```

---

## 🎯 규격/사양 필드 유형

### 1. 텍스트 입력 (input)

```jsx
<input
  type="text"
  className="w-full px-2 py-1 border border-slate-300 rounded text-sm text-center"
  placeholder="입력"
/>
```

### 2. 날짜 + 체크박스 (date-inspection)

```jsx
<div className="flex flex-col gap-2">
  <input
    type="date"
    className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
  />
  <div className="flex flex-wrap gap-2 justify-center">
    <label className="flex items-center gap-1 cursor-pointer">
      <input type="checkbox" className="cursor-pointer" />
      <span className="text-sm">양호</span>
    </label>
    <label className="flex items-center gap-1 cursor-pointer">
      <input type="checkbox" className="cursor-pointer" />
      <span className="text-sm">불량</span>
    </label>
    <label className="flex items-center gap-1 cursor-pointer">
      <input type="checkbox" className="cursor-pointer" />
      <span className="text-sm">수정</span>
    </label>
  </div>
</div>
```

### 3. 선택 + 입력 (select-inspection)

```jsx
<div className="flex flex-col gap-2">
  <select className="w-full px-2 py-1 border border-slate-300 rounded text-sm">
    <option value="">재질 선택</option>
    <option value="NAK80">NAK80</option>
    <option value="STD11">STD11</option>
    <option value="SKD61">SKD61</option>
  </select>
  <input
    type="text"
    placeholder="점검 내용 입력"
    className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
  />
</div>
```

### 4. 체크박스 + 입력 (checkbox-inspection)

```jsx
<div className="flex flex-col gap-2">
  <div className="flex flex-wrap gap-2 justify-center">
    <label className="flex items-center gap-1 cursor-pointer">
      <input type="checkbox" />
      <span className="text-sm">정상</span>
    </label>
    <label className="flex items-center gap-1 cursor-pointer">
      <input type="checkbox" />
      <span className="text-sm">이상</span>
    </label>
  </div>
  <input
    type="text"
    placeholder="점검 내용 입력"
    className="w-full px-2 py-1 border border-slate-300 rounded text-sm"
  />
</div>
```

---

## 📎 파일 첨부 섹션

### 파일 첨부 UI

```jsx
<div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
  <div className="flex items-center justify-between mb-2">
    <h4 className="text-sm font-bold text-slate-700">관련 자료 첨부</h4>
    <label className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 cursor-pointer">
      <Paperclip className="h-4 w-4" />
      파일 첨부
      <input type="file" multiple className="hidden" />
    </label>
  </div>

  {/* 첨부된 파일 목록 */}
  <div className="flex flex-wrap gap-2 mt-2">
    <div className="flex items-center gap-2 px-3 py-2 bg-white border rounded-lg hover:border-blue-400">
      <Paperclip className="h-4 w-4 text-slate-500" />
      <span className="text-slate-700 font-medium">외관검사_1.jpg</span>
      <div className="flex items-center gap-1 ml-2 border-l pl-2">
        <button className="p-1 text-blue-600 hover:bg-blue-50 rounded" title="미리보기">
          <Eye className="h-4 w-4" />
        </button>
        <button className="p-1 text-green-600 hover:bg-green-50 rounded" title="다운로드">
          <Download className="h-4 w-4" />
        </button>
        <button className="p-1 text-red-500 hover:bg-red-50 rounded" title="삭제">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  </div>
</div>
```

---

## 🖼️ 파일 미리보기 모달

### 모달 구조

```jsx
<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
  <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
    {/* 헤더 */}
    <div className="flex items-center justify-between px-6 py-4 border-b bg-slate-50">
      <div className="flex items-center gap-3">
        <Paperclip className="h-5 w-5 text-slate-600" />
        <div>
          <h3 className="text-lg font-bold text-slate-800">외관검사_1.jpg</h3>
          <p className="text-xs text-slate-500">첨부일시: 2024-03-15 14:30:00</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg">
          <Download className="h-4 w-4" />
          다운로드
        </button>
        <button className="p-2 hover:bg-slate-200 rounded-lg">
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>

    {/* 미리보기 영역 */}
    <div className="p-6 overflow-auto max-h-[calc(90vh-80px)]">
      <img src="..." className="max-w-full h-auto mx-auto rounded-lg shadow-lg" />
    </div>
  </div>
</div>
```

---

## 📊 진행률 계산

### 계산 로직

```javascript
// 총 점검 항목 수
const getTotalCheckItems = () => {
  return categories.reduce((total, category) => {
    return total + (category.enabled ? category.items.length : 0);
  }, 0);
};

// 완료된 항목 수
const getCheckedItems = () => {
  return categories.reduce((total, category) => {
    if (!category.enabled) return total;
    return total + category.items.filter(item => item.checked).length;
  }, 0);
};

// 완료율 계산
const getCompletionRate = () => {
  const total = getTotalCheckItems();
  const checked = getCheckedItems();
  return total > 0 ? Math.round((checked / total) * 100) : 0;
};
```

---

## 🎭 상태별 UI

### 1. 작성 중 (Editing)

```css
/* 모든 입력 필드 활성화 */
input, select, textarea {
  enabled: true;
  cursor: text;
}

/* 저장 버튼 표시 */
button.save {
  display: flex;
  background: #2563eb;
}
```

### 2. 승인 대기 (Pending)

```jsx
<div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg">
  <AlertCircle className="h-5 w-5" />
  <span className="font-bold">승인대기</span>
</div>
```

### 3. 승인 완료 (Approved)

```jsx
<div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-800 rounded-lg">
  <CheckCircle className="h-5 w-5" />
  <span className="font-bold">승인완료</span>
</div>

{/* 모든 입력 필드 비활성화 */}
<input disabled className="bg-slate-100 cursor-not-allowed" />
```

---

## 💾 저장 및 승인 요청

### API 호출

```javascript
const handleSave = async () => {
  const saveData = {
    moldId,
    vehicleModel,
    manufacturer,
    supplier,
    injectionMachine,
    clampingForce,
    eoCutDate,
    initialToDate,
    categories,
    productImage,
    approvalStatus: 'pending',
    submittedAt: new Date().toISOString()
  };

  const response = await fetch(`${API_BASE_URL}/api/worker/mold/${moldId}/checklist`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(saveData)
  });

  if (response.ok) {
    alert('체크리스트가 저장되었습니다. 관리자 승인 대기 중입니다.');
    setApprovalStatus('pending');
  }
};
```

---

이 문서는 참고 사이트의 로그인 화면 및 QR 스캔 페이지 구조를 기반으로 작성되었으며, Apple Design System을 적용한 현대적이고 사용자 친화적인 UI/UX를 제공합니다.
