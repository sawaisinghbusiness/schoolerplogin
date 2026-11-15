import Workflow from "@/components/parity/generated/pages/parent-chats/chat";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"Parent-teacher conversation"} back={"/erp/parent-chats/"}><Workflow /></ParityFrame>;}
