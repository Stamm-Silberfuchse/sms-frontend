const { logger } = require("firebase-functions")

exports.getEmulatorDownloadURL = async (bucket, filePath) => {
  // fetch a new download token
  logger.log(bucket, filePath)
  const tokenGenerationFetch = await fetch(
      `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${bucket}/o/${encodeURIComponent(
          filePath,
      )}?create_token=true`,
      {
          method: 'POST',
          headers: {
              Authorization: 'Bearer owner',
          },
      },
  )
  const downloadTokens = await tokenGenerationFetch.json()
  const downloadToken = downloadTokens.split(',')[0]

  // manually construct the emulator download url
  return `http://${process.env.FIREBASE_STORAGE_EMULATOR_HOST}/v0/b/${bucket}/o/${encodeURIComponent(
      filePath,
  )}?alt=media&token=${downloadToken}`
}
