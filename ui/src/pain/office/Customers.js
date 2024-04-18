import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toast } from 'react-toastify';
import { Badge,Button } from 'reactstrap';
import { Col, Row } from 'reactstrap';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import s from './default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import {clientList} from '../../actions/officeClients';
import {clientUpdate} from '../../actions/officeClientUpdate';
import UserRegistration from '../admin/UserRegistration';

class Customers extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "office",
            selectedAppt:null,
        }
        this.toggleTab = this.toggleTab.bind(this);
        this.close = this.close.bind(this);
        this.save = this.save.bind(this);
        this.selectAppt = this.selectAppt.bind(this);
    } 

    componentWillReceiveProps(p) { 

    }

    componentDidMount() {
        this.props.dispatch(clientList({}));
    }

    save(e) { 
        this.props.dispatch(clientUpdate(e,function(data,args) { 
            toast.success('Successfully updated status.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
            );
            args.props.dispatch(clientList({}));
            args.cancel()
        },this));
    } 
    close() { 
        this.state.selectedAppt = null;
        this.setState(this.state);
    } 
    selectAppt(e) { 
        this.state.selectedAppt = e;
        this.setState(this.state);
    } 

    toggleTab(e) { 
        this.state.activeTab = e;
    } 

    render() {
        return (
        <>
            {(this.props.officeClient && this.props.officeClient.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.officeClientUpdate && this.props.officeClientUpdate.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.officeClients && this.props.officeClients.data &&
              this.props.officeClients.data.clients && this.state.selectedAppt !== null) && (
                <UserRegistration filled={true} config={this.props.officeClients.data.config} 
                    data={this.state.selectedAppt} onCancel={this.close} onRegister={this.save}/>
            )}
            {(this.props.officeClients && this.props.officeClients.data &&
              this.props.officeClients.data.clients && this.state.selectedAppt === null &&
              this.props.officeClients.data.clients.length == 0) && (
                <h4>Waiting for first client</h4>
            )}
            {(this.props.officeClients && this.props.officeClients.data &&
              this.props.officeClients.data.clients && this.state.selectedAppt === null) && (
            <Row md="12">
                {this.props.officeClients.data.clients.map((e) => { 
                    return (
                        <>
                        <Col md="4" onClick={() => this.selectAppt(e)} style={{cursor:'pointer'}}>
                            <Card style={{
                                margin:20,height:325,
                                borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}} className="mb-xlg border-1">
                                <CardBody>
                                    <Row md="12">
                                        <Col md="8">
                                            <font style={{fontSize:"14pt",fontWeight:"bold"}}>
                                            {e.phy_first + " " + e.phy_last}
                                            </font>
                                            <br/>
                                        </Col>
                                        <Col md="4" class="pull-right">
                                            {e.status}
                                        </Col>
                                    </Row>
                                    <hr/>
                                    <Row md="12">
                                        <Col md="8">
                                            <font style={{fontSize:"14pt",fontWeight:"bold"}}>
                                            {e.client_first + " " + e.client_last}
                                            </font>
                                            <br/>
                                        </Col>
                                        <Col md="4" class="pull-right">
                                        </Col>
                                    </Row>
                                    <Row md="12">
                                        <Col md="8">
                                            <font style={{fontSize:"14pt",fontWeight:"bold"}}>
                                            {e.email}
                                            </font>
                                        </Col>
                                        <Col md="4" class="pull-right">
                                        </Col>
                                    </Row>
                                    <Row md="12">
                                        <Col md="8">
                                            <font style={{fontSize:"14pt",fontWeight:"bold"}}>
                                            {e.phone}
                                            </font>
                                        </Col>
                                        <Col md="4" class="pull-right">
                                        </Col>
                                    </Row>
                                    <Row md="12">
                                        <Col md="12">
                                            <div style={{overflow:"auto"}}>
                                                {e.description}
                                            </div>
                                        </Col>
                                    </Row>
                                    <div style={{height:130,marginBottom:10,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    </div>
                                    <hr/>
                                    <Row md="12"> 
                                        <Col md="12">
                                            <div style={{height:30,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <Button onClick={() => this.selectAppt(e)} style={{marginRight:10}} color="primary">{translate('View')}</Button>
                                            </div>
                                        </Col>
                                    </Row>
                                </CardBody>
                            </Card>
                        </Col>
                        </>
                    )
                })}
            </Row>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        officeClients: store.officeClients,
        officeClientUpdate: store.officeClientUpdate
    }
}

export default connect(mapStateToProps)(Customers);
