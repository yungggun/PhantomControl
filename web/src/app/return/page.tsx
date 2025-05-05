"use client";

import ApiClient from "@/api";
import Loader from "@/components/Loader";
import type { Customer, Product } from "@/types/customer";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import AnimatedBackground from "@/components/Return/Background";
import { renderConfetti } from "@/components/Return/Animations";
import SuccessCard from "@/components/Return/SuccessCard";
import ErrorCard from "@/components/Return/ErrorCard";

const apiClient = new ApiClient();
type Status = "SUCCESS" | "LOADING" | "ERROR";

const ReturnPage = () => {
  const [status, setStatus] = useState<Status>("LOADING");
  const [customer, setCustomer] = useState<Customer>();
  const [product, setProduct] = useState<Product>();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) return;

    apiClient.payment.helper.getSessionStatus(sessionId).then((response) => {
      if (response.status) {
        if (response.data.status === "paid") {
          setStatus("SUCCESS");
        } else {
          setStatus("ERROR");
        }
        setCustomer(response.data.customer);
        setProduct(response.data.product);
      } else {
        router.push("/dashboard");
      }
    });
  }, [searchParams, router]);

  return (
    <>
      {status === "LOADING" ? (
        <Loader />
      ) : status === "SUCCESS" ? (
        <div className="flex justify-center items-center min-h-screen p-6">
          <AnimatedBackground colorScheme="success" />
          <SuccessCard customer={customer} product={product} />
          {renderConfetti()}
        </div>
      ) : (
        <div className="flex justify-center items-center min-h-screen p-6">
          <AnimatedBackground colorScheme="danger" />
          <ErrorCard customer={customer} product={product} />
        </div>
      )}
    </>
  );
};

export default ReturnPage;
