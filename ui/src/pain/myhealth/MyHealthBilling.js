import React, { Component } from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import {CardElement,ElementsConsumer,Elements} from '@stripe/react-stripe-js';
import { Button } from 'reactstrap';
import { FormGroup, Label, Input, InputGroup } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import {getUser} from '../../actions/user';
import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import BootstrapTable from 'react-bootstrap-table-next';
import cellEditFactory from 'react-bootstrap-table2-editor';
import { toast } from 'react-toastify';
import BillingCreditCardForm from './BillingCreditCardForm';
import 'react-toastify/dist/ReactToastify.css';
import UserCards from './UserCards';
import UserInvoices from './UserInvoices';


class MyHealthBilling extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            newcard:null,
            mylocation:{},
            activeTab: "invoices"
        }
        this.getWithoutPermission = this.getWithoutPermission.bind(this);
        this.toggleTabs = this.toggleTab.bind(this);
        this.setLocation = this.setLocation.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }


    getWithoutPermission(e,t) { 
        this.state.geo = false;
        this.setState(this.state);
        this.props.dispatch(getUser({}));
    } 

    componentDidMount() {
        this.state.geo = true;
        this.setState(this.state)
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
              this.state.geo = false;
              this.setState(this.state)
              var params = {location:{lat:position.coords.latitude,lon:position.coords.longitude }}
              this.props.dispatch(getUser(params));
              this.setLocation(position.coords.latitude, position.coords.longitude);
            },this.getWithoutPermission);
        } else {
            this.props.dispatch(getUser({}))
            this.state.geo = false;
            this.setState(this.state)
        }
    }
    cancel() { 
        this.state.newcard = null;
    }
    toggleTab(e) { 
        this.state.activeTab = e;
        this.setState(this.state);
    } 
    saveCard() { 
        this.state.newcard = null;
        var params = {
            location:{
                lat:this.state.mylocation.lat,
                lon:this.state.mylocation.lon
            }
        }
        this.props.dispatch(getUser(params));
        this.setState(this.state);
    } 

    setLocation(lat,lon) {
        this.state.mylocation={lat:lat,lon:lon}
        this.setState(this.state);
    }

    render() {
        return (
        <>
            {(this.props.user && this.props.user.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.setupIntent && this.props.setupIntent.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.saveCard && this.props.saveCard.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.state.geo) && (
                <AppSpinner/>
            )}
            {(this.props.user && this.props.user.data && this.props.user.data.invoices && 
              this.state.newcard === null) && (
            <>
            <Row md="12">
                <Col md="12">
                    <Nav tabs  className={`${s.coloredNav}`} style={{backgroundColor:"#e8ecec"}}>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'invoices' })}
                                onClick={() => { this.toggleTab('invoices') }}>
                                <span>{translate('Invoices')}</span>
                            </NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className={classnames({ active: this.state.activeTab === 'cards' })}
                                onClick={() => { this.toggleTab('cards') }}>
                                <span>{translate('Cards')}</span>
                            </NavLink>
                        </NavItem>
                    </Nav>
                    <TabContent className='mb-lg' activeTab={this.state.activeTab}>
                        <TabPane tabId="cards">
                            <UserCards mylocation={this.state.mylocation}/>
                        </TabPane>
                        <TabPane tabId="invoices">
                            <UserInvoices/>
                        </TabPane>
                    </TabContent>
                </Col>
            </Row>
            </>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        user: store.user,
    }
}

export default connect(mapStateToProps)(MyHealthBilling);
