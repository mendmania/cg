// src/components/containers/PaymentPanel/PaymentPanel.tsx
import React from "react";
import { FormField } from "@/components/composites/formfield/FormField";
import { Button } from "@/components/fundamentals/button/Button";

export const PaymentPanel: React.FC = () => {
  const handlePay = () => {
    // TODO: call useStripe hook
    alert("Charge initiated");
  };

  return (
    <div style={{ padding: "16px" }}>
      <FormField label="Card number" placeholder="•••• •••• •••• ••••" />
      <FormField label="Expiry date" placeholder="MM/YY" />
      <FormField label="CVC" placeholder="123" />
      <Button onClick={handlePay} style={{ marginTop: "16px" }}>
        Pay Now
      </Button>
    </div>
  );
};
