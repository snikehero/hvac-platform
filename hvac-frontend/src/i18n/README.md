# Sistema de Internacionalización (i18n)

Este directorio contiene el sistema completo de internacionalización para la plataforma HVAC.

## 📁 Estructura

```
i18n/
├── translations/
│   ├── es.ts          # Traducciones en español (idioma base)
│   ├── en.ts          # Traducciones en inglés
│   └── index.ts       # Exportación de todas las traducciones
├── useTranslation.ts  # Hook de React para acceder a traducciones
└── README.md          # Este archivo
```

## 🚀 Uso

### En componentes de React

```typescript
import { useTranslation } from "@/i18n/useTranslation";

export function MiComponente() {
  const { t, tf, language } = useTranslation();

  return (
    <div>
      <h1>{t.common.save}</h1>
      <p>{tf(t.activity.minutesAgo, { minutes: 5 })}</p>
      <p>Idioma actual: {language}</p>
    </div>
  );
}
```

### En servicios o funciones fuera de React

```typescript
import { translations, type Language } from "@/i18n/translations";

function miServicio(language: Language = "es") {
  const t = translations[language];
  console.log(t.common.save);
}
```

## 🔧 API

### `useTranslation()`

Hook de React que retorna:

- **`t`**: Objeto con todas las traducciones del idioma actual
- **`tf(text, values)`**: Función para formatear strings con placeholders
- **`language`**: Idioma actual ("es" | "en")

### `tf(text, values)` - Format Function

Reemplaza placeholders en strings con valores dinámicos:

```typescript
// Ejemplo
tf("Hace {minutes} minutos", { minutes: 5 })
// Resultado: "Hace 5 minutos"

tf(t.notifications.ahuAlarm, { stationId: "AHU-01" })
// Resultado: "AHU AHU-01 en ALARMA"
```

## 📝 Agregar nuevas traducciones

### 1. Agregar a `es.ts` (idioma base)

```typescript
export const es = {
  // ...
  miSeccion: {
    miTexto: "Hola mundo",
    textoConPlaceholder: "Usuario: {username}",
  },
} as const;
```

### 2. Agregar a `en.ts`

```typescript
export const en: TranslationKeys = {
  // ...
  miSeccion: {
    miTexto: "Hello world",
    textoConPlaceholder: "User: {username}",
  },
};
```

### 3. Usar en tu componente

```typescript
const { t, tf } = useTranslation();

// Sin placeholders
<p>{t.miSeccion.miTexto}</p>

// Con placeholders
<p>{tf(t.miSeccion.textoConPlaceholder, { username: "Juan" })}</p>
```

## 🌍 Idiomas soportados

- **Español (es)** - Idioma por defecto
- **English (en)**

## ⚙️ Cambiar idioma

El idioma se configura desde **Settings > General > Idioma** y se persiste en `localStorage`.

```typescript
import { useSettings } from "@/context/SettingsContext";

function CambiadorIdioma() {
  const { settings, updateGeneral } = useSettings();

  return (
    <button onClick={() => updateGeneral({ language: "en" })}>
      Cambiar a inglés
    </button>
  );
}
```

## 📦 Secciones de traducciones disponibles

- `common` - Textos comunes (guardar, cancelar, etc.)
- `status` - Estados del sistema (OK, WARNING, ALARM, etc.)
- `nav` - Navegación
- `heroSystem` - Hero del sistema
- `widgets` - Widgets del dashboard
- `plantPanel` - Panel de plantas
- `activity` - Actividad del sistema
- `dashboardPage` - Página del dashboard
- `ahuCard` - Tarjetas de AHU
- `alarmsPage` - Página de alarmas
- `settings` - Configuración
- `notifications` - Notificaciones
- `time` - Unidades de tiempo
- `units` - Unidades de medida

## 🔍 TypeScript

El sistema está completamente tipado. TypeScript te sugerirá automáticamente las claves disponibles:

```typescript
const { t } = useTranslation();
t. // <-- TypeScript mostrará autocompletado con todas las opciones
```

## ⚡ Performance

- Las traducciones se cargan de forma estática (no hay llamadas a API)
- El cambio de idioma es instantáneo
- Zero overhead en runtime
- Tree-shaking automático en producción

## 🎯 Componentes ya actualizados

✅ HeroSystemStatus
✅ DashboardWidgets
✅ DashboardEjecutivoPage
✅ SettingsPage
✅ NotificationService
✅ WebSocketProvider

## 📚 Agregar un nuevo idioma

1. Crear `src/i18n/translations/fr.ts` (por ejemplo, francés):

```typescript
import type { TranslationKeys } from "./es";

export const fr: TranslationKeys = {
  common: {
    save: "Sauvegarder",
    // ... resto de traducciones
  },
};
```

2. Actualizar `src/i18n/translations/index.ts`:

```typescript
import { fr } from "./fr";

export const translations = {
  es,
  en,
  fr, // <-- Agregar nuevo idioma
} as const;
```

3. Actualizar `SettingsContext.tsx` para agregar el tipo:

```typescript
export interface HvacGeneral {
  language: "es" | "en" | "fr"; // <-- Agregar "fr"
  refreshIntervalSeconds: number;
}
```

4. Actualizar el selector en `SettingsPage.tsx`:

```tsx
<SelectContent>
  <SelectItem value="es">Español</SelectItem>
  <SelectItem value="en">English</SelectItem>
  <SelectItem value="fr">Français</SelectItem> {/* <-- Nuevo */}
</SelectContent>
```

¡Listo! 🎉
