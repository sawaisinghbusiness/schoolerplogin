import Workflow from "@/components/parity/generated/pages/meetings/new";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"New meeting"} back={"/erp/meetings/"}><Workflow /></ParityFrame>;}
