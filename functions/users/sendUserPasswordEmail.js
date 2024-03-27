const { logger } = require("firebase-functions")
const { onCall, HttpsError } = require("firebase-functions/v2/https")

const { initializeApp, getApps, getApp } = require("firebase-admin/app")
const { getAuth } = require("firebase-admin/auth")
const { getFirestore } = require("firebase-admin/firestore")

const { sendMail } = require('../mail/mailer')

require('dotenv').config()

const adminApp = getApps().length === 0 ? initializeApp() : getApp()
const adminAuth = getAuth(adminApp)
const adminDB = getFirestore(adminApp)

const mailBodyHTML = (name, link) => {
  return `
  <html>
  <body>
    <p>Hi ${name}!</p>
    <p>
      Du wurdest aufgefordert, ein neues Passwort für deinen SMS-Account zu vergeben.<br>
      Klicke auf den folgenden Link, um jetzt dein Passwort zu ändern:
    </p>
    <a href="${link}">Passwort setzen</a><br><br>
    <p>
      Herzlich Gut Pfad<br>
      Dein SMS-Team
    </p>
  </body>
  </html>
  `
}

const mailBody = (name, link) => {
  return `
  Hi ${name}!\n\n
  Du wurdest aufgefordert, ein neues Passwort für deinen SMS-Account zu vergeben.\n
  Klicke auf den folgenden Link, um jetzt dein Passwort zu ändern:\n
  ${link}
  \n\n
  Herzlich Gut Pfad\n
  Dein SMS-Team
  `
}

exports.sendUserPasswordEmail = onCall(
  {
    cors: true,
    region: "europe-west3",
  },
  async (request) => {
    if (!['admin', 'stafue'].includes(request.auth?.token?.role)) {
      throw new HttpsError('permission-denied', 'Passwortmails dürfen nur von Admins oder der Stammesführung versandt werden.')
    }

    // check if account already exists
    const uid = request.data?.uid
    const email = request.data?.email
    const name = request.data?.name
    await adminAuth.getUserByEmail(email)
      .catch((error) => {
        throw new HttpsError('no-user', 'Es existiert kein User mit dieser E-Mail-Adresse.')
      }) // if user does not exist, this fails

    // retrieve login-token
    const token = await adminAuth
    .createCustomToken(uid)
    .catch((error) => {
      logger.log('Error creating custom token:', error)
      throw new HttpsError('internal', 'Fehler beim Erstellen des Login-Links, der an den User geschickt werden soll.')
    })

    const link = process.env.VITE_SITE_URL + '/sign-in-with-link?token=' + token

    // Send email to user
    const recipient = email
    const info = await sendMail(
      recipient,
      "Passwort zurücksetzen",
      mailBody(name, link),
      mailBodyHTML(name, link)
    )
    logger.log("Message sent: ", info.messageId)
    return "User erfolgreich angelegt."
  }
)
