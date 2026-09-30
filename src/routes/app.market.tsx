import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Badge, Card, PageHeader, SectionTitle, Stat, Table } from "@/components/kit";
import { categoryTrends } from "@/lib/demo-data";

export const Route = createFileRoute("/app/market")({
  component: MarketPage,
});

function MarketPage() {
  const [sortBy, setSortBy] = useState<"revenue" | "orders">("revenue");
  const sortedCategories = [...categoryTrends].sort((left, right) => right[sortBy] - left[sortBy]);
  const totalOrders = categoryTrends.reduce((sum, category) => sum + category.orders, 0);
  const totalRevenue = categoryTrends.reduce((sum, category) => sum + category.revenue, 0);

  return (
    <>
      <PageHeader
        title="Market analysis"
        subtitle="Category demand and sales performance across the current portfolio"
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Tracked categories"
          value={String(categoryTrends.length)}
          sub="Active demand signals"
        />
        <Stat
          label="Orders in sample"
          value={totalOrders.toLocaleString()}
          sub="Across all tracked categories"
          tone="success"
        />
        <Stat
          label="Revenue represented"
          value={`$${(totalRevenue / 1000).toFixed(0)}k`}
          sub="Current reporting period"
          tone="primary"
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <SectionTitle>Revenue by category</SectionTitle>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedCategories} margin={{ top: 8, right: 12, bottom: 8, left: 0 }}>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="category"
                  stroke="var(--subtle)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                />
                <YAxis
                  stroke="var(--subtle)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `$${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => [`$${Number(value).toLocaleString()}`, "Revenue"]}
                  contentStyle={{
                    background: "var(--background-alt)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: 8,
                    color: "var(--foreground)",
                  }}
                />
                <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <SectionTitle>Category ranking</SectionTitle>
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              Rank by
              <select
                className="h-9 rounded-md border border-input bg-background px-2 text-sm text-foreground"
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as "revenue" | "orders")}
              >
                <option value="revenue">Revenue</option>
                <option value="orders">Orders</option>
              </select>
            </label>
          </div>
          <div className="space-y-3">
            {sortedCategories.map((category, index) => (
              <div
                key={category.category}
                className="flex items-center justify-between gap-3 border-b border-border/60 pb-3 last:border-0"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span className="font-mono text-xs text-subtle">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate text-sm font-medium">{category.category}</span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm">${(category.revenue / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-muted-foreground">{category.orders} orders</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-6">
        <SectionTitle>Category demand details</SectionTitle>
        <Table head={["Category", "Order volume", "Revenue", "Revenue / order", "Signal"]}>
          {sortedCategories.map((category, index) => (
            <tr key={category.category} className="border-b border-border/60 last:border-0">
              <td className="px-5 py-4 font-medium">{category.category}</td>
              <td className="px-5 py-4 font-mono">{category.orders}</td>
              <td className="px-5 py-4 font-mono">${category.revenue.toLocaleString()}</td>
              <td className="px-5 py-4 font-mono">
                ${Math.round(category.revenue / category.orders).toLocaleString()}
              </td>
              <td className="px-5 py-4">
                <Badge tone={index < 2 ? "success" : "muted"}>
                  {index < 2 ? "High volume" : "Steady"}
                </Badge>
              </td>
            </tr>
          ))}
        </Table>
      </div>
    </>
  );
}
