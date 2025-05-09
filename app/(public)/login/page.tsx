"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LockIcon } from "lucide-react";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useLogin } from "@/app/(public)/login/hooks/useLogin";

export default function Home() {
  const { form, onSubmit, loginError } = useLogin();

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 justify-center items-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="space-y-2 text-center pb-2">
          <div className="mx-auto bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mb-2">
            <LockIcon size={32} className="text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-blue-800">
            Safe Folder
          </CardTitle>
          <p className="text-gray-500 text-sm">
            Secure your documents in one place
          </p>
        </CardHeader>
        <CardContent className="pt-4">
          {loginError && (
            <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm">
              <p className="font-medium">Login failed</p>
              <p>{loginError}</p>
            </div>
          )}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              {/* Added Forgot Password link */}
              {/*<div className="flex justify-end">*/}
              {/*  <Link*/}
              {/*    href="/forgot-password"*/}
              {/*    className="text-sm text-blue-600 hover:text-blue-800"*/}
              {/*  >*/}
              {/*    Forgot password?*/}
              {/*  </Link>*/}
              {/*</div>*/}

              <Button
                type="submit"
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg"
              >
                Sign In
              </Button>
            </form>
          </Form>
          <div className="flex justify-center mt-6 pt-4 border-t border-gray-100">
            <p className="text-gray-600">
              New user?{" "}
              <Link
                href="/signup"
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Create an account
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
