import Script from "next/script";
import { createElement } from "react";

export function PricingTableEmbed({ userId }: { userId: string }) {
  return (
    <div className="h-full w-full rounded-lg">
      <Script src="https://js.stripe.com/v3/pricing-table.js" />
      {createElement("stripe-pricing-table", {
        "pricing-table-id": process.env.NEXT_PUBLIC_STRIPE_PRICING_TABLE_ID,
        "publishable-key": process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
        "client-reference-id": userId,
      })}
    </div>
  );
}
