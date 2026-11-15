import Workflow from "@/components/parity/generated/pages/messages/detail";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"Message delivery"} back={"/erp/messages/"}><Workflow /></ParityFrame>;}
