import { useEffect, useState } from 'react';
import { Auth } from 'aws-amplify';
import { useNavigate } from 'react-router-dom';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { LinkContainer } from 'react-router-bootstrap';
import './App.css';

import Routes from './Routes';
import { AppContext, AppContextType } from './lib/contextLib';
import { onError } from './lib/errorLib';

function App() {
  const nav = useNavigate();
  const [isAuthenticated, userHasAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(true);

  useEffect(() => {
    onLoad();
  }, []);

  async function handleLogout() {
    await Auth.signOut();

    userHasAuthenticated(false);
    nav('/login');
  }

  async function onLoad() {
    try {
      await Auth.currentSession();
      userHasAuthenticated(true);
    } catch (e) {
      if (e !== 'No current user') {
        onError(e);
      }
    }

    setIsAuthenticating(false);
  }

  if (isAuthenticating) {
    return null;
  }

  return (
    <div className='App container py-3'>
      <Navbar collapseOnSelect bg='light' expand='md' className='mb-3 px-3'>
        <LinkContainer to='/'>
          <Navbar.Brand className='fw-bold text-muted'>Scratch</Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle />
        <Navbar.Collapse className='justify-content-end'>
          <Nav activeKey={window.location.pathname}>
            {isAuthenticated ? (
              <>
                <LinkContainer to='/settings'>
                  <Nav.Link>Settings</Nav.Link>
                </LinkContainer>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            ) : (
              <>
                <LinkContainer to='/signup'>
                  <Nav.Link>Signup</Nav.Link>
                </LinkContainer>
                <LinkContainer to='/login'>
                  <Nav.Link>Login</Nav.Link>
                </LinkContainer>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <AppContext.Provider
        value={{ isAuthenticated, userHasAuthenticated } as AppContextType}
      >
        <Routes />
      </AppContext.Provider>
    </div>
  );
}

export default App;
