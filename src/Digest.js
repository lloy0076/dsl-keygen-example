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

export default function Digest() {
    const initialText = localStorage.getItem('text');
    const initialSignature = localStorage.getItem('signature');

    const [formValue, setFormValue] = useState({ text: initialText, signature: initialSignature, result: null });

    function handleChange(e) {
        const newValue = { ...formValue, ...{ [e.target.id]: e.target.value } };
        setFormValue(newValue);
    }

    async function handleDigest() {
        CryptographyService.digest(formValue.text, 'sha256', 'hex').then((digest) => {
            const newValue = { ...formValue, ...{ digest } };
            setFormValue(newValue);
        }).catch((error) => {
            const newValue = { ...formValue, ...{ digest: 'Unable to Generate Digest' } };
            setFormValue(newValue);
            console.error(error);
        });
    }

    return (
        <div>
            <h1>Digest</h1>

            <Card>
                <CardBody>
                    <CardTitle><span style={{ fontWeight: 'bolder' }}>Text to Digest</span></CardTitle>
                    <Form>
                        <FormGroup>
                            <textarea name={'text'} id={'text'}
                                value={formValue.text || ''} onChange={handleChange}
                                cols={64} rows={10}
                            />
                        </FormGroup>
                        <FormGroup>
                            <Button className={'float-left'} color={'success'} onClick={handleDigest}>Digest</Button>
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>

            <br/>

            <Card>
                <CardBody>
                    <CardTitle><span style={{ fontWeight: 'bolder' }}>Digest</span></CardTitle>
                    <Form>
                        <FormGroup>
                            <textarea name={'digest'} id={'digest'}
                                value={formValue.digest || ''} onChange={handleChange}
                                cols={64} rows={10}
                            />
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>


        </div>
    );
}
