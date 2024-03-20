import React, { Component } from 'react';
import { connect } from 'react-redux';
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

class Customers extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            activeTab: "office"
        }
        this.toggleTab = this.toggleTab.bind(this);
    } 

    componentWillReceiveProps(p) { 

    }

    componentDidMount() {
        this.props.dispatch(clientList({}));
    }

    toggleTab(e) { 
        this.state.activeTab = e;
    } 

    render() {
        return (
        <>
            {(this.props.offices && this.props.offices.isReceiving) && (
                <AppSpinner/>
            )}
            {(this.props.officeClients && this.props.officeClients.data &&
              this.props.officeClients.data.clients) && (
            <Row md="12">
                {this.props.officeClients.data.clients.map((e) => { 
                    return (
                        <>
                        <Col md="4" onClick={() => this.setProviderType(e.id)} style={{cursor:'pointer'}}>
                            <Card style={{
                                margin:20,height:375,
                                borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}} className="mb-xlg border-1">
                                <CardBody>
                                    <Row md="12">
                                        <Col md="12">
                                            <font style={{fontSize:"14pt",fontWeight:"bold"}}>
                                            {e.client_first + " " + e.client_last}
                                            </font>
                                            <br/>
                                        </Col>
                                        <Col md="2"></Col>
                                        <Col md="4" class="pull-right">
                                        </Col>
                                    </Row>
                                    <hr/>
                                    <Row md="12">
                                        <Col md="12">
                                            <font style={{fontSize:"14pt",fontWeight:"bold"}}>
                                            {e.phy_first + " " + e.phy_last}
                                            </font>
                                            <br/>
                                        </Col>
                                        <Col md="2"></Col>
                                        <Col md="4" class="pull-right">
                                        </Col>
                                    </Row>
                                    <div style={{height:130,marginBottom:10,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    </div>
                                    <hr/>
                                    <Row md="12"> 
                                        <Col md="12">
                                            <div style={{height:30,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
        officeClients: store.officeClients
    }
}

export default connect(mapStateToProps)(Customers);
