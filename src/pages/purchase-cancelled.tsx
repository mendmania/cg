// pages/purchase-cancelled.tsx
import { useRouter } from "next/router";
import { useEffect } from "react";

const PurchaseCancelled: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    alert("Your purchase was cancelled.");
    router.replace("/");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-lg">Purchase cancelled. Returning to home…</p>
    </div>
  );
};

export default PurchaseCancelled;
