"use client";

import { useState } from "react";
import axios from "axios";
import { useRouter }
from "next/navigation";

import { Button }
from "@/components/ui/button";

import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Input }
from "@/components/ui/input";

import { Label }
from "@/components/ui/label";

export default function SignUpPage() {

  const router = useRouter();

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] =
    useState({
      name: "",
      email: "",
      password: "",

      organizationName: "",
      industry: "",
      website: "",
      size: "",
    });

  const handleChange = (
    e:
      React.ChangeEvent<
        HTMLInputElement
      >
  ) => {

    setFormData({
      ...formData,
      [e.target.name]:
        e.target.value,
    });
  };

 const handleSubmit =
  async (
    e: React.FormEvent
  ) => {

    e.preventDefault();

    try {

      setLoading(true);

      const response =
        await axios.post(
          "/api/sign-up",
          formData
        );

      const data =
        response.data;

      if (!data.success) {

        alert(data.message);

        return;
      }

      alert(
        "Organization Created Successfully"
      );
router.push(
  `/verify-code?email=${formData.email}`
);

    } catch (error: any) {

      console.log(error);

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
        flex
        items-center
        justify-center
        p-6
      "
    >

      <Card
        className="
          w-full
          max-w-3xl
          bg-zinc-900
          border-zinc-800
        "
      >

        <CardContent
          className="p-10"
        >

          <div className="mb-8">

            <h1
              className="
                text-4xl
                font-bold
                text-white
              "
            >
              Create Workspace
            </h1>

            <p
              className="
                text-zinc-400
                mt-3
              "
            >
              Setup your company
              workspace and start
              managing OKRs,
              employees, teams and
              analytics.
            </p>

          </div>

          <form
            onSubmit={
              handleSubmit
            }
            className="
              space-y-8
            "
          >

            {/* ACCOUNT INFO */}

            <div className="space-y-5">

              <h2
                className="
                  text-xl
                  font-semibold
                  text-white
                "
              >
                Account Information
              </h2>

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-5
                "
              >

                <div>

                  <Label
                    className="
                      text-zinc-300
                    "
                  >
                    Full Name
                  </Label>

                  <Input
                    name="name"
                    placeholder="John Doe"
                    value={
                      formData.name
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      mt-2
                      bg-zinc-800
                      border-zinc-700
                      text-white
                    "
                  />

                </div>

                <div>

                  <Label
                    className="
                      text-zinc-300
                    "
                  >
                    Work Email
                  </Label>

                  <Input
                    type="email"
                    name="email"
                    placeholder="john@company.com"
                    value={
                      formData.email
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      mt-2
                      bg-zinc-800
                      border-zinc-700
                      text-white
                    "
                  />

                </div>

              </div>

              <div>

                <Label
                  className="
                    text-zinc-300
                  "
                >
                  Password
                </Label>

                <Input
                  type="password"
                  name="password"
                  placeholder="********"
                  value={
                    formData.password
                  }
                  onChange={
                    handleChange
                  }
                  className="
                    mt-2
                    bg-zinc-800
                    border-zinc-700
                    text-white
                  "
                />

              </div>

            </div>

            {/* ORGANIZATION INFO */}

            <div
              className="
                space-y-5
                border-t
                border-zinc-800
                pt-8
              "
            >

              <h2
                className="
                  text-xl
                  font-semibold
                  text-white
                "
              >
                Organization Information
              </h2>

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-5
                "
              >

                <div>

                  <Label
                    className="
                      text-zinc-300
                    "
                  >
                    Organization Name
                  </Label>

                  <Input
                    name="organizationName"
                    placeholder="Acme Inc."
                    value={
                      formData.organizationName
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      mt-2
                      bg-zinc-800
                      border-zinc-700
                      text-white
                    "
                  />

                </div>

                <div>

                  <Label
                    className="
                      text-zinc-300
                    "
                  >
                    Industry
                  </Label>

                  <Input
                    name="industry"
                    placeholder="Technology"
                    value={
                      formData.industry
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      mt-2
                      bg-zinc-800
                      border-zinc-700
                      text-white
                    "
                  />

                </div>

              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-5
                "
              >

                <div>

                  <Label
                    className="
                      text-zinc-300
                    "
                  >
                    Company Size
                  </Label>

                  <select
                    name="size"
                    value={
                      formData.size
                    }
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        size:
                          e.target.value,
                      })
                    }
                    className="
                      mt-2
                      w-full
                      rounded-md
                      bg-zinc-800
                      border
                      border-zinc-700
                      px-3
                      py-2
                      text-white
                    "
                  >

                    <option value="">
                      Select Company Size
                    </option>

                    <option value="10">
                      1-10 Employees
                    </option>

                    <option value="50">
                      11-50 Employees
                    </option>

                    <option value="200">
                      51-200 Employees
                    </option>

                    <option value="500">
                      201-500 Employees
                    </option>

                    <option value="1000">
                      500+ Employees
                    </option>

                  </select>

                </div>

                <div>

                  <Label
                    className="
                      text-zinc-300
                    "
                  >
                    Website
                  </Label>

                  <Input
                    name="website"
                    placeholder="https://company.com"
                    value={
                      formData.website
                    }
                    onChange={
                      handleChange
                    }
                    className="
                      mt-2
                      bg-zinc-800
                      border-zinc-700
                      text-white
                    "
                  />

                </div>

              </div>

            </div>

            <Button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-white
                text-black
                hover:bg-zinc-200
                h-11
              "
            >

              {
                loading
                  ? "Creating Workspace..."
                  : "Create Workspace"
              }

            </Button>

          </form>

        </CardContent>

      </Card>

    </div>
  );
}