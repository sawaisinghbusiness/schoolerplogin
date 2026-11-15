import Workflow from "@/components/parity/generated/pages/syllabus";
import { ParityFrame } from "@/components/parity/ParityFrame";
export default function Page(){return <ParityFrame title={"Syllabus coverage"} action={{"href":"/erp/syllabus/excel/","text":{"hi":"Excel से भरें","en":"Excel import / export"},"badge":{"hi":"Excel","en":"Excel"}}}><Workflow /></ParityFrame>;}
