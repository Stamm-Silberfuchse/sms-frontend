
const { onCall, HttpsError } = require("firebase-functions/v2/https")

exports.getSignedMediaURL = onCall(
  {
    cors: true,
    region: "europe-west3"
  },
  async (request) => {
    if (!request.auth || !request.auth.token || !request.auth.token.uid) {
      throw new HttpsError('permission-denied', 'You must be authenticated.')
    }
    const bucket = request.body.bucket
    const filePath = request.body.filePath
    // fetch a new download token
    logger.log(bucket, filePath)
    return 'HALLO'

  }
)
