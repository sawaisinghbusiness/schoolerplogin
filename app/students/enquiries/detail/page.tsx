import Workflow from "@/components/parity/generated/pages/students/enquiries/detail";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"Admission enquiry"} back={"/erp/students/enquiries/"}><Workflow /></ParityFrame>;}
