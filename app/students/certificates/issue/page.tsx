import Workflow from "@/components/parity/generated/pages/students/certificates/issue";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"Issue certificate"} back={"/erp/students/certificates/"}><Workflow /></ParityFrame>;}
