import Workflow from "@/components/parity/generated/pages/transport/route";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"Transport route"} back={"/erp/transport/"}><Workflow /></ParityFrame>;}
