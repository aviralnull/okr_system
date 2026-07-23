import { transporter } from "@/lib/mail";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await transporter.verify();

    return NextResponse.json({
      success: true,
      message: "SMTP Connected",
    });
  } catch (err) {
    console.error(err);

    return NextResponse.json({
      success: false,
      error: err,
    });
  }
}