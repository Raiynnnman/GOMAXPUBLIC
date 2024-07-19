import { Client } from '@microsoft/microsoft-graph-client';
import { Providers } from '@microsoft/mgt-element';

const authProvider = Providers.globalProvider;
const client = Client.initWithMiddleware({ authProvider });

export const findMeetingTimes = (meetingDetails) => async (dispatch) => {
  console.log("Aye look my boi!", meetingDetails);
//exmaple hardcord vals remeber to change
  // const attendeeName = meetingDetails.selectedUser.name;
  // const attendeeEmail = meetingDetails.selectedUser.email;
  // const attendeeTime = meetingDetails.selectedTime;
  // const location = meetingDetails.location; // Ensure that location is part of meetingDetails
  // const startTime = "2024-07-17T07:23:34.538Z";  
  // const endTime = "2024-07-17T07:23:34.538Z";  
    const scheduleInformation = {
      schedules: ['tedy@poundpain.com', 'paul@poundpain.com'],
      startTime: {
          dateTime: '2024-07-17T09:00:00',
          timeZone: 'Pacific Standard Time'
      },
      endTime: {
          dateTime: '2024-07-24T18:00:00',
          timeZone: 'Pacific Standard Time'
      },
      availabilityViewInterval: 30
  };
  try {
    const response = await client.api('/me/calendar/getSchedule').post(scheduleInformation);
    console.log(response)
    dispatch({ type: 'FIND_MEETING_TIMES_SUCCESS', payload: response });
  } catch (error) {
    dispatch({ type: 'FIND_MEETING_TIMES_FAILURE', payload: error });
  }
};
