"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthShell } from "@/components/auth/AuthShell";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { RoleToggle, type AuthRole } from "@/components/auth/RoleToggle";
import { PasswordInput } from "@/components/auth/PasswordInput";
import { SocialButton } from "@/components/auth/SocialButton";

// One role-agnostic login screen (Figma: Customer Login 289:3541, identical to the
// vendor frame apart from the active toggle + subtitle). The toggle switches role;
// submit routes to that role's dashboard. UI only — no real auth until Phase 6.
// Layout: __top holds the fields; __foot holds the button + everything below it —
// on mobile the form fills the viewport and pins __foot to the bottom.
const SUBTITLE: Record<AuthRole, string> = {
  customer: "Your projects are waiting. Log in to continue connecting with skilled artisans.",
  vendor: "Your next job is here. Log in to manage your bookings and grow your business.",
};

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<AuthRole>("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    // Phase 6 replaces this with Clerk/Convex. For now: route to the placeholder.
    console.log("login submit", { role, email, password });
    router.push(role === "customer" ? "/customer" : "/vendor");
  }

  return (
    <AuthShell>
      <form className="hw-auth__form" onSubmit={handleSubmit}>
        <div className="hw-auth__top">
          <RoleToggle value={role} onChange={setRole} />

          <header className="hw-auth__intro">
            <h1 className="hw-heading-xl">Login</h1>
            <p className="hw-auth__subtitle">{SUBTITLE[role]}</p>
          </header>

          <div className="hw-field">
            <label htmlFor="login-email">Email</label>
            <Input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="hw-field">
            <label htmlFor="login-password">Password</label>
            <PasswordInput
              id="login-password"
              name="password"
              autoComplete="current-password"
              placeholder="Enter Your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <Link href="#" className="hw-link hw-auth__forgot">Forgot password ?</Link>
          </div>
        </div>

        <div className="hw-auth__foot">
          <Button type="submit" variant="primary" block>Login</Button>

          <div className="hw-divider">Or Login with</div>

          <div className="hw-social">
            <SocialButton provider="facebook" />
            <SocialButton provider="google" />
            <SocialButton provider="apple" />
          </div>

          <p className="hw-auth__signup">
            Don&apos;t have an account? <Link href="/signup" className="hw-link">Sign up</Link>
          </p>
        </div>
      </form>

      <p className="hw-auth__footer">© Handiwork 2025</p>
    </AuthShell>
  );
}
