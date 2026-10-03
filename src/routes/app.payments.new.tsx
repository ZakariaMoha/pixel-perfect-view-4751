import { createFileRoute } from "@tanstack/react-router";
import { PaymentForm } from "@/components/payments/PaymentForm";
import { payments, type Payment } from "@/lib/demo-data";
import { usePersistentList } from "@/lib/use-persistent-list";

export const Route = createFileRoute("/app/payments/new")({ component: NewPaymentPage });

function NewPaymentPage() {
  const collection = usePersistentList<Payment>("payments", payments);
  return (
    <PaymentForm
      onSave={(payment) => {
        const { id: _id, ...record } = payment;
        const created = collection.create({
          ...record,
          code: `PM-${new Date().getFullYear()}-${String(collection.records.length + 1).padStart(4, "0")}`,
        });
        window.location.href = `/app/payments/${created.id}`;
      }}
    />
  );
}
