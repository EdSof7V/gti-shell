# 🚀 GTI RIPLEY
![Diagrama de Arquitectura](./docs/images/gti-dm-bck-readme-diagram.png)
 
## Descripción
GTI (Gestión de Tecnologías de Información) es una plataforma integral para Ripley que centraliza la administración de múltiples aplicaciones críticas del negocio. Desarrollada con Next.js 14, proporciona una interfaz moderna y segura que permite gestionar herramientas como Dashboard Manager, Catálogo de Datos, y APM (Application Manager).
La plataforma utiliza Firebase Autentication para la autenticación y Cloud SQL Postgres para la base de datos, ofreciendo una solución robusta y escalable para la gestión tecnológica de Ripley.
 
 
### Infraestructura general
- **Cliente Web**: En la parte superior, representa la interfaz de usuario que acceden los usuarios finales.
- **Frontend**: Es el núcleo de la interfaz de usuario, implementado con Next.js (representado por el ícono "N").
- **Backend**: Utiliza FastAPI como framework para crear la API que sirve datos al frontend.
- **Despliegue**: La aplicación se construye (Build) y se aloja en Cloud Run.
 
### Componentes del Frontend
- **GTI**: Componente central que coordina otros subsistemas.
- **Varios módulos de API y servicios**:
  - **Client API (Axios)**: Gestiona las comunicaciones con el backend.
  - **Context API**: Maneja el estado global de la aplicación.
  - **Hooks**: Funcionalidades reutilizables.
  - **Pages**: Las diferentes vistas de la aplicación.
  - **Components**: Elementos reutilizables de UI.
  - **Autenticación**: Sistema de login y gestión de sesiones.
 
### Servicios específicos
- **Servicio de usuarios**: Gestión de usuarios.
- **Servicio de grupos**: Manejo de permisos por grupos.
- **Servicio de dashboards**: Configuración y datos para los paneles.
- **Contexto de Usuario**: Mantiene el estado del usuario actual.
 
### Secciones principales
- **Administración**: Para gestión de la plataforma.
- **Dashboards**: Los paneles de visualización para usuarios.
 
 
### Comunicación
- **CORS**: Se implementa para permitir la comunicación segura entre el frontend y backend.
 
Esta arquitectura sigue un patrón común para aplicaciones empresariales modernas, con separación clara entre frontend y backend, integración con servicios de autenticación empresarial (Azure AD), y un enfoque en la creación de dashboards.
 
## Tabla de Contenidos
- [Descripción](#descripción)
- [Características](#características)
- [Prerrequisitos](#prerrequisitos)
- [Instalación](#instalación)
- [Configuración del Entorno](#configuración-del-entorno)
- [Uso](#uso)
- [Despliegue](#despliegue)
- [Licencia](#licencia)
 
## Características
- Autenticación con Firebase Autentication
- Dashboard interactivo con ApexCharts
- Gestión de usuarios y roles
- Interfaz adaptativa con modo oscuro/claro usando Tailwind CSS
- Visualización de datos en tiempo real
- Formularios con React Hook Form
- Integración con API REST
 
## Prerrequisitos
- Node.js 20.x o superior
- npm 9.x o superior
- Firebase CLI
- Cuenta de Firebase
 
## Instalación
1. Clonar el repositorio
2. Instalar dependencias:
```bash
npm install
```
 
## Configuración del Entorno
 
### Variables de Entorno
Configura las siguientes variables en la herramienta Secrets:
 
| Variable | Descripción |
|----------|-------------|
| NEXT_PUBLIC_FIREBASE_API_KEY | Api Key de Firebase |
| NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN | Domininio de Firebase auth |
| NEXT_PUBLIC_FIREBASE_PROJECT_ID | ID del proyecto de Firebase |
| NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET | Storage del Firebase |
| NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID | Firebase Cloud Messaging para notificaciones push  |
| NEXT_PUBLIC_FIREBASE_APP_ID | ID del App de Firebase |
 
 
# 📂 Estructura del Proyecto  
 
Este proyecto organiza los componentes en dos categorías principales:  
 
- **`shared/`** → Componentes UI reutilizables en toda la aplicación.  
- **`features/`** → Componentes específicos para cada funcionalidad.  
 
## 📁 **Directorio de Componentes**  
 
```plaintext
📂 components/                     # Componentes UI reutilizables en toda la aplicación
├── 📂 shared/  
│   ├── 📂 form/  
│   │   ├── 📄 Input.tsx  
│   │   ├── 📄 Select.tsx  
│   │   ├── 📄 MultiSelect.tsx  
│   │   ├── 📄 Label.tsx  
│   │   └── 📄 Switch.tsx  
│   ├── 📂 layout/  
│   │   ├── 📄 Header.tsx  
│   │   ├── 📄 Sidebar.tsx  
│   │   └── 📄 NotificationDropdown.tsx  
│   ├── 📂 tables/  
│   │   ├── 📄 BasicTable.tsx  
│   │   └── 📄 Pagination.tsx  
│   ├── 📂 common/  
│   │   ├── 📄 Card.tsx  
│   │   └── 📄 Button.tsx  
│
└── 📂 features/                   # Componentes específicos para cada funcionalidad
    ├── 📂 auth/  
    │   └── 📄 SignupLogin.tsx  
    ├── 📂 calendar/  
    │   └── 📄 Calendar.tsx  
    ├── 📂 ecommerce/  
    │   ├── 📄 CountryMap.tsx  
    │   ├── 📄 DemographicCard.tsx  
    │   ├── 📄 HomepageAds.tsx  
    │   ├── 📄 MonthlyTarget.tsx  
    │   ├── 📄 MonthlyChart.tsx  
    │   ├── 📄 RecentOrders.tsx  
    │   └── 📄 StatsChart.tsx  
    ├── 📂 application/  
    │   ├── 📄 AppCard.tsx  
    │   ├── 📄 ApplicationTable.tsx  
    │   └── 📄 AddApplicationForm.tsx  
    ├── 📂 group/  
    │   ├── 📄 AddGroup.tsx  
    │   ├── 📄 GroupInput.tsx  
    │   └── 📄 GroupTable.tsx  
    └── 📂 user/  
        ├── 📄 UserTable.tsx  
        ├── 📄 UserDropdown.tsx  
        └── 📄 StepperAddUser.tsx  
 
 
```
## Uso
1. El administrador agrega un nuevo usuario
2. Llega un correo al usuario para verificar su correo y cambiar su contraseña
3. Si se require active el MFA (opcional)
4. El usuario inicia session
5. El usuario tiene acceso a las aplicaciones