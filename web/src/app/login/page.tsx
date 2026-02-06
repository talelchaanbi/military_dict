import { Shell } from "@/components/layout/Shell";
import LoginClient from "./login-client";

export default function LoginPage() {
  return (
    <Shell title="تسجيل الدخول" backTo="/">
      <LoginClient />
    </Shell>
  );
}
