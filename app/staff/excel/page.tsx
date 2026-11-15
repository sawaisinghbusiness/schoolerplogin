import Workflow from "@/components/parity/generated/pages/staff/excel";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"Staff import / export"} back={"/erp/staff/"}><Workflow /></ParityFrame>;}
