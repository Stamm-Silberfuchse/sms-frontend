const { logger } = require("firebase-functions")

const { getFirestore } = require("firebase-admin/firestore")
const { getStorage, getDownloadURL } = require("firebase-admin/storage")
const { onObjectFinalized } = require("firebase-functions/v2/storage")
const sharp = require("sharp")
const path = require("path")
const { format } = require('date-fns')


exports.resizeMemberAvatar = onObjectFinalized(
  {
    region: "europe-west3",
    cpu: 1
  },
  async (event) => {
    const fileBucket = event.data.bucket
    const filePath = event.data.name
    const contentType = event.data.contentType
    const metadata = event.data?.metadata
    const memberID = metadata?.memberID
    const userID = metadata?.userID

    const date = format(new Date(), 'yyyy-MM-dd-HH-mm-ss')

    if (!contentType.startsWith("image/")) {
      logger.log("This is not an image.")
      return
    }

    // Exit if the image is already a thumbnail.
    const fileName = path.basename(filePath)
    if (fileName.includes('_thumb@')) {
      return logger.log("Already a Thumbnail.")
    }

    const storage = getStorage()
    const bucket = storage.bucket(fileBucket)
    const downloadResponse = await bucket.file(filePath).download()
    const imageBuffer = downloadResponse[0]

    const thumbnailBuffer = await sharp(imageBuffer).resize({
      width: 200,
      height: 200,
      withoutEnlargement: true,
    }).webp({quality: 100}).toBuffer();

    const thumbFile = bucket.file(`memberAvatars/${memberID}_${date}_thumb@200.webp`)
    await thumbFile.save(thumbnailBuffer, {
      metadata: {
        contentType: 'image/webp'
      }
    })

    // Update db with new avatar URL
    const publicURL = thumbFile.publicUrl()
    const db = getFirestore()
    const docRef = db.collection('members').doc(memberID)
    docRef.set({
      PHOTO_URL: publicURL,
      updatedTimestamp: new Date(),
      updatedUserID: userID
    }, { merge: true })
      .catch((error) => {
        logger.error("Error writing memberAvatar to DB:", error)
        throw new HttpsError('internal', 'Fehler beim Aktualisieren der Datenbank.')
      })
    // return "Foto erfolgreich hochgeladen."
  }
)
