import { Resend } from "resend";

/**
 * Resend Email Client
 * 
 * Initialize Resend client with API key from environment variables
 */
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Generate HTML email template for daily digest
 */
function generateDailyDigestHTML(
  dueProblems: Array<{
    title: string;
    leetcodeUrl: string;
    reminderStage: string;
    canonicalPattern: { name: string } | null;
    customPattern: { name: string } | null;
  }>,
  failedProblems: Array<{
    title: string;
    leetcodeUrl: string;
    failureCount: number;
    canonicalPattern: { name: string } | null;
    customPattern: { name: string } | null;
  }>,
  appUrl: string = process.env.BETTER_AUTH_URL || "http://localhost:3000"
): string {
  const totalCount = dueProblems.length + failedProblems.length;
  const dueCount = dueProblems.length;
  const failedCount = failedProblems.length;

  // Group due problems by pattern
  const dueByPattern = new Map<string, typeof dueProblems>();
  dueProblems.forEach((problem) => {
    const patternName =
      problem.customPattern?.name || problem.canonicalPattern?.name || "Unknown";
    if (!dueByPattern.has(patternName)) {
      dueByPattern.set(patternName, []);
    }
    dueByPattern.get(patternName)!.push(problem);
  });

  // Group failed problems by pattern
  const failedByPattern = new Map<string, typeof failedProblems>();
  failedProblems.forEach((problem) => {
    const patternName =
      problem.customPattern?.name || problem.canonicalPattern?.name || "Unknown";
    if (!failedByPattern.has(patternName)) {
      failedByPattern.set(patternName, []);
    }
    failedByPattern.get(patternName)!.push(problem);
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>RecallForge Daily Digest</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
    <h1 style="color: white; margin: 0; font-size: 28px;">RecallForge</h1>
    <p style="color: rgba(255, 255, 255, 0.9); margin: 10px 0 0 0; font-size: 16px;">Daily Digest</p>
  </div>

  <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px; text-align: center;">
    <h2 style="margin: 0 0 10px 0; font-size: 24px; color: #333;">${totalCount} Problem${totalCount !== 1 ? "s" : ""} Need Your Attention</h2>
    <p style="margin: 5px 0; color: #666;">
      ${dueCount > 0 ? `<strong>${dueCount}</strong> due today` : ""}
      ${dueCount > 0 && failedCount > 0 ? " • " : ""}
      ${failedCount > 0 ? `<strong>${failedCount}</strong> failed` : ""}
    </p>
  </div>

  ${dueCount > 0 ? `
  <div style="margin-bottom: 30px;">
    <h2 style="color: #667eea; font-size: 20px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #667eea;">📅 Due Today</h2>
    ${Array.from(dueByPattern.entries())
      .map(
        ([patternName, problems]) => `
    <div style="margin-bottom: 25px;">
      <h3 style="color: #555; font-size: 16px; margin-bottom: 10px; font-weight: 600;">${patternName}</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${problems
          .map(
            (problem) => `
        <li style="background: white; padding: 12px; margin-bottom: 8px; border-radius: 6px; border-left: 3px solid #667eea;">
          <a href="${problem.leetcodeUrl}" target="_blank" style="color: #667eea; text-decoration: none; font-weight: 500; display: block; margin-bottom: 4px;">${problem.title}</a>
          <span style="color: #999; font-size: 14px;">Stage: ${problem.reminderStage.replace("_", " ")}</span>
        </li>
        `
          )
          .join("")}
      </ul>
    </div>
    `
      )
      .join("")}
  </div>
  ` : ""}

  ${failedCount > 0 ? `
  <div style="margin-bottom: 30px;">
    <h2 style="color: #e74c3c; font-size: 20px; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 2px solid #e74c3c;">⚠️ Failed & Need Attention</h2>
    ${Array.from(failedByPattern.entries())
      .map(
        ([patternName, problems]) => `
    <div style="margin-bottom: 25px;">
      <h3 style="color: #555; font-size: 16px; margin-bottom: 10px; font-weight: 600;">${patternName}</h3>
      <ul style="list-style: none; padding: 0; margin: 0;">
        ${problems
          .map(
            (problem) => `
        <li style="background: white; padding: 12px; margin-bottom: 8px; border-radius: 6px; border-left: 3px solid #e74c3c;">
          <a href="${problem.leetcodeUrl}" target="_blank" style="color: #e74c3c; text-decoration: none; font-weight: 500; display: block; margin-bottom: 4px;">${problem.title}</a>
          <span style="color: #999; font-size: 14px;">Failed ${problem.failureCount}x</span>
        </li>
        `
          )
          .join("")}
      </ul>
    </div>
    `
      )
      .join("")}
  </div>
  ` : ""}

  <div style="text-align: center; margin: 40px 0;">
    <a href="${appUrl}/today" style="display: inline-block; background: #667eea; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">Open RecallForge</a>
  </div>

  <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e0e0e0; color: #999; font-size: 14px;">
    <p style="margin: 0;">RecallForge - Your LeetCode Problem Retention System</p>
    <p style="margin: 5px 0 0 0;">You're receiving this because you have problems due for review.</p>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Send daily digest email to a user
 */
export async function sendDailyDigest(
  userEmail: string,
  dueProblems: Array<{
    title: string;
    leetcodeUrl: string;
    reminderStage: string;
    canonicalPattern: { name: string } | null;
    customPattern: { name: string } | null;
  }>,
  failedProblems: Array<{
    title: string;
    leetcodeUrl: string;
    failureCount: number;
    canonicalPattern: { name: string } | null;
    customPattern: { name: string } | null;
  }>
): Promise<{ success: boolean; error?: string }> {
  const dueCount = dueProblems.length;
  const failedCount = failedProblems.length;

  // Skip email if no problems
  if (dueCount === 0 && failedCount === 0) {
    return { success: true };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL;
    if (!fromEmail) {
      throw new Error("RESEND_FROM_EMAIL environment variable is not set");
    }

    const totalCount = dueCount + failedCount;
    const subject = `RecallForge Daily Digest - ${totalCount} problem${totalCount !== 1 ? "s" : ""} due`;

    const html = generateDailyDigestHTML(dueProblems, failedProblems);

    const { error } = await resend.emails.send({
      from: fromEmail,
      to: userEmail,
      subject,
      html,
    });

    if (error) {
      console.error("Resend API error:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error("Error sending daily digest email:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
