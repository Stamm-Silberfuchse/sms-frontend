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

exports.sendMail = async (to, subject, text, html, attachments=[], cc=[], bcc=[]) => {
  const info = await transporter.sendMail({
    from: {
      name: process.env.DEFAULT_SENDER_NAME,
      address: process.env.SMTP_USER
    }, // sender address
    to: to, // list of receivers
    cc: cc, // list of copy receivers
    bcc: bcc, // list of blind copy receivers
    subject: subject, // subject line
    text: text, // plain text body
    html: html, // html body
    attachments: attachments, // list of attachments
  })
  return info
}
