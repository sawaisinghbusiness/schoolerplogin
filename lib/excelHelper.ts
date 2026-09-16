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

        const parsedStudents: Partial<Student>[] = jsonData.map((row, idx) => ({
          id: `STU-IMP-${Date.now()}-${idx}`,
          srNo: row["SR Number"] || row["srNo"] || `SR-2026-${100 + idx}`,
          admissionNo: row["Admission No"] || row["admissionNo"] || `ADM-${9500 + idx}`,
          name: row["Student Name"] || row["name"] || "Imported Student",
          classSec: row["Class - Sec"] || row["classSec"] || "10th - A",
          class: (row["Class - Sec"] || "10th").split("-")[0].trim(),
          section: (row["Class - Sec"] || "A").split("-")[1]?.trim() || "A",
          rollNo: String(row["Roll No"] || idx + 1),
          fatherName: row["Father Name"] || row["fatherName"] || "Father Name",
          motherName: row["Mother Name"] || row["motherName"] || "Mother Name",
          guardianName: row["Father Name"] || "Guardian",
          contact: String(row["Mobile"] || row["contact"] || "9876543210"),
          mobile: String(row["Mobile"] || "9876543210"),
          address: row["Address"] || "Barmer, Rajasthan",
          penNo: row["PEN No"] || `PEN-RJ-2026-${100 + idx}`,
          gender: (row["Gender"] || "Male") as any,
          dob: row["DOB"] || "2010-01-01",
          category: (row["Category"] || "General") as any,
          house: (row["House"] || "Tagore") as any,
          transportOpted: row["Transport Opted"] === "Yes",
          busRoute: row["Bus Route"] || undefined,
          status: "Active",
          totalFee: Number(row["Total Fee (INR)"] || 40000),
          paidFee: Number(row["Paid Fee (INR)"] || 20000),
          balanceFee: Number(row["Balance Fee (INR)"] || 20000),
          photoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
        }));

        resolve(parsedStudents);
      } catch (err) {
        reject(err);
      }
    };
    reader.onerror = (err) => reject(err);
    reader.readAsArrayBuffer(file);
  });
}
