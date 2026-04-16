import { AuthGuard } from "@/components/AuthGuard";

export default function Home() {
  return (
    <AuthGuard>
      <main className="flex flex-col items-center justify-between p-24">
        <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
          <h1 className="text-4xl font-bold mb-8">Loopa Feed</h1>
          <p>Phase 2 will implement the feed.</p>
        </div>
      </main>
    </AuthGuard>
  );
}
