import { redirect } from "next/navigation";
import { verifySession } from "@/lib/actions/auth";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const valid = await verifySession();
  if (!valid) {
    redirect("/admin/login");
  }

  return <>{children}</>;
}
