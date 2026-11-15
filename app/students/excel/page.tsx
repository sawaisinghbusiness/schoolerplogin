import Workflow from "@/components/parity/generated/pages/students/excel";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"Student import / export"} back={"/erp/students/"}><Workflow /></ParityFrame>;}
