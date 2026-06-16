import { redirect } from "next/navigation";
import LoginForm from "@/components/LoginForm";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  return (
    <main className="grid min-h-[calc(100vh-8rem)] place-items-center px-4 py-12">
      <LoginForm />
    </main>
  );
}
