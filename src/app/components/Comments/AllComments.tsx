import { db } from "@/database/db";
import { auth } from "@clerk/nextjs";
import { Loader } from "../Loader";
import { notFound } from "next/navigation";
import { CommentForm } from "./CommentForm";
import { CommentCard } from "./CommentCard";
import { NewCommentsProvider } from "./NewCommentsProvider";
import { InfiniteComments } from "@/app/components/InfiniteComments/InfiniteComments";

export async function AllComments({
  pollId,
  parentId,
}: {
  pollId: string;
  parentId: string | undefined;
}) {
  const { userId } = auth();

  if (parentId) {
    const parentComment = await db.comment.findUnique({
      where: { id: parentId },
      include: {
        author: true,
        likes: {
          where: {
            authorId: userId ?? undefined,
          },
        },
        parent: {
          select: {
            authorId: true,
          },
        },
        _count: {
          select: { likes: true, replies: true },
        },
      },
    });

    if (parentComment) {
      return (
        <NewCommentsProvider>
          <h2 className="pb-2 pt-16 text-2xl">Comment Thread</h2>
          <CommentCard comment={parentComment} isViewingReplies={true} />
        </NewCommentsProvider>
      );
    } else {
      return notFound();
    }
  }

  return (
    <NewCommentsProvider>
      <h2 className="pb-2 pt-16 text-2xl">Comments</h2>
      <InfiniteComments pollId={pollId} parentId={parentId} />
      <div className="sticky bottom-0 bg-gradient-to-t from-black from-80% ">
        <CommentForm
          pollId={pollId}
          parentId={parentId}
          label={undefined}
          placeholder="Write your comment here..."
        />
      </div>
    </NewCommentsProvider>
  );
}

export function AllCommentsFallback() {
  return (
    <>
      <p className="py-4 pt-16 text-2xl">Comments</p>

      <Loader />
      <div className="sticky bottom-0 bg-gradient-to-t from-black from-80% ">
        <form className="pointer-events-none flex w-full flex-col gap-2 p-4 opacity-50">
          <div className="flex flex-row items-end gap-2">
            <textarea
              required
              disabled
              name="comment"
              placeholder="Loading..."
              className="flex-grow"
            />
            <div className="flex w-20 items-center justify-center">
              <button className="ml-auto rounded-full px-3 py-1 text-green-500 hovact:bg-green-950">
                Submit
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
