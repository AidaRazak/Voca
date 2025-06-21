"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <h1>Login</h1>
      <form onSubmit={handleLogin} className="auth-form">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        {error && <p className="error">{error}</p>}
      </form>
      <p>Don't have an account? <a href="/register">Register</a></p>
      <style jsx>{`
        .auth-page { min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .auth-form { display: flex; flex-direction: column; gap: 1rem; width: 100%; max-width: 350px; }
        .auth-form input { padding: 0.8rem 1rem; border-radius: 10px; border: none; }
        .auth-form button { padding: 0.8rem 1rem; border-radius: 10px; border: none; background: #4ade80; color: #222; font-weight: bold; cursor: pointer; }
        .auth-form button:disabled { opacity: 0.7; }
        .error { color: #f87171; margin-top: 0.5rem; }
      `}</style>
    </div>
  );
} 