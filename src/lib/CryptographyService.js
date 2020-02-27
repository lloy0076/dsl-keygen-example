/**
 * A holder for cryptographic methods.
 *
 * Currently implemented methods include:
 *
 * - Key generation for signatures
 * - Signature creation
 * - Signature verification
 * .
 *
 * @todo Figure out how to use TextEncode & TextDecode.
 */
export default class CryptographyService {
    /**
     * Turn a buffer into a string.
     *
     * @param buf
     * @returns {string}
     */
    static a2str(buf) {
        return String.fromCharCode.apply(null, new Uint8Array(buf));
    }

    /**
     * Convert a string into an ArrayBuffer.
     *
     * - from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
     *
     * @param str
     * @returns {ArrayBuffer}
     */
    static str2ab(str) {
        const buf = new ArrayBuffer(str.length);
        const bufView = new Uint8Array(buf);
        for (let i = 0, strLen = str.length; i < strLen; i++) {
            bufView[i] = str.charCodeAt(i);
        }
        return buf;
    }

    /**
     * Makes a PEM header.
     *
     * @param type
     * @returns {string}
     */
    static makePemHeader(type = 'PRIVATE KEY') {
        return `-----BEGIN ${type}-----`;
    }

    /**
     * Makes a PEM footer.
     *
     * @param type
     * @returns {string}
     */
    static makePemFooter(type = 'PRIVATE KEY') {
        return `-----END ${type}-----`;
    }

    /**
     * Construct a PEM formatted string from the given key, as bytes.
     *
     * @param key
     * @param type
     * @returns {{key: string}}
     */
    static makePem(key, type = 'PRIVATE KEY') {
        const exportedAsString = CryptographyService.a2str(key);
        const exportedAsBase64 = btoa(exportedAsString);

        const start = CryptographyService.makePemHeader(type);
        const end = CryptographyService.makePemFooter(type);

        const pem = { key: start + exportedAsBase64 + end };

        return pem;
    }

    /**
     * Gets the PEM contents as an array buffer.
     *
     * @param type
     * @returns {ArrayBuffer}
     */
    static getPemContentsAsBuffer(pem, type = 'PRIVATE KEY') {
        // fetch the part of the PEM string between header and footer
        const pemHeader = CryptographyService.makePemHeader(type);
        const pemFooter = CryptographyService.makePemFooter(type);
        const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);

        // base64 decode the string to get the binary data
        const binaryDerString = atob(pemContents);
        // convert from a binary string to an ArrayBuffer
        const binaryDer = CryptographyService.str2ab(binaryDerString);

        return binaryDer;
    }

    /**
     * Converts a buffer to hex.
     *
     * @param buf
     * @returns {string}
     */
    static buf2hex(buf) { // buffer is an ArrayBuffer
        return Array.prototype.map.call(new Uint8Array(buf), x => ('00' + x.toString(16)).slice(-2)).join('');
    }

    /**
     * Imports a verification key.
     *
     * @note This is the public key.
     *
     * @param pem
     * @param algo
     * @param modulus
     * @returns {PromiseLike<CryptoKey>}
     */
    static importVerificationKey(pem, algo = 'RSASSA-PKCS1-v1_5', modulus = 4096) {
        const binaryDer = CryptographyService.getPemContentsAsBuffer(pem, 'PUBLIC KEY');

        return crypto.subtle.importKey(
            'spki',
            binaryDer,
            {
                name: algo,
                modulusLength: modulus,
                // i.e. 65537
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256',
            },
            true,
            ['verify'],
        );
    }

    /**
     * Imports a signing key.
     *
     * @note This is the private key.
     *
     * @param pem
     * @param algo
     * @param modulus
     * @returns {PromiseLike<CryptoKey>}
     */
    static importSigningKey(pem, algo = 'RSASSA-PKCS1-v1_5', modulus = 4096) {
        const binaryDer = CryptographyService.getPemContentsAsBuffer(pem, 'PRIVATE_KEY');

        return crypto.subtle.importKey(
            'pkcs8',
            binaryDer,
            {
                name: algo,
                modulusLength: modulus,
                // i.e. 65537
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256',
            },
            true,
            ['sign'],
        );
    }

    /**
     * Generates a key suitable for signing.
     *
     * @param algo
     * @param modulus
     * @returns {Promise<{privateKey: ArrayBuffer, publicKey: ArrayBuffer}|{error: *}>}
     */
    static async generateSignatureKeyPair(algo = 'RSASSA-PKCS1-v1_5', modulus = 4096) {
        try {
            const keyPair = await crypto.subtle.generateKey(
                {
                    name: algo,
                    modulusLength: modulus,
                    // i.e. 65537
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: 'SHA-256',
                },
                true,
                ['sign', 'verify'],
            );

            const privateKey = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
            const publicKey = await crypto.subtle.exportKey('spki', keyPair.publicKey);

            return { privateKey, publicKey };
        } catch (error) {
            console.error(error);
            return { error };
        }
    }

    /**
     * Signs the data, given the private key.
     *
     * @param data
     * @param privateKey
     * @param algo
     * @returns {Promise<string>}
     */
    static async sign(data, privateKey, algo = 'RSASSA-PKCS1-v1_5') {
        const encodedData = CryptographyService.str2ab(data);

        const signature = await crypto.subtle.sign(algo, privateKey, encodedData);
        const signatureAsString = CryptographyService.a2str(signature);
        const signatureAsBase64 = btoa(signatureAsString);

        return signatureAsBase64;
    }
}
