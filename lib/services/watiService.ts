/**
 * WATI (WhatsApp Business API) Service
 * Handles dispatching automated WhatsApp notifications to parents.
 */

interface AbsentStudentAlert {
  studentId: string;
  studentName: string;
  rollNo: string;
  classSec: string;
  mobile: string;
  date: string;
}

export interface WatiAlertResult {
  studentId: string;
  studentName: string;
  mobile: string;
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Formats phone number for WhatsApp WATI API (requires country code, e.g., 919828XXXXXX)
 */
export function formatIndianWhatsAppNumber(mobile: string): string {
  let cleaned = mobile.replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  if (cleaned.length === 10) {
    cleaned = "91" + cleaned;
  }
  return cleaned;
}

export const watiService = {
  /**
   * Send WhatsApp absent alert via WATI to a single student's parent
   */
  async sendAbsentAlert(student: AbsentStudentAlert): Promise<WatiAlertResult> {
    const apiEndpoint = process.env.WATI_API_ENDPOINT?.trim();
    const accessToken = process.env.WATI_ACCESS_TOKEN?.trim();
    const templateName = process.env.WATI_ABSENT_TEMPLATE_NAME?.trim() || "absent_alert";

    const cleanPhone = formatIndianWhatsAppNumber(student.mobile);

    if (!apiEndpoint || !accessToken) {
      return {
        studentId: student.studentId,
        studentName: student.studentName,
        mobile: cleanPhone,
        success: false,
        error: "WATI API Endpoint URL not configured in .env.local",
      };
    }

    try {
      const baseUrl = apiEndpoint.replace(/\/+$/, "");
      const url = `${baseUrl}/api/v1/sendTemplateMessage?whatsappNumber=${cleanPhone}`;

      const payload = {
        template_name: templateName,
        broadcast_name: `absent_alert_${student.date}_${Date.now()}`,
        parameters: [
          { name: "student_name", value: student.studentName },
          { name: "class", value: student.classSec },
          { name: "roll_no", value: student.rollNo },
          { name: "date", value: student.date },
        ],
      };

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || data?.result === false || data?.result === "error") {
        return {
          studentId: student.studentId,
          studentName: student.studentName,
          mobile: cleanPhone,
          success: false,
          error: data?.info || data?.message || data?.error || `HTTP ${res.status}`,
        };
      }

      return {
        studentId: student.studentId,
        studentName: student.studentName,
        mobile: cleanPhone,
        success: true,
        messageId: data?.id || data?.messageId || "sent",
      };
    } catch (err: any) {
      return {
        studentId: student.studentId,
        studentName: student.studentName,
        mobile: cleanPhone,
        success: false,
        error: err.message || "Network error",
      };
    }
  },

  /**
   * Batch send absent alerts to all absent students
   */
  async sendBatchAbsentAlerts(students: AbsentStudentAlert[]): Promise<WatiAlertResult[]> {
    const results: WatiAlertResult[] = [];

    for (const student of students) {
      if (!student.mobile || student.mobile.length < 10) {
        results.push({
          studentId: student.studentId,
          studentName: student.studentName,
          mobile: student.mobile,
          success: false,
          error: "Invalid phone number",
        });
        continue;
      }

      const res = await this.sendAbsentAlert(student);
      results.push(res);
    }

    return results;
  },
};
