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
 * The default algorithm is RSASSA-PKCS1-v1_5; although provision is made for other algorithms, some of the options
 * may not be easy to use (specifically RSASSA-PSS needs a salt length and that is not able to be passed).
 *
 * Messages are encoded using `str2ab` and decoded using `a2str`. These methods convert from characters to array
 * buffers.
 *
 * @note I attempted to use the TextEncode and TextDecode classes but I couldn't figure out how to make them play
 * nicely.
 *
 * Signatures are expected to be encoded as `hex` and are encoded/decoded using `buf2hex` and `hex2buf`.
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
        // eslint-disable-next-line no-plusplus
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

        // We need to strip out any new line characters as this confuses things.
        const pemStripped = pem.replace(/(\r\n|\n|\r)/gm, "");
        const pemContents = pemStripped.substring(pemHeader.length, pemStripped.length - pemFooter.length);

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
        return Array.prototype.map.call(new Uint8Array(buf), (x) => (`00${x.toString(16)}`).slice(-2)).join('');
    }

    /**
     * Convert a hex string to an ArrayBuffer.
     *
     * @param {string} hexString - hex representation of bytes
     * @return {ArrayBuffer} - The bytes in an ArrayBuffer.
     */
    static hex2buf(hex) {
        // remove the leading 0x
        const hexString = hex.replace(/^0x/, '');

        // ensure even number of characters
        if (hexString.length % 2 !== 0) {
            throw new Error('WARNING: expecting an even number of characters in the hexString');
        }

        // check for some non-hex characters
        const bad = hexString.match(/[G-Z\s]/i);
        if (bad) {
            throw new Error(`WARNING: found non-hex characters: ${JSON.stringify(bad)}`);
        }

        // split the string into pairs of octets
        const pairs = hexString.match(/[\dA-F]{2}/gi);

        if (!pairs) {
            const empty = new Uint8Array();
            return empty.buffer;
        }

        // convert the octets to integers
        const integers = pairs.map((s) => {
            return parseInt(s, 16);
        });

        const array = new Uint8Array(integers);

        return array.buffer;
    }

    /**
     * Gets the known digest methods.
     *
     * @returns {{}}
     */
    static getKnownDigestTypes() {
        const knownDigests = {};
        const bits = [1, 256, 384, 512];

        bits.forEach((value) => {
            knownDigests[`sha${value}`] = `SHA-${value}`;
            knownDigests[`sha-${value}`] = `SHA-${value}`;
            knownDigests[`SHA${value}`] = `SHA-${value}`;
            knownDigests[`SHA-${value}`] = `SHA-${value}`;
        });

        return knownDigests;
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
     * @param algo The signature algorithm.
     * @param enc The signature encoding.
     * @returns {Promise<string>}
     */
    static async sign(data, privateKey, algo = 'RSASSA-PKCS1-v1_5', enc = 'hex') {
        const encodedData = CryptographyService.str2ab(data);

        const signature = await crypto.subtle.sign(algo, privateKey, encodedData);

        let encodedSignature;
        let signatureAsString;
        switch (enc) {
        case 'base64':
            signatureAsString = CryptographyService.a2str(signature);
            encodedSignature = btoa(signatureAsString);
            break;
        case 'hex':
            encodedSignature = CryptographyService.buf2hex(signature);
            break;
        default:
            throw new Error(`Unknown signature encoding during verify ${enc}`);
        }

        return encodedSignature;
    }

    /**
     * Signs the data, given the private key.
     *
     * @param data
     * @param publicKey
     * @param algo The signature algorithm.
     * @param enc The signature encoding.
     * @returns {Promise<boolean>}
     */
    static async verify(publicKey, signature, data, algo = 'RSASSA-PKCS1-v1_5', enc = 'hex') {
        const encodedData = CryptographyService.str2ab(data);

        let decodedSignature;
        let decodedSignatureBytes;
        try {
            switch (enc) {
            case 'base64':
                decodedSignatureBytes = atob(signature);
                decodedSignature = CryptographyService.str2ab(decodedSignatureBytes);
                break;
            case 'hex':
                decodedSignature = CryptographyService.hex2buf(signature);
                break;
            default:
                throw new Error(`Unknown signature encoding during verify ${enc}`);
            }
        } catch (error) {
            console.warn(error);
            return false;
        }

        const result = await crypto.subtle.verify(algo, publicKey, decodedSignature, encodedData);

        return result;
    }

    /**
     * Generates and returns the digest.
     *
     * @param data
     * @param algo
     * @param enc
     * @returns {Promise<string>}
     */
    static async digest(data, algo = 'sha256', enc = 'hex') {
        const knownDigests = CryptographyService.getKnownDigestTypes();

        const encodedData = CryptographyService.str2ab(data);
        const digest = await crypto.subtle.digest(knownDigests[algo], encodedData);

        let encodedDigest;
        let digestAsString;
        switch (enc) {
        case 'base64':
            digestAsString = CryptographyService.a2str(digest);
            encodedDigest = btoa(digestAsString);
            break;
        case 'hex':
            encodedDigest = CryptographyService.buf2hex(digest);
            break;
        default:
            throw new Error(`Unknown digest encoding during digest ${enc}`);
        }

        return encodedDigest;
    }

    /**
     * Generates and returns the digest.
     *
     * @note This exists for those who prefer to call this `hash`.
     *
     * @param data
     * @param algo
     * @param enc
     * @returns {Promise<string>}
     */
    static async hash(data, algo = 'sha256', enc = 'hex') {
        return CryptographyService.digest(data, algo, enc);
    }

    /**
     * Implement a timing safe equals.
     *
     * @note This "leaks" that the byte lengths are different HOWEVER the user can already determine this themselves
     * so this is not a security issue.
     *
     * @param left
     * @param right
     * @returns {boolean}
     */
    static timingSafeEqual(left, right) {
        const leftArrayBuf = left instanceof Object ? left : CryptographyService.str2ab(left);
        const rightArrayBuf = right instanceof Object ? right : CryptographyService.str2ab(right);

        if (leftArrayBuf instanceof ArrayBuffer && rightArrayBuf instanceof ArrayBuffer) {
            // If they're of different lengths, we know they're not the same; I don't think timing matters in this case.
            if (leftArrayBuf.byteLength !== rightArrayBuf.byteLength) {
                return false;
            }

            const leftArrayBufView = new DataView(leftArrayBuf);
            const rightArrayBufView = new DataView(rightArrayBuf);

            const len = leftArrayBufView.byteLength;
            let out = 0;
            let i = -1;

            // eslint-disable-next-line no-plusplus
            while (++i < len) {
                // eslint-disable-next-line no-bitwise
                out |= leftArrayBufView.getUint8(i) ^ rightArrayBufView.getUint8(i);
            }

            return out === 0;
        }

        throw new Error('Expected two array buffers.');
    }
}
