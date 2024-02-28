import { auth } from "@clerk/nextjs";
import { ActiveFollowedCardAction } from "./ActiveFollowedCardActions";
import type { User } from "@prisma/client";
import { ProfileImage } from "@/app/components/ProfileImage";

export async function ActiveFollowedCard({
  userId,
  followed,
}: {
  userId: string;
  followed: User;
}) {
  const { userId: myId } = auth();

  return (
    <div className="flex flex-row items-center justify-center gap-1">
      <ProfileImage
        src={followed.imageUrl ?? "public/profilleIcon.jpg"}
        alt={""}
        width={20}
        height={20}
      ></ProfileImage>
      <p className="flex gap-1">
        {followed.username}
        {myId === userId && <ActiveFollowedCardAction followed={followed} />}
      </p>
    </div>
  );
}
