"use client";

import ApiClient from "@/api";
import React, { useCallback, useMemo, useState } from "react";
import Image from "next/image";
import { Button, Checkbox, Input } from "@heroui/react";
import Link from "next/link";
import { toast } from "sonner";
import Cookies from "js-cookie";
import { Icon } from "@iconify/react";

const apiClient = new ApiClient();
type Variant = "LOGIN" | "SIGNUP";

const Home = () => {
  const [variant, setVariant] = useState<Variant>("LOGIN");
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
    rememberMe: false,
  });

  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
  });

  const handleBlur = (field: string) => {
    setTouched({ ...touched, [field]: true });
  };

  const isInvalidEmail = useMemo(() => {
    return !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email);
  }, [data.email]);

  const isUsernameValid = useMemo(() => {
    return data.username.trim() === "";
  }, [data.username]);

  const passwordErrors = useMemo(() => {
    const errors: string[] = [];
    if (data.password.length < 10) {
      errors.push("Password must be 10 characters or more.");
    }
    if ((data.password.match(/[0-9]/g) || []).length < 1) {
      errors.push("Password must include at least 1 number.");
    }
    if ((data.password.match(/[A-Z]/g) || []).length < 1) {
      errors.push("Password must include at least 1 upper case letter.");
    }
    if ((data.password.match(/[^a-z0-9]/gi) || []).length < 1) {
      errors.push("Password must include at least 1 symbol.");
    }

    return errors;
  }, [data.password]);

  const toggleVariant = useCallback(() => {
    setData({
      username: "",
      email: "",
      password: "",
      rememberMe: false,
    });
    setTouched({
      username: false,
      email: false,
      password: false,
    });
    setIsVisible(false);
    if (variant === "LOGIN") {
      setVariant("SIGNUP");
    } else {
      setVariant("LOGIN");
    }
  }, [variant]);

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setTouched({
      username: true,
      email: true,
      password: true,
    });
    setIsLoading(true);

    if (variant === "LOGIN") {
      const response = await apiClient.auth.helper.login(data);
      if (response.status === false) {
        toast.error("Invalid credentials");
      } else {
        toast.success("Login successful");
        if (data.rememberMe) {
          Cookies.set("accessToken", response.data.backendTokens.accessToken, {
            expires: 1,
          });
          Cookies.set(
            "refreshToken",
            response.data.backendTokens.refreshToken,
            {
              expires: 7,
            }
          );
        } else {
          Cookies.set("accessToken", response.data.backendTokens.accessToken);
        }
        window.location.reload();
      }
      setIsLoading(false);
    }

    if (variant === "SIGNUP") {
      const response = await apiClient.auth.helper.register(data);
      if (response.status === false) {
        if (touched.password) {
          toast.error("There is already an account with this email address");
        }
      } else {
        const login = await apiClient.auth.helper.login(data);
        if (data.rememberMe) {
          Cookies.set("accessToken", login.data.backendTokens.accessToken, {
            expires: 1,
          });
          Cookies.set("refreshToken", login.data.backendTokens.refreshToken, {
            expires: 7,
          });
        } else {
          Cookies.set("accessToken", login.data.backendTokens.accessToken);
        }
        window.location.reload();
      }
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex min-h-full flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-100 h-screen">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Image
            alt="Logo"
            height="128"
            width="128"
            className="mx-auto w-auto"
            src="/images/icon.png"
          />
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mb-8 text-center text-3xl font-bold tracking-tighter text-gray-900">
            {variant == "LOGIN"
              ? "Sign in to your account"
              : "Create an account"}
          </h2>
          <div className="bg-white px-4 py-8 shadow-2xl sm:rounded-lg sm:px-10">
            <form
              onSubmit={(event) => {
                onSubmit(event);
              }}
              className="space-y-6"
            >
              {variant == "SIGNUP" && (
                <Input
                  label="Username"
                  isRequired
                  type="text"
                  variant="underlined"
                  value={data.username}
                  onChange={(e) =>
                    setData({ ...data, username: e.target.value })
                  }
                  onBlur={() => handleBlur("username")}
                  isInvalid={touched.username && isUsernameValid}
                  errorMessage="Username is required"
                />
              )}
              <Input
                label="Email Address"
                isRequired
                type="email"
                variant="underlined"
                value={data.email}
                onChange={(e) => setData({ ...data, email: e.target.value })}
                onBlur={() => handleBlur("email")}
                isInvalid={touched.email && isInvalidEmail}
                errorMessage="Enter a valid email address"
              />

              <Input
                label="Password"
                isRequired
                variant="underlined"
                type={isVisible ? "text" : "password"}
                value={data.password}
                onChange={(e) => setData({ ...data, password: e.target.value })}
                onBlur={() => handleBlur("password")}
                isInvalid={
                  touched.password &&
                  (variant === "LOGIN" ? false : passwordErrors.length > 0)
                }
                errorMessage={() => (
                  <ul>
                    {passwordErrors.map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                  </ul>
                )}
                endContent={
                  <button
                    type="button"
                    onClick={() => setIsVisible(!isVisible)}
                  >
                    <Icon
                      icon={isVisible ? "mdi:eye-off" : "mdi:eye"}
                      className="text-gray-500"
                      width={24}
                      height={24}
                    />
                  </button>
                }
              />

              <div className="flex items-center justify-between">
                <Checkbox
                  isSelected={data.rememberMe}
                  onValueChange={(value) => {
                    setData({ ...data, rememberMe: value });
                  }}
                >
                  Remember me
                </Checkbox>
                <button className="text-sm font-semibold text-[#0070e0] hover:underline">
                  <Link href="">Forgot password?</Link>
                </button>
              </div>
              <div>
                <Button
                  fullWidth
                  isLoading={isLoading}
                  type="submit"
                  variant="solid"
                  className="bg-[#0544b5] text-white font-semibold hover:bg-[#0070e0]"
                >
                  {variant === "LOGIN" ? "Sign in" : "Register"}
                </Button>
              </div>
            </form>
          </div>
          <div>
            <p className="mt-2 text-center text-sm text-gray-600">
              {variant === "LOGIN"
                ? "Don't have an account?"
                : "Already have an account?"}
              <button
                onClick={toggleVariant}
                className="ml-1 font-medium text-blue-500 hover:underline"
              >
                {variant === "LOGIN" ? "Register" : "Sign in"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
