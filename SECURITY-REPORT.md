# 🔒 ANÁLISIS DE SEGURIDAD - SNOTTYBURGER 2.0

## Resumen Ejecutivo

Tu aplicación tiene **seguridad sólida en fundamentales** pero necesita **3 fixes críticos antes de producción**:

1. ⚠️ **Rutas admin sin autenticación** - CRÍTICO
2. ⚠️ **Sin CSRF protection** - CRÍTICO  
3. ⚠️ **Sin rate limiting en APIs** - CRÍTICO

---

## 🔍 HALLAZGOS DETALLADOS

### ✅ LO QUE ESTÁ BIEN

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| **XSS Protection** | ✅ | React escapa automáticamente todo contenido JSX |
| **SQL Injection** | ✅ | Supabase client usa queries parameterizadas |
| **Tokens Seguros** | ✅ | Owner token hashed con SHA256, nunca viaja al cliente |
| **PIN Security** | ✅ | 4 dígitos, validación estricta, rate limiting (3/hora) |
| **Secretos** | ✅ | Service role solo en servidor, .env.local protegido |
| **Input Validation** | ✅ | PIN normalizado, promo codes validados |

---

### 🔴 CRÍTICO - REQUIERE ACCIÓN INMEDIATA

#### 1. **Rutas Admin Sin Autenticación**

**Problema:**
```typescript
// ❌ VULNERABLE - Cualquiera puede acceder
POST /api/admin/promo-codes
POST /api/admin/menu-items
POST /api/admin/delivery-rates
```

**Impacto:** Alguien puede crear/modificar descuentos, precios, etc. sin permiso

**Fix (15 minutos):**
Agregar en `middleware.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas admin requieren autenticación
  if (pathname.startsWith("/api/admin")) {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    
    if (!token) {
      return new NextResponse(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401 }
      );
    }

    // Verificar que el usuario es admin
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid token" }),
        { status: 403 }
      );
    }

    // TODO: Verificar que user.role === "admin"
  }

  return NextResponse.next();
}
```

---

#### 2. **CSRF Protection Faltante**

**Problema:**
```html
<!-- Desde sitemalicioso.com -->
<form action="https://snottyburger.com/api/admin/promo-codes" method="POST">
  <input name="code" value="HACK">
  <!-- Si admin abre esta página, la solicitud se ejecuta con sus cookies -->
</form>
```

**Fix (20 minutos):**

Crear archivo `src/lib/csrf.ts`:
```typescript
import { createHash, randomBytes } from 'crypto';

export function generateCSRFToken(): string {
  return randomBytes(32).toString('hex');
}

export function hashCSRFToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

export function verifyCSRFToken(token: string, hash: string): boolean {
  return hashCSRFToken(token) === hash;
}
```

Actualizar middleware:
```typescript
export async function middleware(request: NextRequest) {
  if (request.method === "POST" || request.method === "PUT" || request.method === "DELETE") {
    const csrfToken = request.headers.get("x-csrf-token");
    const csrfHash = request.cookies.get("csrf-token")?.value;

    if (!csrfToken || !csrfHash) {
      return new NextResponse(
        JSON.stringify({ error: "CSRF token missing" }),
        { status: 403 }
      );
    }

    if (!verifyCSRFToken(csrfToken, csrfHash)) {
      return new NextResponse(
        JSON.stringify({ error: "Invalid CSRF token" }),
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}
```

---

#### 3. **Rate Limiting Faltante en APIs**

**Problema:**
```bash
# Alguien puede hacer miles de solicitudes
for i in {1..10000}; do
  curl -X POST https://snottyburger.com/api/promo-codes/validate \
    -d '{"code":"TEST"}'
done

# Costo: API calls expensive, DDoS implícito
```

**Fix (30 minutos):**

Crear `src/lib/rate-limit.ts`:
```typescript
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(
  key: string,
  limit: number = 100,
  windowMs: number = 60000
): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: limit - record.count };
}
```

Usar en APIs:
```typescript
// src/app/api/promo-codes/validate/route.ts
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const { allowed, remaining } = checkRateLimit(
    `promo-validate:${ip}`,
    30,  // 30 requests
    60000  // per minute
  );

  if (!allowed) {
    return Response.json(
      { error: "Too many requests" },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  // ... resto del código
}
```

---

### 🟡 IMPORTANTE - Mejoras Recomendadas

#### 4. **Security Headers**

Crear `next.config.ts`:
```typescript
export default {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};
```

#### 5. **Row Level Security (RLS) en Supabase**

En Supabase SQL Editor:
```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE public.promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_cart_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_cart_items ENABLE ROW LEVEL SECURITY;

-- Solo admins pueden ver/editar promo codes
CREATE POLICY "admin_promo_codes" ON public.promo_codes
  FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Solo creadores pueden ver/editar sus sesiones
CREATE POLICY "own_sessions" ON public.shared_cart_sessions
  FOR ALL USING (
    auth.uid() = (SELECT user_id FROM public.shared_carts WHERE id = session_id LIMIT 1)
  );
```

---

## 📊 MATRIZ DE RIESGO

| Vulnerabilidad | Severidad | Probabilidad | Impacto | Riesgo |
|---|---|---|---|---|
| Admin sin auth | CRÍTICO | ALTA | ALTO | 🔴 CRÍTICO |
| CSRF attacks | ALTO | MEDIA | ALTO | 🟠 ALTO |
| Rate limiting | ALTO | MEDIA | MEDIO | 🟠 ALTO |
| Falta de headers | MEDIO | MEDIA | MEDIO | 🟡 MEDIO |
| XSS | BAJO | BAJA | MEDIO | 🟢 BAJO |
| SQL Injection | BAJO | BAJA | MEDIO | 🟢 BAJO |

---

## ✅ CHECKLIST ANTES DE PRODUCCIÓN

- [ ] **Auth en admin routes** (15 min)
- [ ] **CSRF middleware** (20 min)
- [ ] **Rate limiting** (30 min)
- [ ] **Security headers** (15 min)
- [ ] **RLS en Supabase** (30 min)
- [ ] **npm audit fix** (varía)
- [ ] **Test con OWASP ZAP** (1 hora)
- [ ] **Test penetration básico** (2 horas)

**Total: ~4 horas**

---

## 🚀 PRÓXIMOS PASOS

1. **HOY**: Implementar los 3 fixes críticos (1 hora)
2. **ESTA SEMANA**: Mejoras recomendadas (2 horas)
3. **ANTES DE PRODUCCIÓN**: Testing de seguridad (3 horas)

¿Empezamos por el fix de autenticación admin?
