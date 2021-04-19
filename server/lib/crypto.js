const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const secretKey1 = process.env.SECRET_KEY_1;
const secretKey2 = process.env.SECRET_KEY_2;
const iv = crypto.randomBytes(16);

const encrypt = (text, method) => {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(String(method) === '1' ? secretKey1 : secretKey2), iv);
    let encrypted = Buffer.concat([cipher.update(text), cipher.final()]);
    return { iv: iv.toString('hex'), data: encrypted.toString('hex') };
}
   
const decrypt = (hash, method) => {
    let decipher = crypto.createDecipheriv(algorithm, Buffer.from(String(method) === '1' ? secretKey1 : secretKey2), Buffer.from(hash.iv, 'hex'));
    let decrypted = Buffer.concat([decipher.update(Buffer.from(hash.data, 'hex')), decipher.final()]);;
    return decrypted.toString();
}

module.exports = { encrypt, decrypt };