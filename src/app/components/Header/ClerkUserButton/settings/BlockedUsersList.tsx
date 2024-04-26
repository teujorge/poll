"use client";

import styles from "@/styles/clerk.module.css";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useApp } from "@/app/(with-auth)/app";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { unblockUser } from "@/app/(with-auth)/users/actions";
import { ProfileImage } from "@/app/components/ProfileImage";

export function BlockedUsersList() {
  const initedRef = useRef(false);
  const animatedDivRef = useRef<HTMLDivElement>(null);

  const { blockedUsers, setBlockedUsers } = useApp();

  const [isViewing, setIsViewing] = useState(false);

  useEffect(() => {
    if (!initedRef.current) return;

    console.log("here yo!");

    const div = animatedDivRef.current;
    if (!div) return;
    if (!styles.hiding) return;
    if (!styles.viewing) return;

    if (isViewing) {
      div.classList.remove(styles.hiding);
      div.classList.add(styles.viewing);
    } else {
      div.classList.remove(styles.viewing);
      div.classList.add(styles.hiding);
    }
  }, [isViewing]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2 text-sm">
        You can block users to prevent them from interacting with you.
      </div>

      <Button
        variant="ghost"
        className={cn(
          "w-fit text-primary transition-all duration-300 hovact:bg-accent/30 hovact:text-primary",
          isViewing && "pointer-events-none h-0 py-0 opacity-0",
        )}
        onClick={() => {
          initedRef.current = true;
          setIsViewing(true);
        }}
      >
        View
      </Button>

      <div
        ref={animatedDivRef}
        className={cn(
          "flex w-full flex-col gap-2 transition-all duration-300",
          !initedRef.current && "hidden",
          styles.animatedDiv,
        )}
      >
        <div className="h-full max-h-[50dvh] w-full overflow-y-auto rounded-lg border border-accent p-4 transition-all duration-300">
          {blockedUsers.length === 0 ? (
            <p className="text-xs text-accent-foreground">
              You haven&apos;t blocked anyone yet
            </p>
          ) : (
            blockedUsers.map((blockedUser) => (
              <div
                key={`blocked-user-${blockedUser.id}`}
                className="flex flex-row items-center gap-2"
              >
                <div className="flex flex-row items-center justify-between gap-2">
                  <div className="flex flex-row items-center gap-2">
                    <ProfileImage
                      src={blockedUser.imageUrl}
                      username={blockedUser.username}
                      size={24}
                    />
                    <p>{blockedUser.username}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={async () => {
                      setBlockedUsers((prev) =>
                        prev.filter((u) => u !== blockedUser),
                      );

                      try {
                        await unblockUser(blockedUser.id);
                      } catch (error) {
                        toast.error("Failed to unblock user");
                        setBlockedUsers((prev) => [...prev, blockedUser]);
                      }
                    }}
                  >
                    Unblock
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>

        <Button
          variant="ghost"
          className={cn(
            "ml-auto w-fit text-primary transition-all duration-300 hovact:bg-accent/30 hovact:text-primary",
            !isViewing && "pointer-events-none",
          )}
          onClick={() => setIsViewing(false)}
        >
          Hide
        </Button>
      </div>
    </div>
  );
}