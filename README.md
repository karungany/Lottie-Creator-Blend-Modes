# Blend Modes for Lottie Creator

A Lottie Creator plugin that applies blend modes to selected layers and groups in one click.

![Blend Modes panel](screenshot.png)

## Features

- All 16 blend modes in one panel, grouped as Darken, Lighten, Contrast, Inversion and Component
- One click applies a mode, with no dropdown and no Apply button
- Highlights the mode on the current selection and shows "Mixed" when the selection differs
- "Normal (reset)" restores the default blend mode

## Usage

1. Select one or more layers or groups in Lottie Creator.
2. Open the plugin from the Plugins panel.
3. Click a blend mode.

Blend modes apply to layers and groups only. Shapes nested inside a layer have no blend mode of their own, so select the parent layer.

## Development

```bash
npm install
npm run dev
```

Copy the HTTPS URL that Vite prints, then in Creator open Plugins, click **+**, and load it from the Develop tab.

## Build

```bash
npm run build
```

Zip `manifest.json`, `plugin.js` and `ui.html` from `dist/` to load the plugin from a ZIP file.

## Note on rendering

How a blend mode renders depends on the player you export to. Test in your target runtime before shipping.

## License

Add your preferred license here.
