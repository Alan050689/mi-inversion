# Mi Inversión - Seguimiento de Aportes Inmobiliarios

App web MVP para llevar registro de aportes a un proyecto inmobiliario.

## Funcionalidades

- **Dashboard**: Vista principal con resumen de totales en USD y ARS
- **CRUD de Movimientos**: Agregar, editar y eliminar aportes/cobros
- **Tipo de Cambio**: Soporte para dólar Blue, Oficial o manual
- **Benchmark S&P 500**: Comparación hipotética con rendimiento del mercado

## Stack Técnico

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Express.js
- Persistencia: Archivo JSON local (con fallback a memoria)

## Correr en Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:5000`

## Endpoints API

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/status` | Estado de la app (modo demo, tipo de storage) |
| GET | `/api/transactions` | Listar todos los movimientos |
| GET | `/api/transactions/:id` | Obtener un movimiento |
| POST | `/api/transactions` | Crear movimiento |
| PUT | `/api/transactions/:id` | Actualizar movimiento |
| DELETE | `/api/transactions/:id` | Eliminar movimiento |
| GET | `/api/fx-rates` | Obtener tipos de cambio (blue/oficial) |
| GET | `/api/settings` | Obtener configuración |
| PUT | `/api/settings` | Actualizar configuración |

## Deploy en Vercel

### Paso 1: Crear repositorio en GitHub

1. Crear nuevo repositorio en [github.com/new](https://github.com/new)
2. En Replit, abrir la terminal Shell y ejecutar:

```bash
git remote add origin https://github.com/TU_USUARIO/TU_REPO.git
git branch -M main
git push -u origin main
```

### Paso 2: Importar en Vercel

1. Ir a [vercel.com](https://vercel.com) y loguearse con GitHub
2. Click en "Add New" > "Project"
3. Seleccionar el repositorio
4. Configurar:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. Click en "Deploy"

### Limitaciones en Vercel

- El filesystem es efímero, los datos se pierden entre deploys
- La app detecta esto automáticamente y muestra un banner "Modo demo"
- Para persistencia real, considerar agregar una base de datos externa

## Estructura del Proyecto

```
├── client/              # Frontend React
│   └── src/
│       ├── components/  # Componentes UI
│       ├── pages/       # Páginas (Dashboard)
│       └── lib/         # Utilidades
├── server/              # Backend Express
│   ├── routes.ts        # API endpoints
│   ├── storage.ts       # Storage híbrido
│   └── fx.ts            # Fetch tipo de cambio
├── shared/              # Tipos compartidos
│   └── schema.ts        # Schemas Zod
└── data/                # Datos JSON (Replit)
```

## Tipo de Cambio

La app obtiene cotizaciones desde [dolarapi.com](https://dolarapi.com):
- Dólar Blue (venta)
- Dólar Oficial (venta)

Si la API falla, usa valores fallback y permite ingreso manual.

## Benchmark S&P 500

Calcula el valor hipotético de cada aporte usando interés compuesto:

```
valor = aporteUSD × (1 + tasa)^(días/365)
```

La tasa por defecto es 10% anual (promedio histórico S&P 500).
