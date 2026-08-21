# Brand assets

Identity artwork for the demo app. Filenames are self-describing for search.

## Layout

```text
brand/
  platform/        # shell logoKey="platform"
  entities/        # tenant + application marks
  integrations/    # third-party provider marks
```

## Naming

```text
{brand}-{format}[-{appearance}].{ext}
```

| Token | Values | Notes |
|-------|--------|--------|
| `brand` | `platform`, `safetyminder`, `bamboohr`, … | Always in the filename |
| `format` | `icon` \| `text` \| `full` \| `mark` | Platform system vs single mark |
| `appearance` | `light` \| `dark` | Only when a pair exists |

### Appearance meaning (surface)

- `*-dark` — light artwork for **dark** surfaces (`onDark`)
- `*-light` — artwork for **light** surfaces (`onLight`)

### Examples

- `platform-full-dark.svg` — lockup on dark chrome
- `safetyminder-mark.svg` — single colored app mark
- `bamboohr-mark.svg` — integration mark

Prefer SVG. Prefer one canonical file (no parallel PNG when SVG exists).
