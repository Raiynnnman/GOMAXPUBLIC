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
import { getConsultantAdmin } from '../../actions/consultantAdmin';
import { consultantAdminUpdate } from '../../actions/consultantAdminUpdate';
import ConsultantAdminList from './ConsultantAdminList';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

class Consultant extends Component {
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
        this.props.dispatch(getConsultantAdmin({page:0,limit:10000}))
    }

    render() {
        return (
        <>
            {(this.props.consultantAdmin && this.props.consultantAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.consultantAdminUpdate && this.props.consultantAdminUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            <Row md="12">
                <Col md="12">
                    <ConsultantAdminList onSave={this.onSave}/> 
                </Col>                
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        consultantAdminUpdate: store.consultantAdminUpdate,
        consultantAdmin: store.consultantAdmin
    }
}

export default connect(mapStateToProps)(Consultant);
