import Workflow from "@/components/parity/generated/pages/students/enquiries/new";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"New admission enquiry"} back={"/erp/students/enquiries/"}><Workflow /></ParityFrame>;}
