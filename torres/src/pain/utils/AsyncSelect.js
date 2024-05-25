import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import AsyncSelect from 'react-select/async';

class AsyncSelect extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            search:''
        } 
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    render() {
        return (
        <>
            <AsyncSelect 
                onChange={this.props.onChange}
                value={this.state.search}
                loadOptions={loadOptions}
                cacheOptions
                defaultOptions
                onInputChange={this.searchOffices}
            />
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser
    }
}

export default connect(mapStateToProps)(AsyncSelect);
