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
import { getLegalAdmin } from '../../actions/legalAdmin';
import { legalAdminUpdate } from '../../actions/legalAdminUpdate';
import LegalAdminList from './LegalAdminList';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class Legal extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
        this.onSave = this.onSave.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    onSave(e) { 
    } 

    componentDidMount() {
        this.props.dispatch(getLegalAdmin({page:0,limit:10000}))
    }

    render() {
        return (
        <>
            {(this.props.legalAdmin && this.props.legalAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.legalAdminUpdate && this.props.legalAdminUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <LegalAdminList onSave={this.onSave}/> 
                </Col>                
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        legalAdminUpdate: store.legalAdminUpdate,
        legalAdmin: store.legalAdmin
    }
}

export default connect(mapStateToProps)(Legal);
