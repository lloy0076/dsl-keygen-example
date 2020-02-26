import React, { useState } from 'react';
import {
    Button,
    Card, CardBody, CardText, CardTitle,
    Form, FormGroup,
} from 'reactstrap';

export default function Sign() {
    const [formValue, setFormValue] = useState({ text: '' });

    function handleChange(e) {
        const newValue = { ...formValue, ...{ [e.target.id]: e.target.value } };
        setFormValue(newValue);
    }

    function handleSign() {
        const newValue = { ...formValue, ...{ result: 'TBD' } };
        setFormValue(newValue);
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
                            <Button className={'float-left'} color={'success'} onClick={handleSign}>Sign</Button>
                        </FormGroup>
                    </Form>
                </CardBody>
            </Card>

            <br/>

            <Card>
                <CardBody>
                    <CardTitle><span style={{ fontWeight: 'bolder' }}>Result</span></CardTitle>
                    <CardText>
                        {formValue.result}
                    </CardText>
                </CardBody>
            </Card>

        </div>
    );
}
