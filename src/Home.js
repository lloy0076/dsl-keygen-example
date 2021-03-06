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
import React from 'react';

import { Link } from 'react-router-dom';

export default function Home(props) {
    return (
        <div>
            <h1>Home</h1>

            <ul>
                <li><Link to={'/generate'}>Generate</Link></li>
                <li><Link to={'/sign'}>Sign</Link></li>
                <li><Link to={'/verify'}>Verify</Link></li>
                <li><Link to={'/digest'}>Digest</Link></li>
            </ul>

            <hr />
        </div>
    );
}
