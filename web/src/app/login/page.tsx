import { Shell } from "@/components/layout/Shell";
import LoginClient from "./login-client";

export default function LoginPage() {
  return (
    <Shell fullWidth backTo="/">
      <div className="flex items-center justify-center p-4">
        <LoginClient />
      </div>
    </Shell>
  );
}
