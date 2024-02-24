import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import './Landing.scss';

class Home extends Component {
    constructor(props) { 
        super(props);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }


    render() {
        var items = [
            <img src="/carousel1.webp" role="presentation" />,
            <img src="/carousel2.webp" role="presentation" />,
            <img src="/carousel3.webp" role="presentation" />,
            <img src="/carousel4.webp" role="presentation" />,
            <img src="/carousel6.webp" role="presentation" />,
        ];
        return (
        <>
            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Row md="12">
                    <Col md="12">
                        <img src="/home_top.webp"/>
                    </Col>
                </Row>
            </div>
            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Row md="12">
                    <Col md="12">
                        <img src="/LogoDarkBGwithNumber_4x.webp"/>
                    </Col>
                </Row>
            </div>
            <div style={{marginTop:120,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Row md="12">
                    <Col md="12">
                        <img src="/first_interactive.webp"/>
                    </Col>
                </Row>
            </div>
            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Row md="12">
                    <Col md="12">
                        <img src="/home_speedometers.webp"/>
                    </Col>
                </Row>
            </div>
            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Row md="12">
                    <Col md="12">
                        <img src="/injured_in_a_car.webp"/>
                    </Col>
                </Row>
            </div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Row md="12">
                    <Col md="6" style={{marginTop:0}}>
                        <img src="/yes.webp"/>
                    </Col>
                    <Col md="6" style={{marginTop:50}}>
                        <img src="/no.webp"/>
                    </Col>
                </Row>
            </div>
            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Row md="12">
                    <Col md="2"></Col>
                    <Col md="8">
                        <AliceCarousel animationType="slide" autoPlay="true" 
                            disableDotsControls="true" animationDuration="8000" autoplayInterval="3000"
                            infinite="true" mouseTracking items={items} />
                    </Col>
                    <Col md="2"></Col>
                </Row>
            </div>
            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Row md="12">
                    <Col md="6">
                        <div class="quote-container">
                            <img src="/circlequote.png"/>
                            <img class="quote-top-left" src="/quote.png"/>
                            <font class="quote-centered" style={{margin:10,fontStyle:"italic",color:"#FFFFFF",fontSize:"13px"}}>
                                "I am writing to express my gratitude from my family for the care given to my mother. There was care, compassion, and respect. A special thank you to your staff as well; they provided professional guidance, comfort, and strength to make our own decisions. Finally, I cannot praise the #Pain and team enough. They were patient and helpful. All our hope that you continue along this path."
                            </font>
                        </div>
                    </Col>
                    <Col md="6">
                        <div class="quote-container">
                            <img src="/circlequote.png"/>
                            <img class="quote-top-left" src="/quote.png"/>
                            <font class="quote-centered" style={{margin:10,fontStyle:"italic",color:"#FFFFFF",fontSize:"13px"}}>
                            "I humbly submit my sincere gratitude to the management and staff of #Pain. They have been outstandingly helpful and provided a high quality of service, care and comfort to our lives. Thank you."
                            </font>
                        </div>
                    </Col>
                </Row>
            </div>
            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Row md="12">
                    <Col md="1"></Col>
                    <Col md="4" style={{display: 'flex', alignItems: 'center', justifyContent: 'right'}}>
                        <img src="/14day.webp"/>
                    </Col>
                    <Col md="4" style={{borderLeft:"3px solid white"}}>
                        <Row>
                            <img src="/14count.gif" style={{width:151,height:150}}/>
                        </Row>
                        <Row>
                        <font>
                        The 14-day rule is a requirement that you seek medical attention within 14 days after a car accident in Florida. If you don't go to a doctor or otherwise get medical care within two weeks of the accident, you can't file a PIP insurance claim.
                        </font>
                        </Row>
                    </Col>
                    <Col md="2"></Col>
                </Row>
            </div>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        offices: store.offices
    }
}

export default connect(mapStateToProps)(Home);
