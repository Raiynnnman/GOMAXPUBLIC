import React, { Component } from 'react';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
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
                    <Grid container xs="12">
                        <Grid item xs="7">
                            <font style={{fontSize:"14pt",fontWeight:"bold"}}>
                            {this.props.data.title + " " + this.props.data.first_name + " " + this.props.data.last_name}
                            </font>
                        </Grid>
                        <Grid item xs="5" class="pull-right">
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
                        </Grid>
                    </Grid>
                    <hr/>
                    <Grid container xs="12">
                        <Grid item xs="3">
                            {(this.props.data.headshot) && (<img style={{width:140,height:130,objectFit:"fill"}} src={this.props.data.headshot}/>)}
                            {(!this.props.data.headshot) && (<img style={{width:140,height:130,objectFit:"fill"}} src="/headshot.png"/>)}
                        </Grid>
                        <Grid item xs="1">
                        </Grid>
                        <Grid item xs="8">
                            <Grid container xs="12">
                                <Grid item xs="12">
                                    Distance: {this.props.data.miles.toFixed(2)} miles
                                </Grid>
                            </Grid>
                            <Grid container xs="12">
                                <Grid item xs="12">
                                    On: {this.props.data.schedule[0].day} @ {this.props.data.schedule[0].time}
                                </Grid>
                            </Grid>
                            <Grid container xs="12">
                                <Grid item xs="12">
                                    Procedure: {this.props.data.subproc}
                                </Grid>
                            </Grid>
                            {(this.props.chat) && (
                                <Grid container xs="12" style={{marginTop:10}}>
                                    <Grid item xs="8">
                                        <Button onClick={this.props.onNewChat} color="primary">Chat with Doctor</Button>
                                    </Grid>
                                </Grid>
                            )}
                            {(this.props.viewAppt) && (
                                <Grid container xs="12" style={{marginTop:10}}>
                                    <Grid item xs="8">
                                        <Button style={{width:147}} onClick={this.props.onViewAppt} color="primary">Details</Button>
                                    </Grid>
                                </Grid>
                            )}
                            {(this.props.documents) && (
                                <Grid container xs="12" style={{marginTop:5}}>
                                    <Grid item xs="8">
                                        <Button onClick={this.onDocumentUpload} color="primary">Documents</Button>
                                    </Grid>
                                </Grid>
                            )}
                            {(this.props.consent) && (
                                <Grid container xs="12" style={{marginTop:5}}>
                                    <Grid item xs="8">
                                        <Button onClick={this.onGetConsent} color="primary">Consent Form</Button>
                                    </Grid>
                                </Grid>
                            )}
                        </Grid>
                    </Grid>
                    <Grid container xs="12"> 
                        <Grid item xs="12">
                            {this.props.data.name}
                        </Grid> 
                    </Grid>
                    <Grid container xs="12"> 
                        <Grid item xs="8">{this.props.data.addr[0][0].addr1}</Grid> 
                    </Grid>
                    <Grid container xs="12"> <Grid item xs="8">{this.props.data.addr[0][0].addr2}</Grid> </Grid>
                    <Grid container xs="12"> 
                        <Grid item xs="4">
                            {this.props.data.addr[0][0].city},{this.props.data.addr[0][0].state} {this.props.data.addr[0][0].zipcode}
                        </Grid> 
                        <Grid item xs="4"></Grid> 
                    </Grid>
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
