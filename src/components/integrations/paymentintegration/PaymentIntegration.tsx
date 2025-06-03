// src/components/integrations/PaymentIntegration/PaymentIntegration.tsx
import React, { useEffect } from "react";
import { PaymentPanel } from "@/components/containers/paymentpanel/PaymentPanel";

export const PaymentIntegration: React.FC = () => {
  useEffect(() => {
    window.parent.postMessage({ type: "widgetLoaded", widget: "payment" }, "*");
    // TODO: hook in Stripe Elements & postMessage events
  }, []);

  return <PaymentPanel />;
};
