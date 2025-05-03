"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import useSignup from "@/app/(public)/signup/hooks/useSignup";

export default function SignUp() {
  const {
    form,
    onSubmit,
    verificationStep,
    verifyCodeForm,
    onVerifySubmit,
    resendVerificationCode,
  } = useSignup();

  // Sign up form
  if (verificationStep === "signup") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 justify-center items-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-2 text-center pb-2">
            <h1 className="text-2xl font-bold text-blue-800">Safe Folder</h1>
            <p className="text-gray-500 text-sm">Create your secure account</p>
          </CardHeader>
          <CardContent className="pt-4">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Full Name"
                          className="h-12 px-4 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Email address"
                          className="h-12 px-4 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Password"
                          className="h-12 px-4 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="Confirm Password"
                          className="h-12 px-4 rounded-lg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Sign Up
                </Button>
              </form>
            </Form>
            <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Verification form
  if (verificationStep === "verification") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 justify-center items-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-2 text-center pb-2">
            <h1 className="text-2xl font-bold text-blue-800">Verify Account</h1>
            <p className="text-gray-500 text-sm">
              Please enter the verification code sent to your email
            </p>
          </CardHeader>
          <CardContent className="pt-4">
            <Form {...verifyCodeForm}>
              <form
                onSubmit={verifyCodeForm.handleSubmit(onVerifySubmit)}
                className="space-y-4"
              >
                <FormField
                  control={verifyCodeForm.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="6-digit code"
                          className="h-12 px-4 rounded-lg text-center text-lg tracking-widest"
                          maxLength={6}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-red-500" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
                >
                  Verify
                </Button>
              </form>
            </Form>
            <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="link"
                onClick={resendVerificationCode}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Didn't receive a code? Resend
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success message
  if (verificationStep === "success") {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 justify-center items-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="space-y-2 text-center pb-2">
            <h1 className="text-2xl font-bold text-blue-800">
              Registration Complete!
            </h1>
            <p className="text-gray-500 text-sm">
              Your account has been successfully verified
            </p>
          </CardHeader>
          <CardContent className="pt-4 text-center">
            <p className="mb-6 text-gray-600">
              You can now login to access your secure folder.
            </p>
            <Link href="/login">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-8">
                Go to Login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
