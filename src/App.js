import React, { useState } from 'react';

import {
    BrowserRouter as Router,
    Switch,
    Route,
    NavLink as RRNavLink,
} from 'react-router-dom';

import {
    Collapse,
    Navbar,
    NavbarToggler,
    NavbarBrand,
    Nav,
    NavItem,
    NavLink,
} from 'reactstrap';

import 'bootstrap/dist/css/bootstrap.min.css';

import Generate from './Generate';
import Home from './Home';
import Verify from './Verify';
import Sign from './Sign';

function App() {
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    return (
        <div className={'container'}>
            <Router>
                <div>
                    <Navbar color={'dark'} dark expand={'md'}>
                        <NavbarBrand href={'/'}>家</NavbarBrand>
                        <NavbarToggler onClick={toggle}/>
                        <Collapse isOpen={isOpen} navbar>
                            <Nav className={'mr-auto'} navbar>
                                <NavItem>
                                    <NavLink tag={RRNavLink} exact to={'/generate'}
                                        activeClassName={'active'}>Generate</NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={RRNavLink} exact to={'/sign'} activeClassName={'active'}>
                                        Sign
                                    </NavLink>
                                </NavItem>
                                <NavItem>
                                    <NavLink tag={RRNavLink} exact to={'/verify'} activeClassName={'active'}>
                                        Verify
                                    </NavLink>
                                </NavItem>
                            </Nav>
                        </Collapse>
                    </Navbar>
                </div>
                <Switch>
                    <Route path={'/sign'}>
                        <Sign/>
                    </Route>
                    <Route path={'/verify'}>
                        <Verify/>
                    </Route>
                    <Route path={'/generate'}>
                        <Generate/>
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
