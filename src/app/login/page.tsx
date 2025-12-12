/**
 * AUTHENTICATION PAGE (Multi-View)
 * 
 * Purpose: Provides a unified authentication interface with three distinct flows:
 * 1. Login - for existing activated accounts
 * 2. Activate - for customers with IDs who need to claim their account
 * 3. Register - for brand new users
 * 
 * Architecture Role:
 * - UI Layer: Renders authentication forms based on selected view
 * - Form Handling: Manages form state and submission to server actions
 * - Auto-Login: Automatically logs users in after successful activation/registration
 * 
 * Used By: Unauthenticated users, middleware redirects here for protected routes
 */

"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { checkCustomerId, activateAccount, registerNewUser } from "@/app/actions/auth-actions"; // Adjust import if needed

export default function LoginPage() {
    const [view, setView] = useState<"login" | "activate" | "register">("login");
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // Login State
    const [loginEmail, setLoginEmail] = useState("");
    const [loginPassword, setLoginPassword] = useState("");

    // Activate State
    const [activateStep, setActivateStep] = useState<1 | 2>(1);
    const [activateId, setActivateId] = useState("");
    const [activateEmail, setActivateEmail] = useState("");
    const [activatePassword, setActivatePassword] = useState("");

    // Register State
    const [regEmail, setRegEmail] = useState("");
    const [regPassword, setRegPassword] = useState("");

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const res = await signIn("credentials", {
            email: loginEmail,
            password: loginPassword,
            redirect: false,
        });

        if (res?.error) {
            setError("Invalid email or password.");
        } else {
            router.push("/");
            router.refresh();
        }
    };

    const handleCheckId = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        const res = await checkCustomerId(activateId);
        if (res.success) {
            if (res.claimed) {
                setError(res.message);
            } else {
                setActivateStep(2);
            }
        } else {
            setError(res.message || "ID not found.");
        }
    };

    const handleActivate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData();
        formData.append("customerId", activateId);
        formData.append("email", activateEmail);
        formData.append("password", activatePassword);

        const res = await activateAccount(null, formData);
        if (res?.success) {
            // Auto login
            await signIn("credentials", {
                email: activateEmail,
                password: activatePassword,
                callbackUrl: "/",
            });
        } else {
            setError(res?.error || "Activation failed.");
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const formData = new FormData();
        formData.append("email", regEmail);
        formData.append("password", regPassword);

        const res = await registerNewUser(null, formData);
        if (res?.success) {
            // Auto login
            await signIn("credentials", {
                email: regEmail,
                password: regPassword,
                callbackUrl: "/",
            });
        } else {
            setError(res?.error || "Registration failed.");
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold">
                        {view === "login" && "Sign In"}
                        {view === "activate" && "Activate Account"}
                        {view === "register" && "Create Account"}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {view === "login" && "Enter your email and password to access your account"}
                        {view === "activate" && "Enter your Customer ID to claim your account"}
                        {view === "register" && "Enter your details to create a new account"}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {error && (
                        <div className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700">
                            {error}
                        </div>
                    )}

                    {/* LOGIN VIEW */}
                    {view === "login" && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="m@example.com"
                                    required
                                    value={loginEmail}
                                    onChange={(e) => setLoginEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    value={loginPassword}
                                    onChange={(e) => setLoginPassword(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full rounded-full">
                                Sign In
                            </Button>
                        </form>
                    )}

                    {/* ACTIVATE VIEW */}
                    {view === "activate" && (
                        <div className="space-y-4">
                            {activateStep === 1 ? (
                                <form onSubmit={handleCheckId} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="customerId">Customer ID</Label>
                                        <Input
                                            id="customerId"
                                            placeholder="Paste your ID here"
                                            required
                                            value={activateId}
                                            onChange={(e) => setActivateId(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full rounded-full">
                                        Verify ID
                                    </Button>
                                </form>
                            ) : (
                                <form onSubmit={handleActivate} className="space-y-4">
                                    <div className="space-y-2">
                                        <p className="text-sm text-green-600 mb-2">ID Verified! Set your login details.</p>
                                        <Label htmlFor="actEmail">Email</Label>
                                        <Input
                                            id="actEmail"
                                            type="email"
                                            required
                                            value={activateEmail}
                                            onChange={(e) => setActivateEmail(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="actPassword">New Password</Label>
                                        <Input
                                            id="actPassword"
                                            type="password"
                                            required
                                            value={activatePassword}
                                            onChange={(e) => setActivatePassword(e.target.value)}
                                        />
                                    </div>
                                    <Button type="submit" className="w-full rounded-full">
                                        Activate & Login
                                    </Button>
                                </form>
                            )}
                        </div>
                    )}

                    {/* REGISTER VIEW */}
                    {view === "register" && (
                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="regEmail">Email</Label>
                                <Input
                                    id="regEmail"
                                    type="email"
                                    required
                                    value={regEmail}
                                    onChange={(e) => setRegEmail(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="regPassword">Password</Label>
                                <Input
                                    id="regPassword"
                                    type="password"
                                    required
                                    value={regPassword}
                                    onChange={(e) => setRegPassword(e.target.value)}
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Register
                            </Button>
                        </form>
                    )}
                </CardContent>
                <CardFooter className="flex flex-col space-y-2 text-center text-sm">
                    {view === "login" && (
                        <>
                            <button
                                type="button"
                                onClick={() => setView("activate")}
                                className="text-blue-600 hover:underline"
                            >
                                Activate with Customer ID
                            </button>
                            <button
                                type="button"
                                onClick={() => setView("register")}
                                className="text-gray-500 hover:underline"
                            >
                                Create a new account
                            </button>
                        </>
                    )}
                    {(view === "activate" || view === "register") && (
                        <button
                            type="button"
                            onClick={() => {
                                setView("login");
                                setActivateStep(1);
                                setError(null);
                            }}
                            className="text-blue-600 hover:underline"
                        >
                            Back to Sign In
                        </button>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
