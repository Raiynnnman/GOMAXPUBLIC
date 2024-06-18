import {
  NEW_MESSAGE_SUCCESS,
  NEW_MESSAGE_REQUEST,
  SET_ACTIVE_CHAT,
  OPEN_USERS_LIST,
  CHANGE_MOBILE_STATE
} from '../actions/chat';
//import {user, users, chats} from '../dhd/chatOffice/mock';
import reducer from './index.js';

export const MobileChatStates = {
  LIST: 'list',
  CHAT: 'chat',
  INFO: 'info'
};

Object.freeze(MobileChatStates);

const defaultState = {
  activeChatId: 0,
  sendingMessage: false,
  mobileState: MobileChatStates.CHAT,
  openUsersList: false
};

export default function chatReducer(state = {}, action) {
  switch (action.type) {
    case OPEN_USERS_LIST:
      return {
        ...state,
        openUsersList: !state.openUsersList
      }
    case SET_ACTIVE_CHAT:
      return {
        ...state, 
        activeChatId : action.payload
      }
    case NEW_MESSAGE_SUCCESS:
      return {
        ...state,
        sendingMessage: false,
        //chats: chatsCopy
      }
    case NEW_MESSAGE_REQUEST:
      return {
        ...state,
        sendingMessage: true
      }
    case CHANGE_MOBILE_STATE:
      let defaultId = state.activeChatId;
      let currentMobileState = state.mobileState;
      return {
        ...state,
        mobileState: (currentMobileState === action.payload && currentMobileState === MobileChatStates.INFO) ? MobileChatStates.CHAT : action.payload,
        activeChatId: action.payload === MobileChatStates.LIST ? null : defaultId
      }
    default:
      return state;
  }
}
