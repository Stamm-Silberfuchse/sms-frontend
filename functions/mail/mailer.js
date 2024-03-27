const nodemailer = require("nodemailer")

require('dotenv').config()

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const fromName = "SMS-Team"

exports.sendMail = async (recipients, subject, text, html) => {
  const info = await transporter.sendMail({
    from: {
      name: fromName,
      address: process.env.SMTP_USER
    }, // sender address
    to: recipients, // list of receivers
    subject: subject, // Subject line
    text: text, // plain text body
    html: html, // html body
  })
  return info
}
