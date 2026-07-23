
import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const RAZORPAY_PLANS: Record<string, { planId: string; amount: number; name: string }> = {
  PRO: {
    planId: process.env.RAZORPAY_PRO_PLAN_ID ?? "",
    amount: 99900,   // ₹999 in paise
    name:   "OKR Desk Pro",
  },
  BUSINESS: {
    planId: process.env.RAZORPAY_BUSINESS_PLAN_ID ?? "",
    amount: 299900,  // ₹2999 in paise
    name:   "OKR Desk Business",
  },
};
