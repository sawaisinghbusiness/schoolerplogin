import Workflow from "@/components/parity/generated/pages/students/admission";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"New admission"} back={"/erp/students/"}><Workflow /></ParityFrame>;}
