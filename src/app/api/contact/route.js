import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      name,
      email,
      phone,
      eventType,
      date,
      location,
      guestCount,
      message,
    } = body;

    const data = await resend.emails.send({
      from: "Ramp Studio <onboarding@resend.dev>",
      to: ["your-email@gmail.com"],
      subject: `New Booking from ${name}`,
      html: `
        <h2>New Booking Inquiry</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Collection:</strong> ${eventType}</p>
        <p><strong>Date:</strong> ${date}</p>
        <p><strong>Location:</strong> ${location}</p>
        <p><strong>Guest Count:</strong> ${guestCount}</p>
        <p><strong>Message:</strong> ${message}</p>
      `,
    });

    return Response.json({ success: true, data });
  } catch (error) {
    console.error(error);

    return Response.json(
      { success: false, error: "Failed to send email" },
      { status: 500 }
    );
  }
}
