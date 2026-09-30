import { createFileRoute } from "@tanstack/react-router";
import { CrudPage } from "@/components/CrudPage";
import { conversations } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/inbox")({
  component: InboxPage,
});

function InboxPage() {
  const collection = usePersistentList("conversations", conversations);
  return <CrudPage title="Inbox" subtitle="Client and agent conversation threads" records={collection.records} onCreate={collection.create} onUpdate={collection.update} onDelete={collection.remove} fields={[
    { key: "name", label: "Contact", required: true },
    { key: "channel", label: "Channel", type: "select", options: ["WHATSAPP", "WECHAT", "EMAIL"], required: true },
    { key: "preview", label: "Latest message", required: true }, { key: "unread", label: "Unread messages", type: "number", required: true },
    { key: "time", label: "Last activity", required: true }, { key: "order", label: "Linked order or request", required: true },
  ]} columns={[
    { key: "name", label: "Contact" }, { key: "channel", label: "Channel" }, { key: "preview", label: "Latest message" },
    { key: "unread", label: "Unread", mono: true }, { key: "time", label: "Last activity" }, { key: "order", label: "Reference", mono: true },
  ]} />;
}
