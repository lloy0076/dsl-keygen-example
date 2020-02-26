import React, { useState } from 'react';
import {
    Button,
    Card, CardBody, CardTitle,
} from 'reactstrap';

export default function Generate() {
    let initialPrivateKey = '';
    let initialPublicKey = '';

    const storedPrivateKey = localStorage.getItem('private_key');

    if (storedPrivateKey) {
        try {
            const parsed = JSON.parse(storedPrivateKey);
            initialPrivateKey = parsed.key;
        } catch (error) {
            console.error('Error parsing private key', error);
        }
    }

    const storedPublicKey = localStorage.getItem('public_key');

    if (storedPublicKey) {
        try {
            const parsed = JSON.parse(storedPublicKey);
            initialPublicKey = parsed.key;
        } catch (error) {
            console.error('Error parsing public key', error);
        }
    }

    let [privateKey, setPrivateKey] = useState(initialPrivateKey);
    let [publicKey, setPublicKey] = useState(initialPublicKey);

    function generateKeyPair() {
        const { crypto } = window;

        function a2str(buf) {
            return String.fromCharCode.apply(null, new Uint8Array(buf));
        }

        function str2ab(str) {
            const buf = new ArrayBuffer(str.length);
            const bufView = new Uint8Array(buf);
            for (let i = 0, strLen = str.length; i < strLen; i++) {
                bufView[i] = str.charCodeAt(i);
            }
            return buf;
        }

        function importPrivateKey(pem) {
            // fetch the part of the PEM string between header and footer
            const pemHeader = '-----BEGIN PRIVATE KEY-----';
            const pemFooter = '-----END PRIVATE KEY-----';
            const pemContents = pem.substring(pemHeader.length, pem.length - pemFooter.length);
            // base64 decode the string to get the binary data
            const binaryDerString = atob(pemContents);
            // convert from a binary string to an ArrayBuffer
            const binaryDer = str2ab(binaryDerString);

            crypto.subtle.digest('SHA-256', binaryDer).then((result) => console.log(btoa(result)));

            return crypto.subtle.importKey(
                'pkcs8',
                binaryDer,
                {
                    name: 'RSASSA-PKCS1-V1_5',
                    modulusLength: 4096,
                    // i.e. 65537
                    publicExponent: new Uint8Array([1, 0, 1]),
                    hash: 'SHA-256',
                },
                true,
                ['encrypt', 'decrypt', 'verify', 'sign'],
            );
        }

        crypto.subtle.generateKey(
            {
                name: 'RSASSA-PKCS1-V1_5',
                modulusLength: 4096,
                // i.e. 65537
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256',
            },
            true,
            ['encrypt', 'decrypt', 'verify', 'sign'],
        ).then((keyPair) => {
            crypto.subtle.exportKey('pkcs8', keyPair.privateKey).then(
                (key) => {
                    crypto.subtle.digest('SHA-256', key).then((result) => console.log(btoa(result)));

                    const exportedAsString = a2str(key);
                    const exportedAsBase64 = btoa(exportedAsString);

                    const exported = {
                        key: `-----BEGIN PRIVATE KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`,
                    };

                    localStorage.setItem('private_key', JSON.stringify(exported));

                    setPrivateKey(exported.key);

                    console.log('Attempting to import key', exported);

                    importPrivateKey(exported.key).then((result) => {
                        console.log('Import went OK.');
                    }).catch((error) => console.trace(error));
                },
            ).catch((error) => console.error(error));

            crypto.subtle.exportKey('spki', keyPair.publicKey).then(
                (key) => {
                    const exportedAsString = a2str(key);

                    const exportedAsBase64 = btoa(exportedAsString);
                    const exported = {
                        key: `-----BEGIN PUBLIC KEY-----\n${exportedAsBase64}\n-----END PRIVATE KEY-----`,
                    };

                    localStorage.setItem('public_key', JSON.stringify(exported));

                    setPublicKey(exported.key);
                },
            ).catch((error) => console.error(error));
        });
    }

    return (
        <div>
            <h1>Generate Key Pair</h1>

            <Card>
                <CardBody>
                    <CardTitle><span style={{ fontWeight: 'bolder' }}>Private Key</span></CardTitle>
                    <pre>
                        {privateKey}
                    </pre>
                </CardBody>
            </Card>

            <br/>

            <Card>
                <CardBody>
                    <CardTitle><span style={{ fontWeight: 'bolder' }}>Public Key</span></CardTitle>
                    <pre>
                        {publicKey}
                    </pre>
                </CardBody>
            </Card>

            <br/>

            <Button color={'success'} onClick={generateKeyPair}>Generate Key Pair</Button>
        </div>
    );
}
