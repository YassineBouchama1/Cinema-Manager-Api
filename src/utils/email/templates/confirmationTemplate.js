const { config } = require("../../../config/global.config");

exports.confirmationTemplate = async (name, totalPrice, seats, reservationId) => {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; background-color: #f4f4f4; padding: 20px; border-radius: 8px;">
      <h2 style="color: #333;">Reservation Confirmation</h2>
      <p>Dear <strong>${name}</strong>,</p>
      <p>Thank you for your reservation! Here are the details:</p>
      <ul style="list-style-type: none; padding: 0;">
        <li style="margin-bottom: 8px;"><strong>Total Price:</strong> $${totalPrice}</li>
        <li style="margin-bottom: 8px;"><strong>Seats:</strong> ${seats.join(', ')}</li>
      </ul>
      <p>We look forward to welcoming you!</p>
      
      <div style="margin: 20px 0; text-align: center;">
        <a href="${config.frontUrl}/user/reservation/${reservationId}" style="display: inline-block; background-color: #22BC66; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
          View Your Reservation
        </a>
      </div>

      <p style="color: #777;">If you have any questions, feel free to reach out to us.</p>
      <p>Best regards,<br>${config.projectName}</p>
    </div>
  `;
};
