const crypto = require('crypto')
const algorithm = 'aes-256-cbc'
const iv = crypto.randomBytes(16)

const encrypt = (text, method) => {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(eval(`process.env.SECRET_KEY_${method}`)), iv)
    let encrypted = Buffer.concat([cipher.update(text), cipher.final()])
    return { iv: iv.toString('hex'), data: encrypted.toString('hex') }
}

const decrypt = (hash, method) => {
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(eval(`process.env.SECRET_KEY_${method}`)), Buffer.from(hash.iv, 'hex'))
    let decrypted = Buffer.concat([decipher.update(Buffer.from(hash.data, 'hex')), decipher.final()])
    return decrypted.toString()
}

module.exports = { encrypt, decrypt }