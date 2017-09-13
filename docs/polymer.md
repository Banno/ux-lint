# Custom polymer-lint Rules

## `icon-titles`

For accessibility, `jha-icon-*` components must have a `title` attribute.

```html
<!-- invalid -->
<jha-icon-test></jha-icon-test>

<!-- valid -->
<jha-icon-test title="test"></jha-icon-test>
```
