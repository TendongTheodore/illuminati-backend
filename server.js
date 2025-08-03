const express = require("express");
const multer = require("multer");
const nodemailer = require("nodemailer");
const cors = require("cors");
const fs = require("fs");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage: storage });

app.post(
  "/submit",
  upload.fields([
    { name: "idCard", maxCount: 1 },
    { name: "photo", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const {
        fullName,
        dob,
        gender,
        maritalStatus,
        country,
        phone,
        email,
        occupation,
        income,
        education,
        canKeepSecrets,
        readyToJoin,
        reason,
      } = req.body;

      const idCard = req.files["idCard"]?.[0];
      const photo = req.files["photo"]?.[0];

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER,
        subject: "🔺 New Illuminati Recruitment",
        html: `
          <h3>New Application</h3>
          <p><strong>Full Name:</strong> ${fullName}</p>
          <p><strong>DOB:</strong> ${dob}</p>
          <p><strong>Gender:</strong> ${gender}</p>
          <p><strong>Marital Status:</strong> ${maritalStatus}</p>
          <p><strong>Country:</strong> ${country}</p>
          <p><strong>Email Address:</strong> ${email}</p>
          <p><strong>Phone Number:</strong> ${phone}</p>
          <p><strong>Occupation:</strong> ${occupation}</p>
          <p><strong>Income:</strong> ${income}</p>
          <p><strong>Education:</strong> ${education}</p>
          <p><strong>Secrets:</strong> ${canKeepSecrets}</p>
          <p><strong>Ready to Join:</strong> ${readyToJoin}</p>
          <p><strong>Reason:</strong> ${reason}</p>
        `,
        attachments: [
          idCard && { filename: idCard.originalname, path: idCard.path },
          photo && { filename: photo.originalname, path: photo.path },
        ].filter(Boolean),
      };

      await transporter.sendMail(mailOptions);

      const backup = {
        fullName,
        dob,
        gender,
        maritalStatus,
        country,
        phone,
        email,
        occupation,
        income,
        education,
        canKeepSecrets,
        readyToJoin,
        reason,
        timestamp: new Date().toISOString(),
      };
      fs.appendFileSync("submissions.json", JSON.stringify(backup) + "\n");

      res.status(200).json({ message: "Form sent successfully" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Submission failed" });
    }
  }
);

app.listen(PORT, () => {
  console.log(`🔺 Server is running at http://localhost:${PORT}`);
});




app.post('/contact', async (req, res) => {
  const { name, email, subject, message } = req.body;

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.EMAIL_USER,
      subject: `🔺 Contact Form: ${subject}`,
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong><br/>${message}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Message sent successfully.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to send message.' });
  }
});