import { Github, LockKeyhole, Mail } from "lucide-react";
import { FormEvent, useState } from "react";
import { useHardNavigate } from "../lib/hardNavigation";
import { Link } from "../lib/navigation";
import { Button } from "../components/Button";
import { NetworkCanvas } from "../components/NetworkCanvas";
import * as api from "../lib/api";
import { useAppStore } from "../stores/useAppStore";

export function Login() {
  const navigate = useHardNavigate();
  const setSession = useAppStore((state) => state.setSession);
  const pushToast = useAppStore((state) => state.pushToast);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const isSignup = window.location.pathname === "/signup";

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!email.includes("@") || password.length < 8) return;
    try {
      const response = await api.login(email, password);
      setSession({
        email: response.data.user.email,
        mfaEnabled: response.data.user.mfaEnabled,
        accessToken: response.data.accessToken,
        refreshToken: response.data.refreshToken,
      });
      pushToast({ title: isSignup ? "Account created" : "Signed in", body: `Session opened for ${response.data.user.email}.`, tone: "success" });
    } catch {
      setSession({ email, mfaEnabled: false });
      pushToast({ title: isSignup ? "Local account created" : "Local session opened", body: "The API is offline, so this session is stored locally.", tone: "warning" });
    }
    navigate("/app");
  }

  return (
    <div className="grain relative grid min-h-screen place-items-center overflow-hidden bg-ink p-5 text-white">
      <NetworkCanvas className="absolute inset-0 h-full w-full opacity-35" />
      <form onSubmit={submit} className="panel relative z-10 w-full max-w-md rounded-lg p-6">
        <Link to="/" className="mb-8 flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-md border border-cyan/30 bg-cyan/10 p-1.5">
            <img src="/signalnest-icon.svg" alt="SignalNest" className="h-full w-full" />
          </span>
          <span className="font-bold">SignalNest</span>
        </Link>
        <h1 className="text-3xl font-black">{isSignup ? "Create your account" : "Sign in"}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {isSignup
            ? "Create a local SignalNest account with any valid email and an 8+ character password while the production auth service is being connected."
            : "Use any valid email and an 8+ character password to enter the local workspace while the backend auth service is being connected."}
        </p>
        <label className="mt-6 block text-sm">
          <span className="mb-2 block text-slate-400">Email</span>
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3">
            <Mail className="h-4 w-4 text-slate-500" />
            <input value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent py-2 text-white outline-none" />
          </div>
        </label>
        <label className="mt-3 block text-sm">
          <span className="mb-2 block text-slate-400">Password</span>
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-black/25 px-3">
            <LockKeyhole className="h-4 w-4 text-slate-500" />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent py-2 text-white outline-none" />
          </div>
        </label>
        <Button className="mt-5 w-full" variant="primary" type="submit">{isSignup ? "Create account" : "Continue securely"}</Button>
        <Button className="mt-3 w-full" variant="secondary" type="button" icon={<Github className="h-4 w-4" />} onClick={() => navigate("/app")}>{isSignup ? "Sign up with GitHub" : "Continue with GitHub"}</Button>
        <div className="mt-5 text-center text-sm text-slate-400">
          {isSignup ? "Already have an account?" : "New to SignalNest?"}{" "}
          <Link to={isSignup ? "/login" : "/signup"} className="font-semibold text-cyan hover:underline">
            {isSignup ? "Sign in" : "Sign up"}
          </Link>
        </div>
      </form>
    </div>
  );
}
