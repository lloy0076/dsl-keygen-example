/**
 * Copyright 2020 David S. Lloyd <lloy0076@adam.com.au>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React, { useState } from 'react';

import {
    Button,
    Card, CardBody, CardText, CardTitle,
    Form, FormGroup,
} from 'reactstrap';

import CryptographyService from './lib/CryptographyService';

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

    const [privateKey, setPrivateKey] = useState(initialPrivateKey);
    const [publicKey, setPublicKey] = useState(initialPublicKey);

    function handleChange(e) {
        switch (e.target.id) {
        case 'privateKey':
            setPrivateKey(e.target.value);
            break;
        case 'publicKey':
            setPublicKey(e.target.value);
            break;
        default:
            throw new Error(`Got unknown change event from ${e.target.id}.`);
        }
    }

    function generateKeyPair() {
        setPublicKey('<generating>');
        setPrivateKey('<generating>');

        CryptographyService.generateSignatureKeyPair().then((keys) => {
            const { publicKey: generatedPublicKey, privateKey: generatedPrivateKey } = keys;

            const privateKeyPem = CryptographyService.makePem(generatedPrivateKey);
            localStorage.setItem('private_key', JSON.stringify(privateKeyPem));
            setPrivateKey(privateKeyPem.key);

            const publicKeyPem = CryptographyService.makePem(generatedPublicKey, 'PUBLIC KEY');
            localStorage.setItem('public_key', JSON.stringify(publicKeyPem));
            setPublicKey(publicKeyPem.key);

            // Immediately import to check for any errors.
            CryptographyService.importSigningKey(privateKeyPem.key).catch((error) => {
                console.error('Error importing key to sign.', error);
                throw error;
            });

            CryptographyService.importVerificationKey(publicKeyPem.key).catch((error) => {
                console.error('Error importing key to verify.', error);
                throw error;
            });
        });
    }

    return (
        <div>
            <h1>Generate Key Pair</h1>

            <Card>
                <CardBody>
                    <CardTitle><span style={{ fontWeight: 'bolder' }}>Private Key</span></CardTitle>
                    <Form>
                        <FormGroup>
                            <textarea name={'privateKey'} id={'privateKey'} value={privateKey} cols={64} rows={10}
                                onChange={handleChange}>
                            </textarea>
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>

            <br/>

            <Card>
                <CardBody>
                    <CardTitle><span style={{ fontWeight: 'bolder' }}>Public Key</span></CardTitle>
                    <Form>
                        <FormGroup>
                            <textarea name={'publickKey'} id={'publickKey'} value={publicKey} cols={64} rows={10}
                                onChange={handleChange}>
                            </textarea>
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>

            <br/>

            <Button color={'secondary'} disabled={true}>Import Key Pair</Button>&nbsp;
            <Button className={'float-right'} color={'primary'} onClick={generateKeyPair}>Generate Key Pair</Button>
        </div>
    );
}
