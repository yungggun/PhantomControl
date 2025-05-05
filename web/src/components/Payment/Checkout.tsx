"use client";
import { type FC, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { STRIPE_PUBLIC_KEY } from "@/lib/constants";
import type { Role } from "@/types/user";
import ApiClient from "@/api";

interface CheckoutProps {
  plan: Role | null;
}

const apiClient = new ApiClient();

const Checkout: FC<CheckoutProps> = ({ plan }) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  const [isLoading, setIsLoading] = useState(true);
  const [isAlreadySubscribed, setIsAlreadySubscribed] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    apiClient.payment.helper
      .createCheckoutSession(plan)
      .then((response) => {
        console.log(response);
        if (response.status) {
          setClientSecret(response.data.client_secret);
        } else if (response.data === 403) {
          setIsAlreadySubscribed(true);
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [plan]);

  return (
    <div className="text-center">
      <h1 className="text-4xl font-bold mb-4 text-blackho">
        {isAlreadySubscribed ? "Already Subscribed" : `Subscribe to ${plan}`}
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        {isAlreadySubscribed
          ? "You are already subscribed to a plan. Please cancel your current subscription to subscribe to a new plan."
          : `You are about to subscribe to the ${plan} plan. Please enter your payment details below to proceed.`}
      </p>

      <div className="mt-8">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          clientSecret && (
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          )
        )}
      </div>
    </div>
  );
};

export default Checkout;
