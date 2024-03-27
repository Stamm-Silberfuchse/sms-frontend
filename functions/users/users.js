const { logger } = require("firebase-functions")
const { onCall, HttpsError } = require("firebase-functions/v2/https")

const { initializeApp, getApps, getApp } = require("firebase-admin/app")
const { getAuth } = require("firebase-admin/auth")
const { getFirestore } = require("firebase-admin/firestore")

require('dotenv').config()

const adminApp = getApps().length === 0 ? initializeApp() : getApp()
const adminAuth = getAuth(adminApp)
const adminDB = getFirestore(adminApp)

exports.updateUser = onCall(
  {
    cors: true,
    region: "europe-west3",
  },
  async (request) => {
    if (!['admin', 'stafue'].includes(request.auth?.token?.role)) {
      throw new HttpsError('permission-denied', 'Userdaten dürfen nur von Admins oder der Stammesführung geändert werden.')
    }
    // Update auth user
    const uid = request.data?.uid
    const payload = request.data?.payload
    const result = await adminAuth.updateUser(uid, payload)
      .catch((error) => {
        logger.error(error)
        throw new HttpsError('internal', `Userdaten konnten nicht geändert werden. Bitte wende dich an sms@stamm-silberfuechse.de.`)
      })
    // Update DB entry for user
    const docRef = adminDB.doc(`users/${uid}`)
    docRef.set(payload, { merge: true })
      .catch((error) => {
        logger.error("Error updating user in DB:", error)
        throw new HttpsError('internal', 'Fehler beim Updaten des Users in der Datenbank.')
      })
    logger.log(`Successfully changed userdata in DB:`, uid)

    return result
  }
)
