import { Suspense } from "react";
import { Logo } from "@/components/onboarding/Logo";
import { LoginForm } from "./LoginForm";

export default function LoginPage() {

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background-light dark:bg-background-dark p-4">
      <div className="fixed inset-0 opacity-5 pointer-events-none z-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary blur-3xl -mr-64 -mt-64" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] rounded-full bg-primary blur-3xl -ml-64 -mb-64" />
      </div>

      <div className="relative z-10 w-full max-w-[600px] flex flex-col gap-6">
        <div className="flex justify-center mb-2">
          <Logo />
        </div>

        <Suspense fallback={<div className="text-center">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
