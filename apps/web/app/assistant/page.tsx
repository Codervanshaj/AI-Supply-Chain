import { AppShell } from "@/components/app-shell";
import { AssistantPanel } from "@/components/assistant-panel";

export default function AssistantPage() {
  return (
    <AppShell currentPath="/assistant">
      <AssistantPanel />
    </AppShell>
  );
}

