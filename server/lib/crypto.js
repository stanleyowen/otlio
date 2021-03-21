const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const secretKey = process.env.SECRET_KEY;
const iv = crypto.randomBytes(16);

const encrypt = (text) => {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey), iv);
    let encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return { iv: iv.toString('hex'), data: encrypted.toString('hex') };
}
   
const decrypt = (hash) => {
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey), Buffer.from(hash.iv, 'hex'));
    let decrypted = Buffer.concat([decipher.update(Buffer.from(hash.data, 'hex')), decipher.final()]);;
    return decrypted.toString();
}

module.exports = { encrypt, decrypt };