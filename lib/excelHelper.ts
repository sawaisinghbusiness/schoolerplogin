import * as XLSX from "xlsx";
import { Student } from "@/data/mockData";

export function exportStudentsToExcel(
  students: Student[],
  filename: string = "Students_Master_Roster_2026-27.xlsx"
) {
  const exportData = students.map((s, index) => ({
    "S.No": index + 1,
    "SR Number": s.srNo,
    "Admission No": s.admissionNo,
    "Student Name": s.name,
    "Class - Sec": s.classSec,
    "Roll No": s.rollNo,
    "Father Name": s.fatherName,
    "Mother Name": s.motherName,
    "Guardian Contact": s.contact,
    "Mobile": s.mobile,
    "Address": s.address,
    "PEN No": s.penNo,
    "Gender": s.gender,
    "DOB": s.dob,
    "Category": s.category,
    "House": s.house,
    "Transport Opted": s.transportOpted ? "Yes" : "No",
    "Bus Route": s.busRoute || "N/A",
    "Total Fee (INR)": s.totalFee,
    "Paid Fee (INR)": s.paidFee,
    "Balance Fee (INR)": s.balanceFee,
    "Status": s.status
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

  XLSX.writeFile(workbook, filename);
}

export function importStudentsFromExcel(
  file: File
): Promise<Partial<Student>[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet);

        // No invented values: a missing field stays empty so the server can reject
        // incomplete rows instead of saving a fake phone number or fee.
        const text = (v: unknown) => (v === undefined || v === null ? "" : String(v).trim());
        const parsedStudents: Partial<Student>[] = jsonData.map((row) => {
          // "11th - Science-Bio" -> class "11th", section "Science-Bio" (split on " - " only).
          const classSec = text(row["Class - Sec"] || row["classSec"]);
          const [cls, ...rest] = classSec.split(/\s+-\s+/);
          const mobile = text(row["Mobile"] || row["Guardian Contact"] || row["contact"]);
          const gender = text(row["Gender"]);
          const category = text(row["Category"]);
          return {
            srNo: text(row["SR Number"] || row["srNo"]),
            admissionNo: text(row["Admission No"] || row["admissionNo"]) || undefined,
            name: text(row["Student Name"] || row["name"]),
            classSec,
            class: text(cls),
            section: text(rest.join(" - ")) || "A",
            rollNo: text(row["Roll No"]) || undefined,
            fatherName: text(row["Father Name"] || row["fatherName"]),
            motherName: text(row["Mother Name"] || row["motherName"]) || undefined,
            guardianName: text(row["Father Name"] || row["fatherName"]) || undefined,
            contact: mobile,
            mobile,
            address: text(row["Address"]) || undefined,
            penNo: text(row["PEN No"]) && text(row["PEN No"]) !== "N/A" ? text(row["PEN No"]) : undefined,
            gender: (["Male", "Female", "Other"].includes(gender) ? gender : undefined) as any,
            dob: text(row["DOB"]) || undefined,
            category: (["General", "OBC", "SC", "ST"].includes(category) ? category : "General") as any,
            house: (text(row["House"]) || undefined) as any,
            transportOpted: /^y(es)?$/i.test(text(row["Transport Opted"])),
            busRoute: text(row["Bus Route"]) && text(row["Bus Route"]) !== "N/A" ? text(row["Bus Route"]) : undefined,
            status: "Active",
            totalFee: Number(row["Total Fee (INR)"]) || 0,
            paidFee: Number(row["Paid Fee (INR)"]) || 0,
          };
        });

        resolve(parsedStudents);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
