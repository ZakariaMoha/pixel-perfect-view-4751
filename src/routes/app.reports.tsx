import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Download } from "lucide-react";
import { Button, Card, PageHeader, SectionTitle, Stat, Table } from "@/components/kit";
import { revenueSeries, usd } from "@/lib/demo-data";

export const Route = createFileRoute("/app/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  const [period, setPeriod] = useState<3 | 6>(6);
  const visibleMonths = revenueSeries.slice(-period);
  const revenue = visibleMonths.reduce((sum, month) => sum + month.revenue, 0);
  const profit = visibleMonths.reduce((sum, month) => sum + month.profit, 0);
  const orderCount = visibleMonths.reduce((sum, month) => sum + month.orders, 0);
  const exportCsv = () => {
    const rows = [
      ["Month", "Revenue USD", "Profit USD", "Orders"],
      ...visibleMonths.map((month) => [
        month.month,
        String(month.revenue),
        String(month.profit),
        String(month.orders),
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `tradehub-report-${period}-months.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Reports & profit"
        subtitle="Revenue, gross profit, and order volume from the reporting dataset"
        actions={
          <>
            <select
              aria-label="Reporting period"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={period}
              onChange={(event) => setPeriod(Number(event.target.value) as 3 | 6)}
            >
              <option value={3}>Last 3 months</option>
              <option value={6}>Last 6 months</option>
            </select>
            <Button onClick={exportCsv} type="button">
              <Download size={16} /> Export CSV
            </Button>
          </>
        }
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Revenue" value={usd(revenue)} sub={`${period}-month period`} tone="success" />
        <Stat
          label="Gross profit"
          value={usd(profit)}
          sub={`${((profit / Math.max(revenue, 1)) * 100).toFixed(1)}% margin`}
          tone="primary"
        />
        <Stat label="Orders" value={String(orderCount)} sub="Across selected months" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <SectionTitle>Revenue and profit trend</SectionTitle>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={visibleMonths}>
                <defs>
                  <linearGradient id="reportRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="reportProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="var(--accent)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis
                  dataKey="month"
                  stroke="var(--subtle)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="var(--subtle)"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value: number) => `$${value / 1000}k`}
                />
                <Tooltip
                  formatter={(value) => usd(Number(value))}
                  contentStyle={{
                    background: "var(--background-alt)",
                    border: "1px solid var(--border-strong)",
                    borderRadius: 8,
                    color: "var(--foreground)",
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  name="Revenue"
                  stroke="var(--primary)"
                  fill="url(#reportRevenue)"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  name="Profit"
                  stroke="var(--accent)"
                  fill="url(#reportProfit)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="xl:col-span-2">
          <SectionTitle>Monthly breakdown</SectionTitle>
          <Table head={["Month", "Revenue", "Profit", "Orders"]}>
            {visibleMonths.map((month) => (
              <tr key={month.month} className="border-b border-border/60 last:border-0">
                <td className="px-3 py-3 font-medium">{month.month}</td>
                <td className="px-3 py-3 font-mono">{usd(month.revenue)}</td>
                <td className="px-3 py-3 font-mono text-success">{usd(month.profit)}</td>
                <td className="px-3 py-3 font-mono">{month.orders}</td>
              </tr>
            ))}
          </Table>
        </Card>
      </div>
    </>
  );
}
