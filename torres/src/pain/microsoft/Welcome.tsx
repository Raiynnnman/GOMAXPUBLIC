// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

// <WelcomeSnippet>
import { Button, Container } from '@mui/material';
import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import { useAppContext } from './AppContext';
import ProvideAppContext from './AppContext';
import Calendar from './Calendar';
import { MsalProvider, useMsal } from '@azure/msal-react';
import { Login, Agenda, useIsSignedIn, Planner } from '@microsoft/mgt-react';

export default function Welcome({showCal}) {
  const app = useAppContext();

    const [ isSignedIn ] = useIsSignedIn();
    const { instance } = useMsal();
    const activeAccount = instance.getActiveAccount();
  return (
    <>
        {(!activeAccount) && (
            <div className="p-5 mb-4 bg-light rounded-3">
              <Container>
                <h5>Integrate with o365</h5>
                <UnauthenticatedTemplate>
                  <Button color="primary" onClick={app.signIn!}>Click here to sign in</Button>
                </UnauthenticatedTemplate>
              </Container>
            </div>
        )}
    </>
  );
}
// </WelcomeSnippet>
