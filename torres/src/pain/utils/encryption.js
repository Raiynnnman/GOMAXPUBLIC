
import cryptoKey from './../../cryptoKey.js';
import { AES, enc } from 'crypto-js';

export const encryptData = function(text) {
    var key = cryptoKey();
    const data = AES.encrypt(
      text,
      key
    ).toString();

    return data;
}
export const decryptData = function(text) {
    var key = cryptoKey();
    const data = AES.decrypt(
      text,
      key
    ).toString(enc.Utf8);
    return data;
}

export const generateUUID = function() { 
    var d = new Date().getTime();
    var d2 = ((typeof performance !== 'undefined') && performance.now && (performance.now()*1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16;//random number between 0 and 16
        if(d > 0){//Use timestamp until depleted
            r = (d + r)%16 | 0;
            d = Math.floor(d/16);
        } else {//Use microseconds since page-load if supported
            r = (d2 + r)%16 | 0;
            d2 = Math.floor(d2/16);
        }
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
}
