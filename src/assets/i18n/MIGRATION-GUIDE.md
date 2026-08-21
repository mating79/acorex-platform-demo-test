# i18n Structure Migration Guide

## Overview

This guide helps you migrate existing i18n files to the new hierarchical structure.

## File Types

### 1. Module Files

Business modules that contain multiple features (e.g., `form-template-management.json`, `human-capital-management.json`)

**Reserved Key**: `"module"`

### 2. Standalone Feature Files

Common features/plugins used across modules (e.g., `activity-log.json`, `lock-system.json`)

**Reserved Key**: `"feature"`

---

## Module Files Migration

### Old Structure (Flat)

```json
{
  "module-name": "Form Template Management",
  "root-menu": "Form Templates",
  "template": "Template",
  "templates": "Templates",
  "widget-picker": {
    "title": "Widget Gallery"
  },
  "settings": {
    "form-template": {
      "title": "Form Template",
      "designer": {
        "auto-save": {
          "title": "Auto Save"
        }
      }
    }
  },
  "permissions": {
    "form-template": {
      "templates": {
        "view": { "title": "@general:actions.view.title" }
      }
    }
  }
}
```

### New Structure (Hierarchical)

```json
{
  "module": {
    "title": "Form Template Management",
    "description": "Manage form templates, widgets, and categories",
    "menus": {
      "root": {
        "title": "Form Templates",
        "description": "Manage form templates and widgets"
      }
    }
  },
  "templates": {
    "terms": {
      "template": "Template",
      "templates": "Templates"
    },
    "entities": {
      "template": {
        "title": "Template",
        "plural": "Templates",
        "fields": {
          "code": {
            "title": "Code",
            "description": "Unique identifier",
            "placeholder": "Enter code"
          }
        }
      }
    },
    "permissions": {
      "templates": {
        "title": "Templates",
        "actions": {
          "view": { "title": "@general:actions.view.title" }
        }
      }
    }
  },
  "designer": {
    "terms": {
      "designer": "Designer"
    },
    "components": {
      "widget-picker": {
        "title": "Widget Gallery"
      }
    },
    "settings": {
      "designer": {
        "title": "Designer",
        "description": "Designer settings",
        "items": {
          "auto-save": {
            "title": "Auto Save",
            "description": "Enable automatic saving"
          }
        }
      }
    }
  }
}
```

### Translation Key Changes

```typescript
// Old → New
'@form-template-management:module-name'
→ '@form-template-management:module.title'

'@form-template-management:root-menu'
→ '@form-template-management:module.menus.root.title'

'@form-template-management:template'
→ '@form-template-management:templates.terms.template'

'@form-template-management:widget-picker.title'
→ '@form-template-management:designer.components.widget-picker.title'

'@form-template-management:settings.form-template.designer.auto-save.title'
→ '@form-template-management:designer.settings.designer.items.auto-save.title'
```

---

## Standalone Feature Files Migration

### Old Structure (Flat)

```json
{
  "title": "Activity Log",
  "created-at": "Created At",
  "created-by": "Created By",
  "state-message": {
    "no-history": {
      "title": "No Activity",
      "description": "No activity has been recorded."
    }
  },
  "actions": {
    "view-history": "View History",
    "restore": "Restore"
  }
}
```

### New Structure (Hierarchical)

```json
{
  "feature": {
    "title": "Activity Log",
    "description": "Track and display activity history for entities"
  },
  "terms": {
    "created-at": "Created At",
    "created-by": "Created By"
  },
  "components": {
    "activity-log": {
      "title": "Activity Log",
      "description": "View entity activity history",
      "empty-states": {
        "no-history": {
          "title": "No Activity",
          "description": "No activity has been recorded."
        }
      }
    }
  },
  "actions": {
    "view-history": {
      "title": "View History",
      "description": "View activity history"
    },
    "restore": {
      "title": "Restore",
      "description": "Restore previous version"
    }
  }
}
```

### Translation Key Changes

```typescript
// Old → New
'@activity-log:title'
→ '@activity-log:feature.title'

'@activity-log:created-at'
→ '@activity-log:terms.created-at'

'@activity-log:state-message.no-history.title'
→ '@activity-log:components.activity-log.empty-states.no-history.title'

'@activity-log:actions.view-history'
→ '@activity-log:actions.view-history.title'
```

---

## Migration Steps

### For Module Files

1. **Create `module` section**
   - Add `title`, `description`
   - Move root menu items to `module.menus`
   - Add shared terms to `module.terms` (if any)

2. **Identify features**
   - Group related translations by feature
   - Common features: templates, categories, designer, viewer, etc.

3. **Organize per feature**
   - Create feature sections as root keys
   - Add subsections: `terms`, `menus`, `entities`, `components`, `settings`, `permissions`

4. **Convert entity fields to objects**

   ```json
   // Before
   "fields": { "code": "Code" }

   // After
   "fields": {
     "code": {
       "title": "Code",
       "description": "Field description",
       "placeholder": "Enter code"
     }
   }
   ```

5. **Update code references**
   - Update all `@scope:key` references in code
   - Search for translation service usage
   - Update entity definitions
   - Update settings providers
   - Update permission providers
   - Update menu providers

### For Standalone Feature Files

1. **Create `feature` section**
   - Add `title`, `description`

2. **Organize by section type**
   - Move terms to `terms` section
   - Group UI elements in `components` section
   - Move actions to `actions` section with title/description
   - Add `empty-states` under components

3. **Convert action strings to objects**

   ```json
   // Before
   "actions": { "view-history": "View History" }

   // After
   "actions": {
     "view-history": {
       "title": "View History",
       "description": "View activity history"
     }
   }
   ```

4. **Update code references**
   - Update all `@scope:key` references
   - Test all UI elements

---

## Available Sections

### Module Files

- `module` - Reserved key for module metadata
- `{feature-name}` - Feature sections
  - `terms` - Feature terminology
  - `menus` - Feature menus
  - `entities` - Data models
    - `{entity-name}` - Entity definition
      - `title`, `plural` - Entity names
      - `fields` - Entity fields with title/description/placeholder
      - `groups` - UI grouping labels for organizing fields
  - `components` - UI components
  - `settings` - Configuration options
  - `permissions` - Access control
  - `actions` - User actions
  - `messages` - System messages
  - `states` - Status labels
  - `validations` - Validation messages

### Standalone Feature Files

- `feature` - Reserved key for feature metadata
- `terms` - Feature terminology
- `components` - UI components
- `actions` - User actions
- `messages` - System messages
- `states` - Status labels
- `validations` - Validation messages

---

## Reference Files

- **Module Pattern**: `_module-sample.json`
- **Standalone Feature Pattern**: `_feature-sample.json`
- **Documentation**: `.cursor/rules/core-rules/translation-management.mdc`

---

## Important: Multi-Language Support

⚠️ **CRITICAL**: After updating the English (en-US) i18n file structure, you **MUST** update all other language files to match the same structure!

### Supported Languages
- `en-US` (English - US)
- `fa-IR` (Persian - Iran)

### Steps
1. Update `en-US/{file}.json` with new structure
2. Update `fa-IR/{file}.json` with **same structure** (translate values only)
3. Keep the same keys and hierarchy across all languages
4. Ensure all sections exist in all language files

### Example
```json
// en-US/global-search.json
{
  "feature": { "title": "Global Search" },
  "terms": { "search": "Search" }
}

// fa-IR/global-search.json
{
  "feature": { "title": "جستجوی سراسری" },
  "terms": { "search": "جستجو" }
}
```

---

## Testing After Migration

1. ✅ Build the application
2. ✅ Check for translation key errors in console
3. ✅ Test all UI pages that use the migrated translations
4. ✅ **Test all supported languages** (en-US, fa-IR)
5. ✅ Verify settings pages load correctly
6. ✅ Test permission displays
7. ✅ Check menu items render properly
8. ✅ Test entity forms and field labels
9. ✅ Verify empty states and messages

---

## Common Issues

### Issue: Missing translations

**Cause**: Key path changed but code not updated
**Solution**: Search for old key format and update all occurrences

### Issue: Entity fields not showing

**Cause**: Field format changed from string to object
**Solution**: Convert all entity field values to objects with `title`, `description`, `placeholder`

### Issue: Settings not loading

**Cause**: Settings path structure changed
**Solution**: Update settings provider to use new path: `feature.settings.section.items.item-key`

### Issue: Permissions not displaying

**Cause**: Permission structure changed
**Solution**: Update permission provider to use: `feature.permissions.resource.actions.action-key`

---

## Rollback Plan

If migration causes issues:

1. Keep backup of old i18n files
2. Revert to old structure
3. Fix issues one module at a time
4. Test thoroughly before proceeding

---

## Support

For questions or issues, refer to:

- Translation Management Rules: `.cursor/rules/core-rules/translation-management.mdc`
- Sample Files: `_module-sample.json`, `_feature-sample.json`
