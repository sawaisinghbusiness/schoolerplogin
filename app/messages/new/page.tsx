import Workflow from "@/components/parity/generated/pages/messages/new";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"New message"} back={"/erp/messages/"}><Workflow /></ParityFrame>;}
