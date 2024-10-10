const { logger } = require("firebase-functions")
const { onCall, HttpsError } = require("firebase-functions/v2/https")

const { initializeApp, getApps, getApp } = require("firebase-admin/app")
const { getAuth } = require("firebase-admin/auth")
const { getFirestore } = require("firebase-admin/firestore")

const { sendMail } = require('./mailer')

const mjml2html = require('mjml')

require('dotenv').config()

const adminApp = getApps().length === 0 ? initializeApp() : getApp()
const adminDB = getFirestore(adminApp)

exports.sendNewsletter = onCall(
  {
    cors: true,
    region: "europe-west3",
  },
  async (request) => {
    if (request.auth?.token?.role !== 'admin') {
      throw new HttpsError('permission-denied', 'Nur Administratoren dürfen Newsletter versenden.')
    }
    const mailID = request.data?.mailID
    const bodyMJML = request.data?.bodyMJML

    const docRef = adminDB.doc(`mails/${mailID}`)
    const email = await docRef.get()
      .catch((error) => {
        logger.error("Error fetching mail from DB:", error)
        throw new HttpsError('internal', 'Fehler beim Laden der E-Mail.')
      })
    const recipientMemberIDs = request.data?.recipientMemberIDs
    const subject = email.data().subject
    const body = email.data().body
    const attachments = email.data().uploadedFiles?.map((att) => {
      return {
        filename: att.name,
        path: att.url,
      }
    })

    let recipients = []

    const bodyHTML = mjml2html(bodyMJML).html

    for (const memberID of recipientMemberIDs) {
      // add the member's email addresses
      const memberDocRef = await adminDB.doc(`members/${memberID}`).get()
      const member = memberDocRef.data()
      if (member.EMAIL) {
        recipients.push(member.EMAIL)
      }
      // get the users connected to the member
      const relDocRef = await adminDB.collection('rel_users_members').where('memberID', '==', memberID).get()
      for (const doc of relDocRef.docs) {
        const userID = doc.data().userID
        // get the user's email addresses
        const userDocRef = await adminDB.doc(`users/${userID}`).get()
        const emails = userDocRef.data().emailAddresses
        for (const email of emails) {
          if (email.newsletter) {
            recipients.push(email.address)
          }
        }
      }
    }

    const result = await sendMail(
      process.env.DEFAULT_RECIPIENT,
      subject,
      body,
      bodyHTML,
      attachments,
      [...new Set(recipients)]
    )
    return "Mails versandt."
  }
)
