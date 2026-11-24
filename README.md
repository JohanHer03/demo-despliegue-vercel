# Demo de despliegue: Mis tareas

App mínima de tareas para mostrar en clase cómo se despliega un front + back + BD en Vercel.

## Arquitectura

- **frontend/**: React + Vite. Vercel lo construye y lo sirve estático desde su CDN.
- **backend/**: Spring Boot 3 (Java 21) en un contenedor (Vercel Container Runtime), expone `/api/*`.
- **BD**: Postgres de Supabase (tabla `public.tareas`), vía el Transaction pooler (puerto 6543).

Front y back comparten dominio: `vercel.json` manda `/api/*` al backend y todo lo demás al frontend, así que no hace falta CORS.

## Correr en local

Requisitos: Java 21, Maven, Node.

Terminal 1, backend (PowerShell):

```powershell
cd backend
$env:DB_URL = "jdbc:postgresql://<host>:6543/postgres?sslmode=require&prepareThreshold=0"
$env:DB_USER = "<usuario>"
$env:DB_PASSWORD = "<password>"
mvn spring-boot:run
```

Terminal 2, frontend:

```powershell
cd frontend
npm install
npm run dev
```

Abre http://localhost:5173. El proxy de Vite manda `/api` a `http://localhost:8080`.

## Desplegar en Vercel

1. Sube el repo a GitHub.
2. En Vercel: **Add New → Project**, importa el repo (deja la raíz del repo como Root Directory).
3. En **Settings → Environment Variables** agrega `DB_URL`, `DB_USER` y `DB_PASSWORD`.
4. Deploy. Cada `git push` a `main` vuelve a desplegar.

Tras un rato sin tráfico el contenedor se apaga; `GET /api/health` lo despierta sin tocar la BD.

## Endpoints

| Método | Ruta              | Qué hace                                  |
|--------|-------------------|-------------------------------------------|
| GET    | /api/health       | `{"status":"ok"}`                         |
| GET    | /api/tareas       | Lista ordenada por id                     |
| POST   | /api/tareas       | `{"titulo":"..."}` → 201 (400 si vacío)   |
| PUT    | /api/tareas/{id}  | `{"titulo":"...","completada":true}` (404) |
| DELETE | /api/tareas/{id}  | 204 (404 si no existe)                    |
