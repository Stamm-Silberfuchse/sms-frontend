const { logger } = require("firebase-functions")
const { setGlobalOptions } = require("firebase-functions/v2")
const { onDocumentCreated } = require("firebase-functions/v2/firestore")
const { onRequest } = require("firebase-functions/v2/https")

const { initializeApp, getApps, getApp } = require("firebase-admin/app")
const { getAuth } = require("firebase-admin/auth")
const { getFirestore } = require("firebase-admin/firestore")

const nodemailer = require("nodemailer")

require('dotenv').config()

setGlobalOptions({maxInstances: 2})

const adminApp = getApps().length === 0 ? initializeApp() : getApp()
const adminAuth = getAuth(adminApp)
const adminDB = getFirestore(adminApp)

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

const mailBodyHTML = (email, displayName, link) => {
  return `
  <html>
  <body>
    <p>Hi ${displayName}!</p>
    <p>
      Du bist eingeladen worden, das Silberfuchs-Management-System zu nutzen.<br>
      Klicke auf den folgenden Link, um Deine Anmeldung abzuschließen:
    </p>
    <a href="${link}">Anmeldung abschließen</a><br>
    <p>Dort musst Du deine Mail-Adresse <b>${email}</b> bestätigen und ein Passwort setzen, bevor Du das SMS nutzen kannst.</p>
    <p>
      Herzlich Gut Pfad<br>
      Dein SMS-Team
    </p>
  </body>
  </html>
  `
}

const mailBody = (email, displayName, link) => {
  return `
  Hi ${displayName}!\n\n
  Du bist eingeladen worden, das Silberfuchs-Management-System zu nutzen.\n
  Klicke auf den folgenden Link, um Deine Anmeldung abzuschließen:\n
  ${link}
  \n
  Dort musst Du deine Mail-Adresse ${email} bestätigen und ein Passwort setzen, bevor Du das SMS nutzen kannst.
  \n\n
  Herzlich Gut Pfad\n
  Dein SMS-Team
  `
}

/*
exports.createUser = onDocumentCreated(
  {
    document: "/users/{documentId}",
    region: "europe-west3",
  },
  async (event) => {
    await adminAuth
      .createUser({
        uid: event.params.documentId,
        email: event.data.data().email,
        emailVerified: false,
        // phoneNumber
        password: 'qZUB-nS3A-1hTw-3B9z',
        displayName: event.data.data().displayName,
        // photoURL
        disabled: true,
      })
      .then((userRecord) => {
        // See the UserRecord reference doc for the contents of userRecord.
        logger.log('Successfully created new user:', userRecord.uid)
      })
      .catch((error) => {
        logger.error('Error creating new user:', error)
      })
    const customToken = await adminAuth.createCustomToken(event.params.documentId)

    const recipient = event.data.data().email
    const displayName = event.data.data().displayName
    logger.log("Sending verification email to ", event.params.documentId)
    const info = await transporter.sendMail({
      from: {
        name: "SMS-Team",
        address: "<sms@stamm-silberfuechse.de>"
      }, // sender address
      to: recipient, // list of receivers
      subject: "Bestätige Deine Anmeldung", // Subject line
      text: mailBody(event.params.documentId, displayName, customToken), // plain text body
      html: mailBodyHTML(event.params.documentId, displayName, customToken), // html body
    })
    logger.log("Message sent: ", info.messageId)
})
*/

exports.createUserWithLink = onRequest(
  {
    cors: true,
    region: ["europe-west3"]
  },
  async (req, res) => {
    // Read query parameters
    const email = req.query.email
    const firstName = req.query.firstName
    const lastName = req.query.lastName
    const password = req.query.password
    const displayName = firstName + ' ' + lastName

    // Create User
    const userRecord = await adminAuth
      .createUser({
        // uid
        email: email,
        emailVerified: false,
        // phoneNumber
        password: 'qZUB-nS3A-1hTw-3B9z',
        displayName: displayName,
        // photoURL
        disabled: false,
      })
      .catch((error) => {
        logger.error('Error creating new user:', error)
        res.status(500).send({
          message: "Error creating new user",
          error: error
        })
        return
      })

    const uid = userRecord.uid
    logger.log('Successfully created new user:', uid)

    // Create DB Entry for user
    const docRef = adminDB.doc(`users/${uid}`)
    docRef.set({
      email: email,
      displayName: displayName,
      firstName: firstName,
      lastName: lastName,
      createdTimestamp: new Date(),
    })
      .catch((error) => {
        logger.error("Error adding user to DB:", error)
        res.status(500).send({
          message: "Error adding user to DB",
          error: error
        })
        return
      })
    logger.log('Successfully added user to DB:', uid)

    const actionCodeSettings = {
      url: 'http://localhost:3000/signInWithLink',
      handleCodeInApp: true
    }

    // Send email to user
    await adminAuth
      .generateSignInWithEmailLink(email, actionCodeSettings)
      .then(async (link) => {
        const recipient = email
        logger.log("Sending verification email to ", email)
        logger.log(link)
        const info = transporter.sendMail({
          from: {
            name: "SMS-Team",
            address: process.env.SMTP_USER
          }, // sender address
          to: recipient, // list of receivers
          subject: "Willkommen beim SMS", // Subject line
          text: mailBody(email, displayName, link), // plain text body
          html: mailBodyHTML(email, displayName, link), // html body
        })
        logger.log("Message sent: ", info.messageId)
      })
      .catch((error) => {
        logger.error("Error sending email to user:", error)
        res.status(500).send({
          message: "Error sending email to user",
          error: error
        })
        return
      })
    res.status(200).send({
      message: `User ${displayName} erfolgreich angelegt.`
    })
  }
)
