import React, { Component } from 'react';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { Badge,Button } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import AliceCarousel from 'react-alice-carousel';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';

class Appointment extends Component {
    constructor(props) { 
        super(props);
        this.onDocumentUpload = this.onDocumentUpload.bind(this);
        this.onGetConsent = this.onGetConsent.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    onDocumentUpload() { 
        this.props.onDocumentUpload(this.props.data)
    }

    onGetConsent() { 
        this.props.onConsent(this.props.data)
    }

    render() {
        return (
        <>
            <Card style={{borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px",
                margin:20}} className="mb-xlg border-1">
                <CardBody>
                    <Row md="12">
                        <Col md="7">
                            <font style={{fontSize:"14pt",fontWeight:"bold"}}>
                            {this.props.data.title + " " + this.props.data.first_name + " " + this.props.data.last_name}
                            </font>
                        </Col>
                        <Col md="5" class="pull-right">
                            {(this.props.data.rating === 5) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.data.rating >= 4) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.data.rating >= 3 && this.props.data.rating < 4) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.data.rating >= 2 && this.props.data.rating < 3) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.data.rating >= 1 && this.props.data.rating < 2) && (
                            <>
                                <i style={{color:"gold"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {(this.props.data.rating >= 0 && this.props.data.rating < 1) && (
                            <>
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                                <i style={{color:"lightgrey"}} className="fa fa-star me-2" />
                            </>
                            )}
                            {this.props.data.rating.toFixed(1)}
                        </Col>
                    </Row>
                    <hr/>
                    <Row md="12">
                        <Col md="3">
                            {(this.props.data.headshot) && (<img style={{width:140,height:130,objectFit:"fill"}} src={this.props.data.headshot}/>)}
                            {(!this.props.data.headshot) && (<img style={{width:140,height:130,objectFit:"fill"}} src="/headshot.png"/>)}
                        </Col>
                        <Col md="1">
                        </Col>
                        <Col md="8">
                            <Row md="12">
                                <Col md="12">
                                    Distance: {this.props.data.miles.toFixed(2)} miles
                                </Col>
                            </Row>
                            <Row md="12">
                                <Col md="12">
                                    On: {this.props.data.schedule[0].day} @ {this.props.data.schedule[0].time}
                                </Col>
                            </Row>
                            <Row md="12">
                                <Col md="12">
                                    Procedure: {this.props.data.subproc}
                                </Col>
                            </Row>
                            {(this.props.chat) && (
                                <Row md="12" style={{marginTop:10}}>
                                    <Col md="8">
                                        <Button onClick={this.props.onNewChat} color="primary">Chat with Doctor</Button>
                                    </Col>
                                </Row>
                            )}
                            {(this.props.viewAppt) && (
                                <Row md="12" style={{marginTop:10}}>
                                    <Col md="8">
                                        <Button style={{width:147}} onClick={this.props.onViewAppt} color="primary">Details</Button>
                                    </Col>
                                </Row>
                            )}
                            {(this.props.documents) && (
                                <Row md="12" style={{marginTop:5}}>
                                    <Col md="8">
                                        <Button onClick={this.onDocumentUpload} color="primary">Documents</Button>
                                    </Col>
                                </Row>
                            )}
                            {(this.props.consent) && (
                                <Row md="12" style={{marginTop:5}}>
                                    <Col md="8">
                                        <Button onClick={this.onGetConsent} color="primary">Consent Form</Button>
                                    </Col>
                                </Row>
                            )}
                        </Col>
                    </Row>
                    <Row md="12"> 
                        <Col md="12">
                            {this.props.data.name}
                        </Col> 
                    </Row>
                    <Row md="12"> 
                        <Col md="8">{this.props.data.addr[0][0].addr1}</Col> 
                    </Row>
                    <Row md="12"> <Col md="8">{this.props.data.addr[0][0].addr2}</Col> </Row>
                    <Row md="12"> 
                        <Col md="4">
                            {this.props.data.addr[0][0].city},{this.props.data.addr[0][0].state} {this.props.data.addr[0][0].zipcode}
                        </Col> 
                        <Col md="4"></Col> 
                    </Row>
                    <hr/>
                </CardBody>
            </Card>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser
    }
}

export default connect(mapStateToProps)(Appointment);
