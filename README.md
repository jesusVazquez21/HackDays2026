# 🌙 Consume Local Conectando al Barrio
**Conectando el Barrio con Tecnología e Inteligencia Artificial**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-B73BFE?style=for-the-badge&logo=vite&logoColor=FFD62E)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Gemini API](https://img.shields.io/badge/Gemini_API-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

---

## 🚀 Descripción del Proyecto

**Consume Local Conectando al Barrio** es un aparador digital interactivo desarrollado para el *Hackathon Durango 2026*, con el objetivo de democratizar el acceso a la tecnología para las micro y pequeñas empresas. En un mundo donde los mapas convencionales a menudo ignoran a los negocios tradicionales, esta plataforma conecta a ciudadanos y turistas con la verdadera esencia de la ciudad: sus tienditas, artesanos, mezcalerías y puestos de antojitos.

### ✨ La Innovación: Registro "Ultra Fácil" con IA

El gran diferenciador de **Consume Local Conectando al Barrio** es su proceso de *onboarding*. Sabiendo que muchos comerciantes no están familiarizados con la tecnología, eliminamos los formularios complejos. Utilizando la API de **Google Build AI**, los dueños de negocios solo necesitan enviar una nota de voz o un mensaje de chat contando qué venden y dónde están (ej. *"Hola, soy Juan, tengo una tiendita en calle Libertad que abre a las 8"*). 

La inteligencia artificial hace el trabajo pesado: extrae la información, la estructura en formato JSON y da de alta el negocio en el mapa interactivo en menos de 2 minutos.

---

## 🌟 Características Principales

1. **Aparador Interactivo:** Un mapa dinámico para descubrir negocios locales, filtrados por categorías tradicionales (Antojitos, Mezcal, Artesanías, etc.).
2. **Registro Conversacional:** Interfaz tipo chat potenciada por IA para capturar datos de negocios de forma natural y sin fricción.
3. **Rutas de Consumo:** (En desarrollo) Generación de "Rutas de barrio" para incentivar la visita a zonas comerciales específicas, fomentando el turismo local.
4. **Diseño Atractivo y Amigable:** Interfaz moderna, accesible e inspirada en la cultura local.

---

## 📚 Documentación Técnica y Estructura

El proyecto está construido bajo una arquitectura modular y escalable.

### 🛠️ Stack Tecnológico

* **Frontend:** React + Vite (para un despliegue rápido y HMR).
* **Lenguajes:** TypeScript (`.tsx`) y JavaScript (`.jsx`) para mayor robustez.
* **Estilos y UI:** Tailwind CSS integrado con **Shadcn UI** para componentes accesibles, elegantes y altamente personalizables.
* **Inteligencia Artificial:** Integración con la API de **Google Build AI (Gemini)** para el procesamiento de lenguaje natural y extracción de entidades.
* **Base de Datos / Backend:** Supabase (PostgreSQL) para almacenamiento relacional rápido.

### 📂 Arquitectura de Directorios (`src/`)

* `views/`: Vistas principales de la aplicación (`Home`, `DiscoveryMap`, `BusinessOnboarding`).
* `components/ui/`: Sistema de diseño basado en Shadcn UI (botones, tarjetas, modales, etc.).
* `services/`: Capa de abstracción para la lógica de negocio y peticiones a APIs externas (`businessService`).
* `config/`: Configuraciones de servicios externos (ej. inicialización del cliente de Supabase).
* `lib/`: Utilidades genéricas (`utils.ts`).

---

## ⚙️ Configuración y Variables de Entorno

Para ejecutar la aplicación localmente, crea un archivo `.env` en la raíz del proyecto basándote en esta plantilla:

```env
# ==========================================
# Variables del Cliente Frontend (Vite/React)
# ==========================================
VITE_SUPABASE_URL=[https://tu_proyecto.supabase.co](https://donhkhunqfhfhorqwtpj.supabase.co)
VITE_SUPABASE_ANON_KEY=yJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRvbmhraHVucWZoZmhvcnF3dHBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MDc1OTA5OSwiZXhwIjoyMDk2MzM1MDk5fQ.Lg9KFTP53DGIrrB-V82kp7GEC7HRn_whUGshkpU0pCE

