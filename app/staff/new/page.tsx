import { redirect } from "next/navigation";

// Adding a staff member happens in a drawer on /staff.
export default function Page() {
  redirect("/staff?new=1");
}
