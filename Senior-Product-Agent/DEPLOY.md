# Despliegue en Vercel

## Pasos para desplegar Mi Inversión en Vercel

### 1. Subir a GitHub

```bash
# Inicializar repositorio (si no existe)
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "Mi Inversión - MVP"

# Conectar a GitHub
git remote add origin https://github.com/TU_USUARIO/mi-inversion.git
git push -u origin main
```

### 2. Conectar con Vercel

1. Ir a [vercel.com](https://vercel.com) e iniciar sesión con GitHub
2. Click en "Add New Project"
3. Importar el repositorio `mi-inversion`
4. Configurar:
   - **Framework Preset**: Other
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/public`
   - **Install Command**: `npm install`

### 3. Variables de Entorno (Opcional)

Si querés usar PostgreSQL en producción:
- `DATABASE_URL`: URL de conexión a PostgreSQL

Si no configurás DATABASE_URL, la app usará almacenamiento en memoria.

### 4. Desplegar

Click en "Deploy" y esperar que termine el build.

## Notas Importantes

- **Almacenamiento**: En Vercel (sin PostgreSQL), los datos se pierden al reiniciar. Para persistencia, configurá una base de datos PostgreSQL externa (ej: Neon, Supabase, Railway).

- **Cotizaciones**: Las cotizaciones del dólar se obtienen en tiempo real desde DolarAPI.com.

- **Modo Demo**: Si no hay PostgreSQL configurado, la app muestra un banner indicando que está en modo demo.

## Estructura del Build

```
dist/
├── index.cjs        # Servidor Express compilado
└── public/          # Frontend React compilado
    ├── index.html
    └── assets/      # JS, CSS, imágenes
```
