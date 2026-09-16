import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Student } from "@/data/mockData";

export function generateFeeReceiptPDF(
  student: Student,
  amountPaid: number = 20000,
  paymentMode: string = "UPI / QR Code",
  receiptNo: string = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`
) {
  const doc = new jsPDF();

  // Institution Header
  doc.setFillColor(30, 41, 59); // #1e293b dark header
  doc.rect(0, 0, 210, 32, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("MOTHER TERESA NOBLES ACADEMY", 105, 14, { align: "center" });

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text("CBSE Affiliated Senior Secondary School | Barmer, Rajasthan", 105, 20, { align: "center" });
  doc.setTextColor(40, 212, 164); // #28d4a4
  doc.setFont("helvetica", "bold");
  doc.text("INSTITUTION ACCOUNT CODE: SLRJ0402749 | SESSION 2026-27", 105, 26, { align: "center" });

  // Receipt Title Badge
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(14, 38, 182, 12, 2, 2, "FD");

  doc.setTextColor(30, 41, 59);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("OFFICIAL INSTITUTIONAL FEE RECEIPT", 18, 46);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Receipt No: ${receiptNo}`, 130, 46);

  // Student Particulars Box
  doc.setDrawColor(226, 232, 240);
  doc.rect(14, 54, 182, 36);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text("Student Name:", 18, 62);
  doc.text("Class & Section:", 18, 70);
  doc.text("Father's Name:", 18, 78);
  doc.text("Mobile No:", 18, 86);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(student.name, 55, 62);
  doc.text(student.classSec, 55, 70);
  doc.text(student.fatherName, 55, 78);
  doc.text(student.mobile, 55, 86);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("SR Number:", 115, 62);
  doc.text("Admission No:", 115, 70);
  doc.text("Roll Number:", 115, 78);
  doc.text("Payment Date:", 115, 86);

  doc.setTextColor(15, 23, 42);
  doc.setFont("helvetica", "bold");
  doc.text(student.srNo, 150, 62);
  doc.text(student.admissionNo, 150, 70);
  doc.text(student.rollNo, 150, 78);
  doc.text(new Date().toLocaleDateString("en-IN"), 150, 86);

  // Fee Particulars Table using autoTable
  autoTable(doc, {
    startY: 96,
    margin: { left: 14, right: 14 },
    head: [["S.No", "Fee Particulars / Head", "Installment Term", "Amount (INR)"]],
    body: [
      ["1", "Quarterly Tuition & Academic Instruction Fee", "Q2 (Session 2026-27)", `Rs. ${(amountPaid * 0.7).toFixed(2)}`],
      ["2", "Computer Lab & Smart Class Usage", "Session 2026-27", `Rs. ${(amountPaid * 0.15).toFixed(2)}`],
      ["3", "Co-Scholastic & Library Development Fund", "Annual", `Rs. ${(amountPaid * 0.15).toFixed(2)}`],
    ],
    foot: [
      ["", "TOTAL AMOUNT RECEIVED", `Mode: ${paymentMode}`, `Rs. ${amountPaid.toLocaleString("en-IN")}`]
    ],
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9
    },
    footStyles: {
      fillColor: [240, 253, 244],
      textColor: [22, 101, 52],
      fontStyle: "bold",
      fontSize: 10
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 12;

  // Outstanding Status Note
  const remaining = Math.max(0, student.balanceFee - amountPaid);
  doc.setFillColor(248, 250, 252);
  doc.rect(14, finalY, 182, 16, "F");

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.setFont("helvetica", "normal");
  doc.text(`Total Annual Fee: Rs. ${student.totalFee.toLocaleString("en-IN")} | Net Balance Remaining: Rs. ${remaining.toLocaleString("en-IN")}`, 18, finalY + 6);
  doc.setFont("helvetica", "italic");
  doc.text("* Computer generated receipt verified by SchoolDesk ERP. No physical signature required.", 18, finalY + 12);

  // Signatures
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text("Depositor / Student Sign", 25, finalY + 36);
  doc.text("Cashier / Accounts Officer", 140, finalY + 36);

  doc.save(`Fee_Receipt_${student.srNo}_${receiptNo}.pdf`);
}

export function generateGatePassPDF(
  student: Student,
  passData: {
    passId: string;
    reason: string;
    escort: string;
    time: string;
    date: string;
  }
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: [148, 210] // A5 Format standard for gate passes
  });

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, 148, 24, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("MOTHER TERESA NOBLES ACADEMY", 74, 10, { align: "center" });
  doc.setFontSize(8);
  doc.setTextColor(40, 212, 164);
  doc.text("STUDENT EARLY DEPARTURE GATE CLEARANCE SLIP", 74, 16, { align: "center" });

  // Pass Box
  doc.setDrawColor(203, 213, 225);
  doc.rect(10, 30, 128, 120);

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(`Gate Pass ID: ${passData.passId}`, 14, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(`Date & Time: ${passData.date} | ${passData.time}`, 14, 44);

  // Table of particulars
  autoTable(doc, {
    startY: 48,
    margin: { left: 14, right: 14 },
    theme: "plain",
    body: [
      ["Student Name", `: ${student.name}`],
      ["Class & Section", `: ${student.classSec} (Roll ${student.rollNo})`],
      ["SR Number", `: ${student.srNo}`],
      ["Admission Number", `: ${student.admissionNo}`],
      ["Parent Phone", `: ${student.mobile}`],
      ["Accompanied By", `: ${passData.escort}`],
      ["Exit Reason", `: ${passData.reason}`],
      ["Security Status", ": VERIFIED & SMS SENT TO PARENT"]
    ],
    styles: {
      fontSize: 8.5,
      cellPadding: 2
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 35 }
    }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 15;

  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Principal / Admin Stamp", 20, finalY + 12);
  doc.text("Main Gate Security Sign", 90, finalY + 12);

  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text("Account: SLRJ0402749 | Single-Tenant SchoolDesk Security Pass", 74, 142, { align: "center" });

  doc.save(`GatePass_${student.name}_${passData.passId}.pdf`);
}
