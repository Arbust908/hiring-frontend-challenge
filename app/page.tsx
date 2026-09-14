import { RawResults } from "./raw-results";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black min-h-screen">
      <RawResults />
    </div>
  );
}
