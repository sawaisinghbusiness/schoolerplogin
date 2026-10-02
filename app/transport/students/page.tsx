import { redirect } from "next/navigation";

/** Students on each route now live inside the Transport page (open a route). */
export default function Page() {
  redirect("/transport");
}
