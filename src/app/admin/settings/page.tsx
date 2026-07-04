"use client";

import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";

import AdminLayout from "@/components/admin/AdminLayout";
import {
  getStudioSettings,
  saveStudioSettings,
} from "@/lib/studioSettings";
import type { StudioSettings } from "@/types/notifications";

export default function SettingsPage() {
  const [settings, setSettings] = useState<StudioSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadSettings() {
      const result = await getStudioSettings();
      setSettings(result);
      setLoading(false);
    }

    loadSettings();
  }, []);

  const updateField = (field: keyof StudioSettings, value: string) => {
    if (!settings) return;

    setSettings({
      ...settings,
      [field]: value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!settings) return;

    setSaving(true);
    setMessage("");

    try {
      await saveStudioSettings(settings);
      setMessage("Notification settings saved.");
    } catch {
      setMessage("Unable to save settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <section className="max-w-4xl border border-white/10 bg-white/[0.025] p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--accent-gold)]">
          Settings
        </p>
        <h2 className="mt-2 font-serif text-4xl text-white">
          Notification Settings
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/55">
          These values are stored in Firestore at `settings/studio` and are used
          dynamically in confirmation emails and WhatsApp messages.
        </p>

        {message && (
          <div className="mt-6 border border-[var(--accent-gold)]/30 bg-[var(--accent-gold)]/10 px-4 py-3 text-sm text-white">
            {message}
          </div>
        )}

        {loading && (
          <div className="mt-8 flex items-center gap-3 text-sm text-white/55">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading settings
          </div>
        )}

        {settings && (
          <form onSubmit={handleSubmit} className="mt-8 grid gap-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <label className="grid gap-2 text-sm text-white/60">
                Studio Name
                <input
                  value={settings.studioName}
                  onChange={(event) =>
                    updateField("studioName", event.target.value)
                  }
                  className="field-surface px-4 py-3 text-white"
                />
              </label>

              <label className="grid gap-2 text-sm text-white/60">
                Studio Email
                <input
                  type="email"
                  value={settings.studioEmail}
                  onChange={(event) =>
                    updateField("studioEmail", event.target.value)
                  }
                  className="field-surface px-4 py-3 text-white"
                />
              </label>

              <label className="grid gap-2 text-sm text-white/60">
                Studio Phone
                <input
                  value={settings.studioPhone}
                  onChange={(event) =>
                    updateField("studioPhone", event.target.value)
                  }
                  className="field-surface px-4 py-3 text-white"
                />
              </label>

              <label className="grid gap-2 text-sm text-white/60">
                WhatsApp Number
                <input
                  value={settings.whatsappNumber}
                  onChange={(event) =>
                    updateField("whatsappNumber", event.target.value)
                  }
                  className="field-surface px-4 py-3 text-white"
                />
              </label>

              <label className="grid gap-2 text-sm text-white/60">
                Instagram URL
                <input
                  type="url"
                  value={settings.instagramUrl}
                  onChange={(event) =>
                    updateField("instagramUrl", event.target.value)
                  }
                  className="field-surface px-4 py-3 text-white"
                />
              </label>

              <label className="grid gap-2 text-sm text-white/60">
                Website URL
                <input
                  type="url"
                  value={settings.websiteUrl}
                  onChange={(event) =>
                    updateField("websiteUrl", event.target.value)
                  }
                  className="field-surface px-4 py-3 text-white"
                />
              </label>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="flex min-h-12 w-fit items-center justify-center gap-2 bg-[var(--accent-gold)] px-5 py-3 text-sm font-medium text-black transition hover:bg-[var(--accent-soft)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save Settings
            </button>
          </form>
        )}
      </section>
    </AdminLayout>
  );
}
