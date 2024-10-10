const createUser = require("./createUser")
exports.createUserWithLink = createUser.createUserWithLink
exports.verifyEmail = createUser.verifyEmail

const resize = require("./resize")
exports.resizeMemberAvatar = resize.resizeMemberAvatar

const mediaSigner = require("./mediaSigner")
exports.getSignedMediaURL = mediaSigner.getSignedMediaURL

const users = require("./users/users")
exports.updateUser = users.updateUser

const sendUserPasswordEmail = require("./users/sendUserPasswordEmail")
exports.sendUserPasswordEmail = sendUserPasswordEmail.sendUserPasswordEmail

const calendar = require("./calendar")
// exports.getEvents = calendar.getEvents
// exports.getEvent = calendar.getEvent
exports.createGEvent = calendar.createGEvent
exports.updateGEvent = calendar.updateGEvent
exports.deleteGEvent = calendar.deleteGEvent
// exports.onCreateEvent = calendar.onCreateEvent
// exports.onUpdateEvent = calendar.onUpdateEvent
// exports.onDeleteEvent = calendar.onDeleteEvent

const sendMail = require("./mail/sendMail")
exports.sendNewsletter = sendMail.sendNewsletter
