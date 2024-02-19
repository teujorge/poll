import { FilterBar } from "./index/components/FilterBar";
import { InfinitePolls } from "./components/InfinitePolls/InfinitePolls";
import { Suspense } from "react";
import { Loader } from "./components/Loader";

export default function HomePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const search = searchParams?.search?.toString() ?? "";
  const category = searchParams?.category?.toString() ?? "";

  return (
    <main className="flex flex-col items-center gap-2">
      <div className="sticky top-10 z-20 flex w-full flex-row items-end justify-center gap-2 bg-gradient-to-b from-black from-80% pt-6 sm:items-center">
        <h1 className="text-4xl font-bold">Polls</h1>
        <div className="flex-grow" />
        <FilterBar />
      </div>

      <div className="h-4" />
      <Suspense fallback={<Loader />}>
        <InfinitePolls
          search={search}
          category={category}
          idPrefix="home-page-polls"
        />
      </Suspense>
    </main>
  );
}
