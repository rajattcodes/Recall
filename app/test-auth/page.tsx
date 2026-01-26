"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TestAuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: session, isPending } = authClient.useSession();

  const handleSignUp = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await authClient.signUp.email({
        email,
        password,
        name,
      });
      if (result.error) {
        setMessage(`Error: ${result.error.message}`);
      } else {
        setMessage("Sign up successful! Check your session below.");
        setEmail("");
        setPassword("");
        setName("");
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    setMessage("");
    try {
      const result = await authClient.signIn.email({
        email,
        password,
      });
      if (result.error) {
        setMessage(`Error: ${result.error.message}`);
      } else {
        setMessage("Sign in successful! Check your session below.");
        setEmail("");
        setPassword("");
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    setMessage("");
    try {
      await authClient.signOut();
      setMessage("Signed out successfully!");
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">Auth Test Page</h1>

      {/* Session Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Session Status</CardTitle>
          <CardDescription>Current authentication state</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <p>Loading session...</p>
          ) : session?.user ? (
            <div className="space-y-2">
              <p className="text-green-600 font-semibold">✅ Authenticated</p>
              <p><strong>User ID:</strong> {session.user.id}</p>
              <p><strong>Email:</strong> {session.user.email}</p>
              <p><strong>Name:</strong> {session.user.name || "Not set"}</p>
              <p><strong>Email Verified:</strong> {session.user.emailVerified ? "Yes" : "No"}</p>
            </div>
          ) : (
            <p className="text-gray-500">❌ Not authenticated</p>
          )}
        </CardContent>
      </Card>

      {/* Sign Up Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Create a new account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              type="text"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={handleSignUp} disabled={loading || !email || !password || !name}>
            {loading ? "Signing up..." : "Sign Up"}
          </Button>
        </CardContent>
      </Card>

      {/* Sign In Form */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <Input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />
          </div>
          <Button onClick={handleSignIn} disabled={loading || !email || !password}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>
        </CardContent>
      </Card>

      {/* Sign Out */}
      {session?.user && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Sign Out</CardTitle>
            <CardDescription>Sign out from your account</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleSignOut} disabled={loading} variant="destructive">
              {loading ? "Signing out..." : "Sign Out"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Message Display */}
      {message && (
        <Card className={message.includes("Error") ? "border-red-500" : "border-green-500"}>
          <CardContent className="pt-6">
            <p className={message.includes("Error") ? "text-red-600" : "text-green-600"}>
              {message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* API Endpoints Info */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>Better Auth endpoints available</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>POST /api/auth/sign-up</li>
            <li>POST /api/auth/sign-in</li>
            <li>POST /api/auth/sign-out</li>
            <li>GET /api/auth/session</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
