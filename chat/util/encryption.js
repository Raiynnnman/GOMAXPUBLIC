var CryptoJS = require("crypto-js");

class CryptographyService {
  constructor() { }
 
  //The set method is use for encrypt the value.
  set(keys, value){
    var key = CryptoJS.enc.Utf8.parse(keys);
    var iv = CryptoJS.enc.Utf8.parse(keys);
    var encrypted = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(value.toString()), key,
    {
        keySize: 128 / 8,
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
    });
    g = encrypted.toString();

    return g
  }

  //The get method is use for decrypt the value.
  get(keys, value) {
    var ct = CryptoJS.enc.Base64.parse(value);
    var iv = ct.clone();
    iv.sigBytes = 16;
    iv.clamp();
    ct.words.splice(0, 4);
    ct.sigBytes -= 16;
    var key = CryptoJS.enc.Utf8.parse(keys);

    var dec = CryptoJS.AES.decrypt(
      // @ts-expect-error
      {ciphertext: ct}, 
      key, 
      {
        iv: iv,
        mode: CryptoJS.mode.CFB,
        padding: CryptoJS.pad.Pkcs7
      });

    var g = dec.toString(CryptoJS.enc.Utf8);    
    return g;
  }

}

module.exports = CryptographyService
