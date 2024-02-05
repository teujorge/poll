/**
 * v0 by Vercel.
 * @see https://v0.dev/t/VtMN9nzQx4F
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */
import { db } from "@/database/db";
import { revalidateTag } from "next/cache";
import Link from "next/link";
import { SignedIn, auth } from "@clerk/nextjs";
import { PollCardVoting } from "@/app/components/PollCard/PollCardVoting";
import Image from "next/image";

export async function PollCardContent({ pollId }: { pollId: string }) {
  // // delay 5 seconds to simulate slow response
  // await new Promise((resolve) => setTimeout(resolve, 5000));

  const poll = await db.poll.findUnique({
    where: { id: pollId },
    include: { votes: true, options: true, author: true },
  });

  console.log("POLL CONTENT LOADED", pollId);

  if (poll === null) return null;

  async function deletePoll(formData: FormData) {
    "use server";

    if (poll === null) return;

    const { userId } = auth();

    if (!userId || userId !== poll.author.id) {
      throw new Error("You are not authorized to delete this poll");
    }

    const id = (formData.get("id") ?? "") as string;

    if (id === "") return;

    // parallel delete all votes and options
    await Promise.all([
      db.vote.deleteMany({ where: { pollId: id } }),
      db.option.deleteMany({ where: { pollId: id } }),
    ]);

    // safely delete poll without relation errors
    await db.poll.delete({ where: { id: id } });

    revalidateTag("/");
  }

  return (
    <div className="w-full rounded-lg border border-neutral-800 bg-neutral-950 p-6 shadow-md">
      <Link href={`/polls/${poll.id}`}>
        <h2 className="text-2xl font-bold">{poll.title}</h2>
      </Link>

      <p className="mt-2 text-sm text-neutral-200">
        By{" "}
        <Link href={`/users/${poll.authorId}`}>
          {poll.author.imageUrl && (
            <Image
              src={poll.author.imageUrl}
              alt={poll.author.username ?? "author's avatar"}
              width={24}
              height={24}
              className="rounded-full"
            />
          )}{" "}
          {poll.author.username}
        </Link>{" "}
        on{" "}
        {new Date(poll.createdAt).toLocaleDateString(undefined, {
          year: "2-digit",
          month: "short",
          day: "numeric",
        })}
      </p>

      <PollCardVoting {...poll} />

      {/* temporary for dev & debugging */}
      <form
        key={poll.id}
        action={deletePoll}
        className="flex flex-row gap-2 p-2"
      >
        <input type="hidden" name="id" value={poll.id} />
        <SignedIn>
          <button type="submit" className="text-red-500">
            -delete-
          </button>
        </SignedIn>
      </form>
    </div>
  );
}