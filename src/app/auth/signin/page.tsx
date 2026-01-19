"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import SignInButton from "@/components/auth/SignInButton";

function SignInContent() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome to YouTube Script Kit
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Sign in to access all tools
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">
                {error === "OAuthAccountNotLinked"
                  ? "This email is already associated with another account."
                  : "An error occurred during sign in. Please try again."}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <SignInButton 
              text="Continue with Google" 
              className="w-full justify-center"
            />
          </div>

          <p className="mt-8 text-center text-xs text-gray-500 dark:text-gray-400">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
