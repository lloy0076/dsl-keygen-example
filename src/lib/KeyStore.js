export default class KeyStore {
    static refreshFromStorage() {
        let privateKey;
        let publicKey;

        const storedPrivateKey = localStorage.getItem('private_key');

        if (storedPrivateKey) {
            try {
                const parsed = JSON.parse(storedPrivateKey);
                privateKey = parsed.key;
            } catch (error) {
                console.error('Error parsing private key', error);
            }
        }

        const storedPublicKey = localStorage.getItem('public_key');

        if (storedPublicKey) {
            try {
                const parsed = JSON.parse(storedPublicKey);
                publicKey = parsed.key;
            } catch (error) {
                console.error('Error parsing public key', error);
            }
        }

        return { privateKey, publicKey };
    }
}
