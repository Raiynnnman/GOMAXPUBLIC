#!/bin/sh


FILES=`find src/dhd -name '*.js' | grep -v test`


for x in $FILES; do 
K=`basename $x .js`
J=$K.test.js
P=`dirname $x`
F=$P/$J
if [ -f $F ]; then continue; fi
(cat << EOF
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
import $K from './$K';

test("$K",() => {
    shallow(
        <$K store={store}/>
    );
});
EOF
) > $F 
done
