import { redirect } from "next/navigation";

// Staff leave lives on the Staff attendance page.
export default function Page() {
  redirect("/staff/attendance?tab=leave");
}
