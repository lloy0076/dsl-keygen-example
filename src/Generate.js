import React, { useState } from 'react';
import {
    Button,
    Card, CardBody, CardTitle,
} from 'reactstrap';

export default function Generate() {
    const privateKey = localStorage.getItem('private_key') || '';
    const publicKey = localStorage.getItem('public_key') || '';

    const [formValue, setFormValue] = useState({ privateKey, publicKey });

    function generateKeyPair() {
        const { crypto } = window;

        crypto.subtle.generateKey(
            {
                name: 'RSA-OAEP',
                modulusLength: 4096,
                // i.e. 65537
                publicExponent: new Uint8Array([1, 0, 1]),
                hash: 'SHA-256',
            },
            true,
            ['encrypt', 'decrypt', 'verify', 'sign'],
        ).then((keyPair) => {
            console.log(keyPair.privateKey);
        });
    }

    return (
        <div>
            <h1>Generate Key Pair</h1>

            <Card>
                <CardBody>
                    <CardTitle><span style={{ fontWeight: 'bolder' }}>Public Key</span></CardTitle>
                    <pre>
                        {formValue.publicKey}
                    </pre>
                </CardBody>
            </Card>

            <br/>

            <Card>
                <CardBody>
                    <CardTitle><span style={{ fontWeight: 'bolder' }}>Private Key</span></CardTitle>
                    <pre>
                        {formValue.privateKey}
                    </pre>
                </CardBody>
            </Card>

            <br/>

            <Button color={'success'} onClick={generateKeyPair}>Generate Key Pair</Button>
        </div>
    );
}
