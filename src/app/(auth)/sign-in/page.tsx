"use client";

import axios from "axios";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post(
        "/api/sign-in",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      const data = response.data;

      if (!data.success) {
        alert(data.message);
        return;
      }

      // Single dashboard route
      router.replace("/dashboard");

    } catch (error: any) {
      console.error(error);

      alert(
        error?.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="
        min-h-screen
        bg-black
        relative
        overflow-hidden
        flex
        items-center
        justify-center
        p-6
      "
    >
      <div
        className="
          absolute
          top-[-120px]
          left-[-120px]
          w-[300px]
          h-[300px]
          bg-white/10
          blur-3xl
          rounded-full
        "
      />

      <div
        className="
          absolute
          bottom-[-120px]
          right-[-120px]
          w-[300px]
          h-[300px]
          bg-zinc-700/20
          blur-3xl
          rounded-full
        "
      />

      <Card
        className="
          relative
          z-10
          w-full
          max-w-md
          border
          border-zinc-800
          bg-zinc-900/80
          backdrop-blur-xl
          shadow-2xl
          rounded-3xl
        "
      >
        <CardContent className="p-8">

          <div
            className="
              flex
              flex-col
              items-center
              mb-8
            "
          >
            <div
              className="
                w-16
                h-16
                rounded-2xl
                bg-white
                flex
                items-center
                justify-center
                mb-4
              "
            >
              <ShieldCheck
                className="
                  text-black
                  w-8
                  h-8
                "
              />
            </div>

            <h1
              className="
                text-3xl
                font-bold
                text-white
              "
            >
              Welcome Back
            </h1>

            <p
              className="
                text-zinc-400
                mt-2
                text-center
              "
            >
              Login to manage your organization goals,
              teams and performance.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <Label className="text-zinc-300">
                Email Address
              </Label>

              <Input
                type="email"
                name="email"
                placeholder="john@company.com"
                value={formData.email}
                onChange={handleChange}
                className="
                  mt-2
                  h-12
                  bg-zinc-800/80
                  border-zinc-700
                  text-white
                "
              />
            </div>

            <div>
              <Label className="text-zinc-300">
                Password
              </Label>

              <div className="relative mt-2">
                <Input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="
                    h-12
                    pr-12
                    bg-zinc-800/80
                    border-zinc-700
                    text-white
                  "
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="
                    absolute
                    right-3
                    top-1/2
                    -translate-y-1/2
                    text-zinc-400
                  "
                >
                  {showPassword
                    ? <EyeOff size={20} />
                    : <Eye size={20} />
                  }
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="
                w-full
                h-12
                rounded-xl
                bg-white
                text-black
                font-semibold
              "
            >
              {loading
                ? "Logging in..."
                : "Login"}
            </Button>
          </form>

          <div
            className="
              mt-6
              text-center
              text-sm
              text-zinc-400
            "
          >
            Don't have an account?

            <Link
              href="/sign-up"
              className="
                text-white
                ml-1
                hover:underline
              "
            >
              Sign Up
            </Link>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}