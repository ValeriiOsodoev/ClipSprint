"use client";

import { signOut } from "next-auth/react";
import { Session } from "next-auth";
import Image from "next/image";

interface UserMenuProps {
  session: Session;
  signOutText?: string;
}

export default function UserMenu({ session, signOutText = "Sign out" }: UserMenuProps) {
  const user = session.user;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        {user.image && (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="rounded-full"
          />
        )}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
          {user.name}
        </span>
      </div>
      <button
        onClick={() => signOut()}
        className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
      >
        {signOutText}
      </button>
    </div>
  );
}
