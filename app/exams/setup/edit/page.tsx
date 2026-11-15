import Workflow from "@/components/parity/generated/pages/exams/setup/edit";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"Exam setup"} back={"/erp/exams/setup/"}><Workflow /></ParityFrame>;}
