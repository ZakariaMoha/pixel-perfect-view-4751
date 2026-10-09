import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/kit";
import { TaglineChecker } from "@/components/TaglineChecker";

export const Route = createFileRoute("/app/brand")({
  head: () => ({
    meta: [
      { title: "Brand copy check — TradeHub" },
      { name: "description", content: "AI-powered check for inconsistent tagline wording across TradeHub copy." },
      { property: "og:title", content: "Brand copy check — TradeHub" },
      { property: "og:description", content: "Find and fix off-brand tagline wording with AI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <div>
      <PageHeader title="Brand copy check" subtitle="Paste any page or section — AI flags tagline wording that drifts from the official line." />
      <TaglineChecker />
    </div>
  ),
});
