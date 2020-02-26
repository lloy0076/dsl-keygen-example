import React from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Link,
} from 'react-router-dom';

import './App.css';

import Home from './Home';
import Verify from './Verify';
import Sign from './Sign';

function App() {
    return (
        <div className='App'>
            <h1>Verify Signature</h1>

            <Router>
                <div>
                    <nav>
                        <ul>
                            <li>
                                <Link to={'/'}>Home</Link>
                            </li>
                            <li>
                                <Link to={'/sign'}>Sign</Link>
                            </li>
                            <li>
                                <Link to={'/verify'}>Verify</Link>
                            </li>
                        </ul>
                    </nav>
                </div>
                <Switch>
                    <Route path={'/sign'}>
                        <Sign/>
                    </Route>
                    <Route path={'/verify'}>
                        <Verify/>
                    </Route>
                    <Route path={'/'}>
                        <Home/>
                    </Route>
                </Switch>
            </Router>
        </div>
    );
}

export default App;
