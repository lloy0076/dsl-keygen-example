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
    Card, CardBody, CardTitle,
    Form, FormGroup,
} from 'reactstrap';

import CryptographyService from './lib/CryptographyService';
import KeyStore from './lib/KeyStore';

export default function Generate() {
    const { privateKey: initialPrivateKey, publicKey: initialPublicKey} = KeyStore.refreshFromStorage();

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
        });
    }

    function importKeys() {
        try {
            // Immediately import to check for any errors.
            CryptographyService.importSigningKey(privateKey).then((key) => {
                console.log('Importing private signing key.', key);
                localStorage.setItem('private_key', JSON.stringify({ key: privateKey }));
                setPrivateKey(privateKey);
            }).catch((error) => {
                console.error('Error importing key to sign.', error);
            });

            CryptographyService.importVerificationKey(publicKey).then((key) => {
                console.log('Importing public verification key.', key);
                localStorage.setItem('public_key', JSON.stringify({ key: publicKey }));
                setPublicKey(publicKey);
            }).catch((error) => {
                console.error('Error importing key to verify.', error);
            });
        } catch (error) {
            console.error(error);
        }
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
                            <textarea name={'publicKey'} id={'publicKey'} value={publicKey} cols={64} rows={10}
                                onChange={handleChange}>
                            </textarea>
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>

            <br/>

            <Button color={'secondary'} onClick={importKeys}>Import Key Pair</Button>&nbsp;
            <Button className={'float-right'} color={'primary'} onClick={generateKeyPair}>Generate Key Pair</Button>
        </div>
    );
}
