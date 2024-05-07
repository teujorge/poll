import GlobalLoading from "../loading";
import { cn } from "@/lib/utils";
import { App } from "./app";
import { dark } from "@clerk/themes";
import { Header } from "../components/Header/Header";
import { Toaster } from "sonner";
import { Suspense } from "react";
import { ClerkProvider } from "@clerk/nextjs";
import { clerkElements } from "@/styles/clerk";

export default function RootLayout({
  children,
  crudPoll,
}: {
  children: React.ReactNode;
  crudPoll: React.ReactNode;
}) {
  return (
    <Suspense fallback={<GlobalLoading />}>
      <Toaster richColors />
      <ClerkProvider
        appearance={{
          baseTheme: dark,
          layout: {
            termsPageUrl: "/tos",
            privacyPageUrl: "/privacy",
            logoPlacement: "none",
            socialButtonsVariant: "blockButton",
            socialButtonsPlacement: "top",
          },
          variables: {
            colorPrimary: "#a855f7", // purple
            colorDanger: "#cc3333", // red
            colorSuccess: "#22c55e", // green
            colorWarning: "#F59e0b", // amber

            colorNeutral: "#f0f0f0",
            colorBackground: "#0f0f0f",

            colorText: "#f1f1f1",
            colorTextOnPrimaryBackground: "#f1f1f1",
            colorTextSecondary: "#f1f1f1",

            colorInputText: "#f1f1f1",
            colorInputBackground: "#191919",
          },
          elements: clerkElements,
        }}
      >
        <App>
          <div
            className={cn(
              "left-0 right-0 z-40 h-fit w-full",
              "fixed bottom-0 border-t border-accent bg-black",
              "sm:sticky sm:top-0 sm:border-0 sm:bg-transparent sm:bg-gradient-to-b sm:from-background sm:from-60%",
            )}
          >
            <Header />
          </div>
          {children}
          {crudPoll}
          <div className="block h-[60px] sm:hidden" />
        </App>
      </ClerkProvider>
    </Suspense>
  );
}
