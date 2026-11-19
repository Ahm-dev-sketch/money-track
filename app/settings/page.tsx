import type { Metadata } from "next";
import { AppShell } from "@/components/layout/AppShell";
import { SettingsPage } from "@/components/settings/SettingsPage";

export const metadata: Metadata = { title: "Pengaturan" };

export default function Page() {
  return (
    <AppShell>
      <SettingsPage />
    </AppShell>
  );
}
