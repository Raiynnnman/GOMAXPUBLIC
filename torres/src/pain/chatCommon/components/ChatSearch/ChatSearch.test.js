import React from "react";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import { shallow, mount, render } from 'enzyme';
//import Adapter from 'enzyme-adapter-react-16';
import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure } from 'enzyme';

configure({ adapter: new Adapter() });

const mockStore = configureMockStore();
const store = mockStore({
    auth: { currentUser: {} }
});
import ChatSearch from './ChatSearch';

test("ChatSearch",() => {
    shallow(
        <ChatSearch store={store}/>
    );
});
