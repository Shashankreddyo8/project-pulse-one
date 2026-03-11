import { PageHeader } from "@/components/PageHeader";
import IntegrationsPanel from "@/components/IntegrationsPanel";

export default function IntegrationsPage() {
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Integrations & Connections"
        description="Manage your linked external tools to synchronize data, events, and insights."
      />
      <div className="mt-8">
        <IntegrationsPanel />
      </div>
    </div>
  );
}
