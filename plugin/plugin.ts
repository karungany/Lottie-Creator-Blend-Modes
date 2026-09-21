creator.ui.show({ width: 260, height: 500 });

const BLEND_MODES = [
  "normal",
  "multiply",
  "screen",
  "overlay",
  "darken",
  "lighten",
  "color-dodge",
  "color-burn",
  "hard-light",
  "soft-light",
  "difference",
  "exclusion",
  "hue",
  "saturation",
  "color",
  "luminosity",
] as const;

type Mode = (typeof BLEND_MODES)[number];

type IncomingMessage =
  | { type: "ui-ready" }
  | { type: "apply-blend-mode"; mode: unknown };

const isMode = (value: unknown): value is Mode =>
  typeof value === "string" && (BLEND_MODES as readonly string[]).includes(value);

// Only layers and groups have a blendMode. Shapes inside a layer do not.
const getTargets = () =>
  creator.selection.nodes.filter(
    (node) => creator.utils.isLayer(node) || node.type === "GROUP",
  );

// Tell the UI how many blendable nodes are selected and their shared mode
// (null when the selection is empty or the modes differ).
const sendSelectionState = () => {
  const targets = getTargets();
  const first = targets[0]?.blendMode;
  const shared =
    first !== undefined && targets.every((t) => t.blendMode === first)
      ? first
      : null;

  creator.ui.postMessage({
    type: "selection-state",
    count: targets.length,
    mode: shared,
  });
};

creator.ui.onMessage((msg: IncomingMessage) => {
  switch (msg.type) {
    case "ui-ready": {
      sendSelectionState();
      break;
    }
    case "apply-blend-mode": {
      if (!isMode(msg.mode)) {
        creator.ui.postMessage({ type: "apply-error", reason: "Unknown blend mode." });
        sendSelectionState();
        return;
      }

      const targets = getTargets();
      if (targets.length === 0) {
        creator.ui.postMessage({
          type: "apply-error",
          reason: "Select at least one layer or group.",
        });
        sendSelectionState();
        return;
      }

      for (const node of targets) {
        node.blendMode = msg.mode;
      }

      creator.ui.postMessage({
        type: "apply-success",
        count: targets.length,
        mode: msg.mode,
      });
      sendSelectionState();
      break;
    }
  }
});

creator.on("selection:nodes", sendSelectionState);
