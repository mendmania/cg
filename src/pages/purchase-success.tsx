// pages/purchase-success.tsx
import { useRouter } from "next/router";
import { useEffect } from "react";

const PurchaseSuccess: React.FC = () => {
  const router = useRouter();
  const { pack } = router.query as { pack?: string };

  useEffect(() => {
    // Here you would:
    // 1) Verify the session on your backend (optional but recommended)
    // 2) Credit the user’s account with `pack` coins (e.g., POST /api/credit-coins)
    // 3) Then maybe redirect back to / with a “Thank you” message.
    //
    // For this example, we’ll simply alert and send the user back.

    if (pack) {
      alert(`Thank you! You bought the ${pack}-coin pack.`);
      router.replace("/");
    }
  }, [pack, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <p className="text-lg">Processing your purchase…</p>
    </div>
  );
};

export default PurchaseSuccess;
