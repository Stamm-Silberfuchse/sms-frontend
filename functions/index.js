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
