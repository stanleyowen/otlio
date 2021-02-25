const crypto = require('crypto');
const algorithm = 'aes-256-ctr';
const secretKey = process.env.SECRET_KEY;
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return {
        iv: iv.toString('hex'),
        content: encrypt.toString('hex')
    }
}

const decrypt = (hash) => {
    const dechiper = crypto.createCipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'));
    const decrypted = Buffer.concat([dechiper.update(Buffer.from(hash.content, 'hex')), dechiper.final()]);
    return decrypted.toString();
}

module.exports = { encrypt, decrypt };