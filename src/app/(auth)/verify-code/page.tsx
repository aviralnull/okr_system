// "use client";

// import axios from "axios";

// import { useState }
// from "react";

// import {
//   useRouter,
//   useSearchParams,
// } from "next/navigation";

// import {
//   Card,
//   CardContent,
// } from "@/components/ui/card";

// import { Input }
// from "@/components/ui/input";

// import { Label }
// from "@/components/ui/label";

// import { Button }
// from "@/components/ui/button";

// export default function VerifyCodePage() {

//   const router =
//     useRouter();

//   const searchParams =
//     useSearchParams();

//   const email =
//     searchParams.get("email");

//   const [loading, setLoading] =
//     useState(false);

//   const [code, setCode] =
//     useState("");

//   const handleSubmit =
//     async (
//       e: React.FormEvent
//     ) => {

//       e.preventDefault();

//       try {

//         setLoading(true);

//         const response =
//           await axios.post(
//             "/api/verify-code",
//             {
//               email,
//               code,
//             }
//           );

//         const data =
//           response.data;

//         if (!data.success) {

//           alert(
//             data.message
//           );

//           return;
//         }

//         alert(
//           "Email verified successfully"
//         );

//         router.push("/sign-in");

//       } catch (error: any) {

//         console.log(error);

//         alert(
//           error?.response?.data
//             ?.message ||
//           "Something went wrong"
//         );

//       } finally {

//         setLoading(false);
//       }
//     };

//   return (

//     <div
//       className="
//         min-h-screen
//         bg-black
//         flex
//         items-center
//         justify-center
//         p-6
//       "
//     >

//       <Card
//         className="
//           w-full
//           max-w-md
//           bg-zinc-900
//           border-zinc-800
//         "
//       >

//         <CardContent
//           className="p-8"
//         >

//           <div className="mb-8">

//             <h1
//               className="
//                 text-3xl
//                 font-bold
//                 text-white
//               "
//             >
//               Verify Email
//             </h1>

//             <p
//               className="
//                 text-zinc-400
//                 mt-2
//               "
//             >
//               Enter the verification
//               code sent to:
//             </p>

//             <p
//               className="
//                 text-white
//                 mt-1
//                 font-medium
//               "
//             >
//               {email}
//             </p>

//           </div>

//           <form
//             onSubmit={
//               handleSubmit
//             }
//             className="
//               space-y-5
//             "
//           >

//             <div>

//               <Label
//                 className="
//                   text-zinc-300
//                 "
//               >
//                 Verification Code
//               </Label>

//               <Input
//                 value={code}
//                 onChange={(e) =>
//                   setCode(
//                     e.target.value
//                   )
//                 }
//                 placeholder="123456"
//                 maxLength={6}
//                 className="
//                   mt-2
//                   bg-zinc-800
//                   border-zinc-700
//                   text-white
//                   text-center
//                   tracking-[10px]
//                   text-2xl
//                 "
//               />

//             </div>

//             <Button
//               type="submit"
//               disabled={loading}
//               className="
//                 w-full
//                 bg-white
//                 text-black
//                 hover:bg-zinc-200
//               "
//             >

//               {
//                 loading
//                   ? "Verifying..."
//                   : "Verify Email"
//               }

//             </Button>

//           </form>

//         </CardContent>

//       </Card>

//     </div>
//   );
// }




"use client";

import axios from "axios";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

function VerifyCodeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const email = searchParams.get("email");

  const [loading, setLoading] = useState(false);
  const [code, setCode] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await axios.post("/api/verify-code", {
        email,
        code,
      });

      const data = response.data;

      if (!data.success) {
        alert(data.message);
        return;
      }

      alert("Email verified successfully");
      router.push("/sign-in");
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
        flex
        items-center
        justify-center
        p-6
      "
    >
      <Card
        className="
          w-full
          max-w-md
          bg-zinc-900
          border-zinc-800
        "
      >
        <CardContent className="p-8">
          <div className="mb-8">
            <h1
              className="
                text-3xl
                font-bold
                text-white
              "
            >
              Verify Email
            </h1>

            <p
              className="
                text-zinc-400
                mt-2
              "
            >
              Enter the verification code sent to:
            </p>

            <p
              className="
                text-white
                mt-1
                font-medium
                break-all
              "
            >
              {email}
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <Label className="text-zinc-300">
                Verification Code
              </Label>

              <Input
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="123456"
                maxLength={6}
                className="
                  mt-2
                  bg-zinc-800
                  border-zinc-700
                  text-white
                  text-center
                  tracking-[10px]
                  text-2xl
                "
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="
                w-full
                bg-white
                text-black
                hover:bg-zinc-200
              "
            >
              {loading ? "Verifying..." : "Verify Email"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function VerifyCodePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <VerifyCodeContent />
    </Suspense>
  );
}