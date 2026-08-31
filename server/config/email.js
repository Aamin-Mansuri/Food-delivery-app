export const sendEmail = async ({ to, subject, html, text }) => {
  console.log(`[FoodRush Email Log] To: ${to} | Subject: "${subject}"`);
  return { success: true, messageId: `msg_${Date.now()}` };
};
