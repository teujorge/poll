import { db } from "@/server/prisma";
import { NextResponse } from "next/server";
import {
  // Environment,
  NotificationType,
  // AppStoreServerAPI,
  // decodeRenewalInfo,
  // decodeTransaction,
  decodeNotificationPayload,
  isDecodedNotificationDataPayload,
  isDecodedNotificationSummaryPayload,
} from "app-store-server-api";
import type { SubTier } from "@prisma/client";
import type { NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // const KEY = Buffer.from(
    //   process.env.IAP_SUBSCRIPTION_KEY!,
    //   "base64",
    // ).toString("ascii");
    // const KEY_ID = process.env.IAP_KEY_ID!;
    // const ISSUER_ID = process.env.IAP_ISSUER_ID!;
    const APP_BUNDLE_ID = process.env.APNS_BUNDLE_ID!;

    // const api = new AppStoreServerAPI(
    //   KEY,
    //   KEY_ID,
    //   ISSUER_ID,
    //   APP_BUNDLE_ID,
    //   Environment.Production,
    // );

    // Get the body of the request, which should contain the signedPayload from Apple
    const body = (await req.json()) as { signedPayload: string };
    const { signedPayload } = body;

    // Decode the signed payload from Apple
    const payload = await decodeNotificationPayload(signedPayload);

    console.log("Received Notification Payload:", payload);

    if (payload.data && payload.data.bundleId !== APP_BUNDLE_ID) {
      console.error(
        `Received notification for incorrect bundle ID: ${payload.data.bundleId}`,
      );
      return NextResponse.json(
        { error: "Incorrect bundle ID" },
        { status: 400 },
      );
    }

    // Handle the notification based on its type
    if (isDecodedNotificationDataPayload(payload)) {
      console.log("Handling notification as DecodedNotificationDataPayload");
      switch (payload.notificationType) {
        case NotificationType.DidRenew: // Handle a successful renewal
        case NotificationType.Subscribed: // Handle a new subscription
        case NotificationType.OfferRedeemed: // Handle the redemption of a special offer
          await activateSubscription("userId", "PRO");
          break;

        case NotificationType.DidFailToRenew: // Handle a failed renewal attempt
        case NotificationType.Expired: // Handle subscription expiration
        case NotificationType.Revoke: // Handle a revocation of the subscription
        case NotificationType.Refund: // Handle a user getting a refund
          await deactivateSubscription("userId");
          break;

        case NotificationType.ConsumptionRequest: // Handle consumption of a consumable purchase
        case NotificationType.DidChangeRenewalPref: // Handle a change in the user's subscription renewal settings
        case NotificationType.DidChangeRenewalStatus: // Handle a change in the renewal, i.e turning off auto-renewal
        case NotificationType.GracePeriodExpired: // Handle the expiration of a grace period
        case NotificationType.PriceIncrease: // Handle notification of a price increase
        case NotificationType.RefundDeclined: // Handle a declined refund
        case NotificationType.RenewalExtended: // Handle the extension of a renewal period
        case NotificationType.RenewalExtension: // Handle an administrative renewal extension
        case NotificationType.RefundReversed: // Handle a reversal of a refund
          console.log(
            `Unhandled notification type: ${payload.notificationType}`,
          );
          break;
      }
    }
    // Handle the notification summary
    else if (isDecodedNotificationSummaryPayload(payload)) {
      console.log("Handling notification as DecodedNotificationSummaryPayload");
    }
    // Unknown
    else {
      console.log("Received unknown payload type");
      return NextResponse.json(
        { error: "Unknown payload type" },
        { status: 400 },
      );
    }

    // // Example for handling subscription statuses
    // // You would need the originalTransactionId from your application context or stored data
    // const originalTransactionId = "transaction_id_here";
    // const subscriptionResponse = await api.getSubscriptionStatuses(
    //   originalTransactionId,
    // );

    // if (subscriptionResponse.data && subscriptionResponse.data.length > 0) {
    //   const item = subscriptionResponse?.data[0]?.lastTransactions.find(
    //     (item) => item.originalTransactionId === originalTransactionId,
    //   );

    //   if (item) {
    //     const transactionInfo = await decodeTransaction(
    //       item.signedTransactionInfo,
    //     );
    //     const renewalInfo = await decodeRenewalInfo(item.signedRenewalInfo);

    //     console.log("Transaction Info:", transactionInfo);
    //     console.log("Renewal Info:", renewalInfo);
    //   }
    // }

    // Successful handling
    return NextResponse.json(
      { message: "Notification processed successfully" },
      { status: 200 },
    );
  } catch (e) {
    // Proper error logging
    console.error("Error processing notification:", e);

    // If e is an Error instance, use e.message to get the error message, otherwise, convert it to string
    const errorMessage = e instanceof Error ? e.message : String(e);

    // Return a JSON response indicating failure
    return NextResponse.json(
      { error: `Notification was not processed successfully: ${errorMessage}` },
      { status: 500 },
    );
  }
}

// Function to activate a subscription
async function activateSubscription(userId: string, tier: SubTier) {
  console.log("Activating Subscription:", userId, tier);
  const user = await db.user.update({
    where: { id: userId },
    data: { tier: tier, ads: false },
  });
  console.log("Subscription Activated:", user.username, user.tier);
  return user;
}

// Function to deactivate a subscription
async function deactivateSubscription(userId: string) {
  console.log("Deactivating Subscription:", userId);
  const user = await db.user.update({
    where: { id: userId },
    data: { tier: "FREE", ads: true, private: false },
  });
  console.log("Subscription Deactivated:", user.username, user.tier);
  return user;
}