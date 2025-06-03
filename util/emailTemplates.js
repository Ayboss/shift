exports.welcomeHTML = (companyName, staffid) => {
  return `
  <div>Hi there,</div> <div>Welcome to SHFT! 🎉</div> <div>You've been added to {{company.companyName}} as a staff member.</div> <div>To get started:</div> <div> 1 Download the SHFT app from your app store.</div> <div>2. Sign up using your unique Shift ID: {{staff.id}}.</div> <div>If you have any questions, feel free to reach out to your manager or the SHFT support team. We're excited to have you on board! Welcome to SHFT, ${companyName} has added you, download the SHFT application from your app store and signup with your shift id ${staffid} </div>
 `;
};
