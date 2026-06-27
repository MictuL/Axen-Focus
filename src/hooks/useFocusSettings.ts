import { useState } from "react";
import { DEFAULT_FOCUS_SETTINGS, normalizeFocusConfiguration } from "../lib/focusDaily";
import type { FocusSettings } from "../types";

const STORAGE_KEY = "axen-focus-settings-v2";

function loadFocusSettings(): FocusSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return DEFAULT_FOCUS_SETTINGS;
    const parsed = JSON.parse(stored) as Partial<FocusSettings>;
    return {
      configuration: normalizeFocusConfiguration(parsed.configuration),
      formulas: DEFAULT_FOCUS_SETTINGS.formulas.map((formula) => parsed.formulas?.find((item) => item.condition === formula.condition) ?? formula),
    };
  } catch {
    return DEFAULT_FOCUS_SETTINGS;
  }
}

export function useFocusSettings() {
  const [settings, setSettings] = useState<FocusSettings>(loadFocusSettings);

  function saveSettings(next: FocusSettings) {
    const normalized = {
      ...next,
      configuration: normalizeFocusConfiguration(next.configuration),
    };
    setSettings(normalized);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
  }

  function restoreSettings() {
    setSettings(DEFAULT_FOCUS_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  }

  return { settings, saveSettings, restoreSettings };
}
