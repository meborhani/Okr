# OKR Management System - Backend

سیستم مدیریت OKR داخلی شرکت - Backend

## Stack

- **Runtime:** Node.js
- **Framework:** NestJS + TypeScript
- **Database:** Microsoft SQL Server
- **Driver:** mssql (بدون ORM)
- **Auth:** JWT + Passport
- **RBAC:** Role-Based Access Control

---

## راه‌اندازی سریع

### ۱. کپی کردن فایل env

```bash
cp .env.example .env
```

فایل `.env` را با تنظیمات SQL Server خود پر کنید:

```env
DB_SERVER=localhost
DB_PORT=1433
DB_NAME=okr_db
DB_USER=sa
DB_PASSWORD=YourStrongPassword
DB_ENCRYPT=false
DB_TRUST_SERVER_CERTIFICATE=true

JWT_ACCESS_SECRET=change_me_to_a_long_random_string
JWT_EXPIRES_IN=1d

PORT=3000
```

### ۲. نصب پکیج‌ها

```bash
npm install
```

### ۳. ساخت دیتابیس و migration

```bash
npm run db:init
```

این دستور:
- دیتابیس `okr_db` را می‌سازد (اگر وجود نداشته باشد)
- جداول را اجرا می‌کند (`migrations/0001_init.sql`)

### ۴. اجرای seed

```bash
npm run seed
```

این دستور می‌سازد:
- نقش‌ها: `super_admin`, `admin`, `ceo`, `department_manager`, `team_manager`, `employee`
- پرمیشن‌های پایه
- کاربر ادمین اولیه

**کاربر پیش‌فرض:**
- Email: `admin@company.com`
- Password: `Admin@12345`

### ۵. Build

```bash
npm run build
```

### ۶. تست

```bash
npm test
```

### ۷. اجرای Development

```bash
npm run start:dev
```

سرور روی `http://localhost:3000/api/v1` بالا می‌آید.

---

## ساختار پروژه

```
src/
├── main.ts
├── app.module.ts
├── database/
│   ├── database.module.ts
│   └── database.service.ts
├── common/
│   ├── enums.ts
│   ├── response.ts
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── permissions.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── permissions.guard.ts
│   ├── interceptors/
│   │   └── response.interceptor.ts
│   └── utils/
│       └── okr.utils.ts
└── modules/
    ├── auth/
    ├── users/
    ├── rbac/
    ├── org/          (departments + teams)
    ├── okr-periods/
    ├── objectives/
    ├── key-results/
    ├── check-ins/
    ├── reports/
    └── audit/

migrations/
└── 0001_init.sql

scripts/
├── db-init.js
└── seed.js
```

---

## API Reference

### Auth

| Method | Endpoint | توضیح |
|--------|----------|-------|
| POST | `/api/v1/auth/login` | ورود |
| GET | `/api/v1/auth/me` | اطلاعات کاربر جاری |

**Login Request:**
```json
{
  "email": "admin@company.com",
  "password": "Admin@12345"
}
```

**Login Response:**
```json
{
  "success": true,
  "message": "ورود با موفقیت انجام شد",
  "data": {
    "accessToken": "eyJ...",
    "user": {
      "id": "...",
      "email": "admin@company.com",
      "firstName": "Admin",
      "lastName": "System",
      "roleName": "super_admin",
      "permissions": ["users:read", "users:create", ...]
    }
  },
  "errors": null
}
```

### Users — `/api/v1/users`

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/users` | `users:read` |
| GET | `/users/:id` | `users:read` |
| POST | `/users` | `users:create` |
| PATCH | `/users/:id` | `users:update` |
| DELETE | `/users/:id` | `users:delete` |

### Departments — `/api/v1/departments`

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/departments` | `departments:read` |
| POST | `/departments` | `departments:create` |
| PATCH | `/departments/:id` | `departments:update` |
| DELETE | `/departments/:id` | `departments:delete` |

### Teams — `/api/v1/teams`

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/teams` | `teams:read` |
| POST | `/teams` | `teams:create` |
| PATCH | `/teams/:id` | `teams:update` |
| DELETE | `/teams/:id` | `teams:delete` |

### OKR Periods — `/api/v1/okr-periods`

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/okr-periods` | `okr_periods:read` |
| GET | `/okr-periods/active` | `okr_periods:read` |
| GET | `/okr-periods/:id` | `okr_periods:read` |
| POST | `/okr-periods` | `okr_periods:create` |
| PATCH | `/okr-periods/:id` | `okr_periods:update` |
| POST | `/okr-periods/:id/activate` | `okr_periods:manage` |
| POST | `/okr-periods/:id/close` | `okr_periods:manage` |
| POST | `/okr-periods/:id/archive` | `okr_periods:manage` |

**وضعیت دوره:** `draft` → `active` → `closed` → `archived`

### Objectives — `/api/v1/objectives`

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/objectives?periodId=&ownerId=` | `objectives:read` |
| GET | `/objectives/:id` | `objectives:read` |
| POST | `/objectives` | `objectives:create` |
| PATCH | `/objectives/:id` | `objectives:update` |
| DELETE | `/objectives/:id` | `objectives:delete` |

### Key Results — `/api/v1/key-results`

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/key-results?objectiveId=&ownerId=` | `key_results:read` |
| GET | `/key-results/:id` | `key_results:read` |
| GET | `/key-results/:id/check-ins` | `check_ins:read` |
| POST | `/key-results` | `key_results:create` |
| PATCH | `/key-results/:id` | `key_results:update` |
| DELETE | `/key-results/:id` | `key_results:delete` |

### Check-ins — `/api/v1/check-ins`

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/check-ins` | `check_ins:read` |
| POST | `/check-ins` | `check_ins:create` |

**Check-in باعث می‌شود:**
1. `currentValue` مربوط به Key Result آپدیت شود
2. `progress` Key Result محاسبه شود
3. `progress` Objective به‌طور خودکار آپدیت شود

### Reports — `/api/v1/reports`

| Method | Endpoint | Permission |
|--------|----------|------------|
| GET | `/reports/dashboard?periodId=` | `reports:read` |
| GET | `/reports/team-progress?periodId=` | `reports:read` |
| GET | `/reports/user-progress?periodId=` | `reports:read` |

---

## فرمول محاسبه پیشرفت

```
progress = ((currentValue - startValue) / (targetValue - startValue)) * 100
```

- مقدار بین ۰ تا ۱۰۰ محدود می‌شود
- اگر `targetValue == startValue` → خطا
- پیشرفت Objective = میانگین پیشرفت Key Result ها

---

## فصل‌های شمسی

| فصل | ماه‌ها |
|-----|--------|
| فصل ۱ | فروردین، اردیبهشت، خرداد |
| فصل ۲ | تیر، مرداد، شهریور |
| فصل ۳ | مهر، آبان، آذر |
| فصل ۴ | دی، بهمن، اسفند |

---

## فرمت پاسخ API

**موفق:**
```json
{
  "success": true,
  "message": "عملیات با موفقیت انجام شد",
  "data": {},
  "errors": null
}
```

**خطا:**
```json
{
  "success": false,
  "message": "خطایی رخ داده است",
  "data": null,
  "errors": [
    { "field": "email", "message": "ایمیل معتبر نیست" }
  ]
}
```

---

## نقش‌ها و دسترسی‌ها

| نقش | دسترسی |
|-----|--------|
| `super_admin` | همه پرمیشن‌ها |
| `admin` | همه پرمیشن‌ها |
| `ceo` | read + OKR management |
| `department_manager` | read + OKR management |
| `team_manager` | read + OKR management |
| `employee` | read + check-in |

---

## E2E Test (آینده)

```bash
npm run test:e2e
```
