export const certificateHtml = ({ holderName, level, dateISO, certificateUID }) => `
<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>Certificate</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    .card { border: 8px solid #222; padding: 40px; }
    h1 { margin: 0 0 4px; }
    .uid { color: #555; font-size: 12px; }
  </style>
  </head>
  <body>
    <div class="card">
      <h1>Certificate of Achievement</h1>
      <p>This certifies that <strong>${holderName}</strong> has achieved the level <strong>${level}</strong>.</p>
      <p>Date: ${new Date(dateISO).toLocaleDateString()}</p>
      <p class="uid">UID: ${certificateUID}</p>
    </div>
  </body>
</html>`;

export const certificateEmailTemplate = ({ holderName, level, verifyUrl }) => `
  <p>Hi ${holderName},</p>
  <p>Congratulations! Your certificate for level <strong>${level}</strong> has been issued.</p>
  <p>You can verify it here: <a href="${verifyUrl}">${verifyUrl}</a></p>
  <p>Best regards,<br/>Team</p>
`;


