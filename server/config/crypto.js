const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const scretKey = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);

const encrypt = async (text) =>  {
    let cipher = crypto.createCipheriv(algorithm, Buffer.from(scretKey), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return { iv: iv.toString('hex'), content: encrypted.toString('hex') };
}
   
const decrypt = (text, iv) => {
    let encryptedText = Buffer.from(text, 'hex');
    let decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(scretKey), Buffer.from(iv, 'hex'));
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
}
   

var hw = encrypt("Some serious stuff")
console.log(Buffer.from(hw.iv, 'hex'))
console.log(decrypt(hw, hw.iv))

module.exports = { encrypt, decrypt };