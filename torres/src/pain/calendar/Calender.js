import React from 'react';
import { Providers, ProviderState } from '@microsoft/mgt-element';
import { Msal2Provider } from '@microsoft/mgt-msal2-provider';
import crmSSOConfig from '../../crmSSOConfig';
import BookingComponent from './components/BookingComponent';

const Calender = () => {
  Providers.globalProvider = new Msal2Provider({
    clientId: crmSSOConfig() ,
    scopes: [
      'tasks.ReadWrite', 'tasks.read',
      'mail.ReadWrite', 'mail.read',
      'calendars.readwrite', 'calendars.read',
      'user.read', 'openid', 'profile', 'people.read', 'user.readbasic.all',
      'Bookings.ReadWrite.All'
    ]
  });

  return (
    <div>
      <BookingComponent />
    </div>
  );
};

export default Calender;
