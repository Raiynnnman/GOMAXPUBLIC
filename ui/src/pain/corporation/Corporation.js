import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import s from '../office/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getUsers } from '../../actions/corporationUsers';
import UsersList from './UsersList';

class Corporation extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
    } 

    componentWillReceiveProps(p) { 
    
    }

    componentDidMount() {
        this.props.dispatch(getUsers({page:0,limit:10000}))
    }


    render() {
        return (
        <>
            {(this.props.corporationUsers && this.props.corporationUsers.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <UsersList/>
                </Col>                
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        corporationUsers: store.corporationUsers
    }
}

export default connect(mapStateToProps)(Corporation);
