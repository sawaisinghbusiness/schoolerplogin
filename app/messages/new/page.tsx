import { redirect } from "next/navigation";

// Writing a message happens in a drawer on /messages.
export default function Page() {
  redirect("/messages?new=1");
}
