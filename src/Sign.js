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
import KeyStore from './lib/KeyStore';

export default function Sign() {
    const { privateKey } = KeyStore.refreshFromStorage();

    const initialText = localStorage.getItem('text');
    const initialSignature = localStorage.getItem('signature');

    const [formValue, setFormValue] = useState({ text: initialText, signature: initialSignature });

    function handleChange(e) {
        const newValue = { ...formValue, ...{ [e.target.id]: e.target.value } };
        localStorage.setItem('text', e.target.value);

        setFormValue(newValue);
    }

    async function handleSign() {
        CryptographyService.importSigningKey(privateKey).then(async (signingKey) => {
            const signature = await CryptographyService.sign(formValue.text, signingKey);

            localStorage.setItem('signature', signature);
            const newValue = { ...formValue, ...{ signature: signature } };
            setFormValue(newValue);
        }).catch((error) => console.error(error));
    }

    function handleFill() {
        const howMany = Math.ceil(Math.random() * 512) + 32;
        const bytes = new Uint8Array(howMany);
        crypto.getRandomValues(bytes);

        const bytesAsString = CryptographyService.a2str(bytes);
        const bytesAsBase64 = btoa(bytesAsString);

        localStorage.setItem('text', bytesAsBase64);
        localStorage.setItem('signature', '');
        setFormValue({ text: bytesAsBase64, signature: '' });
    }

    return (
        <div>
            <h1>Sign</h1>

            <Card>
                <CardBody>
                    <CardTitle><span style={{ fontWeight: 'bolder' }}>Text to Sign</span></CardTitle>
                    <Form>
                        <FormGroup>
                            <textarea name={'text'} id={'text'}
                                value={formValue.text || ''} onChange={handleChange}
                                cols={64} rows={10}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Button className={'float-left'} color={'secondary'} onClick={handleFill}>Fill</Button>
                            <Button className={'float-right'} color={'primary'} onClick={handleSign}>Sign</Button>
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>

            <br/>

            <Card>
                <CardBody>
                    <CardTitle><span style={{ fontWeight: 'bolder' }}>Signature</span></CardTitle>
                    <CardText>
                        {formValue.signature}
                    </CardText>
                </CardBody>
            </Card>
        </div>
    );
}
