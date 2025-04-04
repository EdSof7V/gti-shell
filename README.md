📂 components/
├── 📂 shared/               # Componentes UI reutilizables en toda la aplicación
│   ├── 📂 form/
│   │   ├── Input.tsx
│   │   ├── Select.tsx
│   │   ├── MultiSelect.tsx
│   │   ├── Label.tsx
│   │   └── Switch.tsx
│   ├── 📂 layout/
│   │   ├── Header.tsx
│   │   ├── Sidebar.tsx
│   │   └── NotificationDropdown.tsx
│   ├── 📂 tables/
│   │   ├── BasicTable.tsx
│   │   └── Pagination.tsx
│   └── 📂 common/
│       ├── Card.tsx
│       └── Button.tsx
└── 📂 features/             # Componentes específicos para cada funcionalidad
    ├── 📂 auth/
    │   └── SignupLogin.tsx
    ├── 📂 calendar/
    │   └── Calendar.tsx
    ├── 📂 ecommerce/
    │   ├── CountryMap.tsx
    │   ├── DemographicCard.tsx
    │   ├── HomepageAds.tsx
    │   ├── MonthlyTarget.tsx
    │   ├── MonthlyChart.tsx
    │   ├── RecentOrders.tsx
    │   └── StatsChart.tsx
    ├── 📂 application/
    │   ├── AppCard.tsx
    │   ├── ApplicationTable.tsx
    │   └── AddApplicationForm.tsx
    ├── 📂 group/
    │   ├── AddGroup.tsx
    │   ├── GroupInput.tsx
    │   └── GroupTable.tsx
    └── 📂 user/
        ├── UserTable.tsx
        ├── UserDropdown.tsx
        └── StepperAddUser.tsx