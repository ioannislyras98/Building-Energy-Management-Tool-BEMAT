# Frontend Restructure Plan

## Current Structure Analysis

### ✅ Good Practices

- Logical separation of concerns
- BuildingProfile subfolder for related components
- Separate folders for hooks, context, modals
- Internationalization setup

### 🔧 Areas for Improvement

## Proposed New Structure

```
src/
├── components/
│   ├── ui/                     # Reusable UI components
│   │   ├── buttons/
│   │   ├── forms/
│   │   ├── dialogs/
│   │   └── layout/
│   ├── features/               # Feature-specific components
│   │   ├── building/
│   │   │   ├── BuildingProfile/
│   │   │   ├── BuildingList/
│   │   │   └── BuildingForms/
│   │   ├── projects/
│   │   ├── contacts/
│   │   └── energy/
│   └── shared/                 # Truly shared components
├── pages/
│   ├── auth/                   # Authentication pages
│   ├── dashboard/
│   ├── buildings/
│   └── projects/
├── modals/
│   ├── building/               # Building-related modals
│   ├── contact/                # Contact-related modals
│   ├── project/                # Project-related modals
│   └── shared/                 # Generic modals
├── hooks/
├── context/
├── services/                   # API calls and external services
├── utils/
├── constants/                  # App constants
├── types/                      # TypeScript types (if migrating)
├── assets/                     # Static assets
│   ├── images/
│   ├── icons/
│   └── styles/
└── i18n/                      # Internationalization
    ├── en/
    ├── gr/
    └── index.js
```

## Specific Improvements

### 1. Component Organization

- Move `ConfirmationDialog.jsx` from components/ to components/ui/dialogs/
- Create feature-based folders under components/features/
- Move building-related components to components/features/building/

### 2. Modal Organization

- Group modals by feature (building/, contact/, project/)
- Keep generic modals in shared/

### 3. Page Organization

- Group pages by feature
- Move RegisterForms to pages/auth/

### 4. Asset Management

- Rename images/ to assets/images/
- Create assets/icons/ for icon assets
- Move CSS files to assets/styles/

### 5. Service Layer

- Move ApiService.js to src/services/
- Create feature-specific services

### 6. Constants and Types

- Create constants/ for app-wide constants
- Prepare for TypeScript migration with types/

## Implementation Steps

1. **Phase 1: UI Components**

   - Create ui/ structure
   - Move reusable components

2. **Phase 2: Feature Organization**

   - Create features/ structure
   - Organize by business domain

3. **Phase 3: Assets and Services**

   - Reorganize assets
   - Improve service layer

4. **Phase 4: Pages and Routing**
   - Group pages by feature
   - Improve routing structure

## Benefits

- **Better Scalability**: Easier to add new features
- **Improved Developer Experience**: Faster file location
- **Cleaner Imports**: More predictable import paths
- **Better Separation of Concerns**: Clear boundaries between UI and business logic
- **Easier Testing**: Feature-based testing strategies
