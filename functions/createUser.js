const { logger } = require("firebase-functions")
const { onCall, HttpsError } = require("firebase-functions/v2/https")

const { initializeApp, getApps, getApp } = require("firebase-admin/app")
const { getAuth } = require("firebase-admin/auth")
const { getFirestore } = require("firebase-admin/firestore")

const { sendMail } = require('./mail/mailer')

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
      Ein Account wurde für dich angelegt, um das Silberfuchs-Management-System zu nutzen.<br>
      Klicke auf den folgenden Link, um Deine Anmeldung abzuschließen:
    </p>
    <a href="${link}">Anmeldung abschließen</a><br><br>
    <p>
      Herzlich Gut Pfad<br>
      Dein SMS-Team
    </p>
  </body>
  </html>
  `
}

const mailBody = (firstName, link) => {
  return `
  Hi ${firstName}!\n\n
  Ein Account wurde für dich angelegt, um das Silberfuchs-Management-System zu nutzen.\n
  Klicke auf den folgenden Link, um Deine Anmeldung abzuschließen:\n
  ${link}
  \n\n
  Herzlich Gut Pfad\n
  Dein SMS-Team
  `
}

exports.createUserWithLink = onCall(
  {
    cors: true,
    region: "europe-west3",
  },
  async (request) => {
    if (request.auth?.token?.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Nur Administratoren dürfen neue User anlegen.')
    }
    // check if account already exists
    const email = request.data?.email
    const user = await adminAuth.getUserByEmail(email)
      .catch((error) => {}) // if user does not exist, this fails: ignore it, we want to create the user now
    if (user) {
      throw new HttpsError('already-exists', 'Ein User mit dieser E-Mail-Adresse existiert bereits.')
    }
    // Read query parameters
    const name = request.data?.name
    const role = request.data?.role

    // Create user
    const userRecord = await adminAuth
      .createUser({
        // uid
        email: email,
        emailVerified: false,
        // phoneNumber
        password: 'qZUB-nS3A-1hTw-3B9z',
        displayName: name,
        // photoURL
        disabled: false,
      })
      .catch((error) => {
        logger.error('Error creating new user:', error)
        throw new HttpsError('internal', 'Fehler beim Erstellen des Users.')
      })
    const uid = userRecord.uid

    await adminAuth
      .setCustomUserClaims(uid, { role: role })
      .catch((error) => {
        logger.error('Error setting custom claims:', error)
        throw new HttpsError('internal', 'Fehler beim Setzen der Rolle für den User.')
      })
    logger.log('Successfully created new user:', uid)

    // Create DB Entry for user
    const docRef = adminDB.doc(`users/${uid}`)
    docRef.set({
      email: email,
      name: name,
      role: role,
      createdUserID: request.auth.token.uid,
      createdTimestamp: new Date(),
    })
      .catch((error) => {
        logger.error("Error adding user to DB:", error)
        throw new HttpsError('internal', 'Fehler beim Anlegen des Users in der Datenbank.')
      })
    logger.log('Successfully added user to DB:', uid)

    // retrieve login-token
    const token = await adminAuth
      .createCustomToken(uid)
      // .then((customToken) => customToken)
      .catch((error) => {
        logger.log('Error creating custom token:', error)
        throw new HttpsError('internal', 'Fehler beim Erstellen des Login-Links, der an den User geschickt werden soll.')
      })

    const link = process.env.VITE_SITE_URL + '/sign-in-with-link?token=' + token

    // Send email to user
    const recipient = email
    const info = await sendMail(
      recipient,
      "Willkommen beim SMS",
      mailBody(name, link),
      mailBodyHTML(name, link)
    )
    logger.log("Message sent: ", info.messageId)
    return "User erfolgreich angelegt."
  }
)

exports.verifyEmail = onCall(
  {
    cors: true,
    region: "europe-west3",
  },
  async (request) => {
    // if (request.auth?.token?.role !== 'admin') {
    //   throw new HttpsError('permission-denied', 'Du bist nicht zugangsberechtigt.')
    // }
    // Update auth user
    const uid = request.auth?.token?.uid
    const result = await adminAuth.updateUser(uid, {
      emailVerified: true,
      disabled: false
    })
    .catch((error) => {
      logger.error(error)
      throw new HttpsError('internal', 'E-Mail-Adresse konnte nicht bestätigt werden. Bitte wende dich an sms@stamm-silberfuechse.de.')
    })
    // Update DB Entry for user
    const docRef = adminDB.doc(`users/${uid}`)
    docRef.set({
      emailVerified: true,
      disabled: false
    }, { merge: true })
      .catch((error) => {
        logger.error("Error updating user in DB:", error)
        throw new HttpsError('internal', 'Fehler beim Updaten des Users in der Datenbank.')
      })
    logger.log('Successfully added user to DB:', uid)

    return result
  }
)
