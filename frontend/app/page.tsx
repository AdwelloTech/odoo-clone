"use client";

import { Button, Divider, Form, Input, Link } from "@heroui/react";
import { useRouter } from "next/navigation";

export default function App() {
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    router.push("/dashboard");
  };

  return (
    <div className="bg-gray-100 flex min-h-screen items-center justify-center p-4">
      <div className="bg-content1 flex w-full max-w-sm flex-col gap-4 rounded-lg p-6 shadow-md">
        <h2 className="text-xl font-medium">Welcome Back</h2>
        <Form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <Input
            isRequired
            label="Username"
            name="email"
            placeholder="Enter your email"
            type="email"
            variant="bordered"
          />
          <Input
            isRequired
            label="Password"
            name="password"
            placeholder="Enter your password"
            type="password"
            variant="bordered"
          />
          <Button className="w-full" color="primary" type="submit">
            Sign In
          </Button>
        </Form>
      </div>
    </div>
  );
}
