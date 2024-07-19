import { Client } from '@microsoft/microsoft-graph-client';
import { Providers } from '@microsoft/mgt-element';

const authProvider = Providers.globalProvider;
const client = Client.initWithMiddleware({ authProvider });

export const createMeeting = (meetingDetails) => async (dispatch) => {
    console.log("we in create appt",meetingDetails)
    const event = {
        subject: 'Prep for Customer Meeting',
        body: {
          contentType: 'HTML',
          content: 'Does noon work for you?'
        },
        start: {
            dateTime: '2024-07-18T12:00:00',
            timeZone: 'Pacific Standard Time'
        },
        end: {
            dateTime: '2024-07-18T14:00:00',
            timeZone: 'Pacific Standard Time'
        },
        location: {
            displayName: 'Microsoft Teams'
        },
        attendees: [
          {
            emailAddress: {
              address: 'tedy@poundpain.com',
              name: 'Tedy Yohanes'
            },
            type: 'required'
          }
        ],
        allowNewTimeProposals: true,
        isOnlineMeeting: true,
        onlineMeetingProvider: 'teamsForBusiness'
};
console.log(event,"check it out")
try {
    const response = await client.api('me/events').post(event)
    console.log("looooos",response);
    dispatch({type: 'CREATE_APPOINTMENT_SUCCESS', payload: response})
} catch (error) {
    dispatch({ type: 'CREATE_APPOINTMENT_FAILURE', payload: error});
    }
}
