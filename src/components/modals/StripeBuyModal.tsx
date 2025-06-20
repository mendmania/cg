// src/components/modals/StripeBuyModal.tsx
import React, { useState, useEffect, useRef } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY as string
);

interface CoinPack {
  label: string;
  coins: number;
  cents: number;
}

interface StripeBuyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (coinsPurchased: number) => void;
  onError: (message: string) => void;
}

const PACK_OPTIONS: CoinPack[] = [
  { label: "100 Coins — $5.00", coins: 100, cents: 500 },
  { label: "250 Coins — $10.00", coins: 250, cents: 1000 },
  { label: "500 Coins — $18.00", coins: 500, cents: 1800 },
];

const StripeBuyModal: React.FC<StripeBuyModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}) => {
  const [selectedPack, setSelectedPack] = useState<CoinPack>(PACK_OPTIONS[0]);
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on ESC key
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Prevent body scroll while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Opaque background, but no onClick on overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50" />

      <div
        ref={modalRef}
        className="relative bg-white rounded-lg shadow-2xl max-w-md w-full p-6 z-10"
      >
        {/* Close ("X") button */}
        <button
          onClick={onClose}
          className="absolute top-3 cursor-pointer right-3 text-gray-500 hover:text-gray-800 focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>

        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Purchase Coins
        </h3>
        <p className="text-gray-700 mb-4">
          Select a pack and enter your card details:
        </p>

        <div className="mb-4">
          <fieldset>
            <legend className="sr-only">Coin Pack Options</legend>
            {PACK_OPTIONS.map((pack) => (
              <label
                key={pack.cents}
                className="flex items-center mb-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md transition"
              >
                <input
                  type="radio"
                  name="coin-pack"
                  value={pack.cents}
                  checked={selectedPack.cents === pack.cents}
                  onChange={() => setSelectedPack(pack)}
                  className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-gray-800">{pack.label}</span>
              </label>
            ))}
          </fieldset>
        </div>

        <Elements stripe={stripePromise}>
          <CheckoutForm
            pack={selectedPack}
            onClose={onClose}
            onSuccess={onSuccess}
            onError={onError}
          />
        </Elements>
      </div>
    </div>
  );
};

export default StripeBuyModal;

// ————————
// Inner form component
// ————————
interface CheckoutFormProps {
  pack: CoinPack;
  onClose: () => void;
  onSuccess: (coinsPurchased: number) => void;
  onError: (message: string) => void;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  pack,
  onClose,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsProcessing(true);

    try {
      // 1) Create PaymentIntent on server
      const resp = await fetch("/api/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: pack.cents }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        onError(data.error || "Failed to create payment intent");
        setIsProcessing(false);
        return;
      }
      const clientSecret = data.clientSecret as string;

      // 2) Confirm card payment
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) {
        onError("Card input not found");
        setIsProcessing(false);
        return;
      }
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: { card: cardElement },
        }
      );

      if (error || paymentIntent?.status !== "succeeded") {
        onError(error?.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      // 3) Success! Pass back number of coins purchased
      onSuccess(pack.coins);
      setIsProcessing(false);
      onClose();
    } catch (err: any) {
      console.error("Stripe error:", err);
      onError(err.message || "Unexpected error");
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="card-element"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Card Details
        </label>
        <div className="p-2 border border-gray-300 rounded-md">
          <CardElement
            id="card-element"
            options={{
              style: {
                base: {
                  fontSize: "16px",
                  color: "#32325d",
                  "::placeholder": { color: "#a0a0a0" },
                },
                invalid: { color: "#fa755a" },
              },
            }}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!stripe || isProcessing}
        className={`w-full py-3 rounded-md text-white text-base transition duration-200 ${
          isProcessing
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 active:bg-green-800 transform hover:scale-105 cursor-pointer"
        }`}
      >
        {isProcessing
          ? "Processing…"
          : `Pay $${(pack.cents / 100).toFixed(2)}`}
      </button>
    </form>
  );
};
