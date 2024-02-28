import { db } from "@/database/db";
import { ActiveFollowerCard } from "./user-followers/ActiveFollowerCard";

export async function USerFollowersList({ userId }: { userId: string }) {
  console.log("followers -> userId", userId);

  const followers = await db.follow.findMany({
    where: {
      followedId: userId,
      accepted: true,
    },
    select: {
      follower: true,
    },
  });

  console.log("followers -> followers", followers.length);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <h1 className="font-bold">Followers</h1>
      <div className="w-full border"></div>

      <div>
        {followers.map((f) => (
          <ActiveFollowerCard
            key={f.follower.id}
            userId={userId}
            follower={f.follower}
          />
        ))}
      </div>
    </div>
  );
}
