import { useEffect, useState } from "react";
import { Button } from "@lottiefiles/creator-plugins-ui";

interface ModeOption {
  value: string;
  label: string;
}

interface ModeGroup {
  title: string;
  modes: ModeOption[];
}

const GROUPS: ModeGroup[] = [
  {
    title: "Darken",
    modes: [
      { value: "darken", label: "Darken" },
      { value: "multiply", label: "Multiply" },
      { value: "color-burn", label: "Color Burn" },
    ],
  },
  {
    title: "Lighten",
    modes: [
      { value: "lighten", label: "Lighten" },
      { value: "screen", label: "Screen" },
      { value: "color-dodge", label: "Color Dodge" },
    ],
  },
  {
    title: "Contrast",
    modes: [
      { value: "overlay", label: "Overlay" },
      { value: "soft-light", label: "Soft Light" },
      { value: "hard-light", label: "Hard Light" },
    ],
  },
  {
    title: "Inversion",
    modes: [
      { value: "difference", label: "Difference" },
      { value: "exclusion", label: "Exclusion" },
    ],
  },
  {
    title: "Component",
    modes: [
      { value: "hue", label: "Hue" },
      { value: "saturation", label: "Saturation" },
      { value: "color", label: "Color" },
      { value: "luminosity", label: "Luminosity" },
    ],
  },
];

const LABELS: Record<string, string> = Object.fromEntries(
  [{ value: "normal", label: "Normal" }, ...GROUPS.flatMap((g) => g.modes)].map((m) => [
    m.value,
    m.label,
  ]),
);

type PluginToUi =
  | { type: "selection-state"; count: number; mode: string | null }
  | { type: "apply-success"; count: number; mode: string }
  | { type: "apply-error"; reason: string };

const sendToPlugin = (message: object) =>
  parent.postMessage({ pluginMessage: message }, "*");

export const App = () => {
  // currentMode is null when nothing is selected or the selection has mixed modes.
  const [count, setCount] = useState(0);
  const [currentMode, setCurrentMode] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      const msg = event.data?.pluginMessage as PluginToUi | undefined;
      if (!msg) return;

      switch (msg.type) {
        case "selection-state":
          setCount(msg.count);
          setCurrentMode(msg.mode);
          break;
        case "apply-success":
          setError("");
          break;
        case "apply-error":
          setError(msg.reason);
          break;
      }
    };

    window.addEventListener("message", onMessage);
    // The plugin drops messages sent before the iframe loads, so ask for state.
    sendToPlugin({ type: "ui-ready" });
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const apply = (mode: string) => sendToPlugin({ type: "apply-blend-mode", mode });

  const renderMode = ({ value, label }: ModeOption) => (
    <Button
      key={value}
      size="sm"
      variant={currentMode === value ? "default" : "secondary"}
      disabled={count === 0}
      onClick={() => apply(value)}
    >
      {label}
    </Button>
  );

  let summary = "Select a layer or group.";
  if (count > 0) {
    const modeText = currentMode ? LABELS[currentMode] ?? currentMode : "Mixed";
    summary = `${count} selected: ${modeText}`;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: 16 }}>
      <p className="text-xs text-muted-foreground" style={{ margin: 0 }}>
        {error || summary}
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
        {renderMode({ value: "normal", label: "Normal (reset)" })}
      </div>

      {GROUPS.map((group) => (
        <div key={group.title} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span className="text-xs text-muted-foreground">{group.title}</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
            {group.modes.map(renderMode)}
          </div>
        </div>
      ))}
    </div>
  );
};
