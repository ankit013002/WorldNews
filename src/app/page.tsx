import World from "@/r3f/World";

export default async function Home() {
  return (
    <div className="min-h-screen min-w-screen flex flex-col justify-items-center items-center gap-y-5">
      <World />
    </div>
  );
}
