import Workflow from "@/components/parity/generated/pages/students/detail";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"Student profile"} back={"/erp/students/"}><Workflow /></ParityFrame>;}
