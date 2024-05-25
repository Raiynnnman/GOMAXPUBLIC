import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import VideoCameraBackIcon from '@mui/icons-material/VideoCameraBack';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import AliceCarousel from 'react-alice-carousel';
import 'react-alice-carousel/lib/alice-carousel.css';
import './Landing.scss';

class Join extends Component {
    constructor(props) { 
        super(props);
        this.state = {
            selIndex:-1
        }
        this.selectFAQ = this.selectFAQ.bind(this);
        this.register = this.register.bind(this);
        this.bookNow = this.bookNow.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
    }

    selectFAQ(e) { 
        if (e === this.state.selIndex) { this.state.selIndex = -1 }
        else { this.state.selIndex = e; }
        this.setState(this.state);
    } 

    register(e) { 
        window.location = "/#/register-provider/" + e;
    } 

    bookNow() { 
        window.location = "https://calendly.com/poundpaindaphne";
    } 


    render() {
        var faq = [
            {id:0,'t':'How do I get my referrals?','a':'Our intake team will reach out to you with the patients & attorney information.'},
            {id:1,'t':'Will the subscription monthly fee go up?','a':'The fee will not change for the first 12 months.'},
            {id:2,'t':'Why Choose us?','a':'We have the lowest monthly subscriptions in the personal injury network. '},
            {id:3,'t':'Why is your subscription so low?','a':'We believe in volume and large advertising CO-OP. "Strength in numbers". '},
            {id:4,'t':'How many patients do we get a month?','a':'We do not guarantee a specific number of patients. We don\'t \'patient broker\', we don\'t use runners. All illegal of course. But at >$5k, your first patient covers your entire YEAR of subscription fees. '},
            {id:5,'t':'How long does it take to start getting patients?','a':'It takes 45-60 days. We use this time to target, optimize and program our digital and traditional marketing strategies specifically to your area, demographics and physical address(s) (e.g. geofencing, google ads and our proprietary methods and software. '},
            {id:6,'t':'Why do I have to pay 2 months in advance? Why am I paying $798.00? (Also refer to previous answers).','a':'We must set up your area with SEO, Geofencing & Digital marketing'},
            {id:7,'t':'Can I cancel anytime? Is there a contract?','a':'Yes you can cancel anytime. No there is no contract. '},
            {id:8,'t':'How many doctors have you signed up in my area?','a':'A. We maintain exclusivity, we will only be signing more providers in your area if we have enough business to support it.<br/>B. We aim to maintain 8 mail radius between our network providers.'}, 
            {id:9,'t':'How long have you been in business?','a':'2 Years'}
        ];
        return (
        <>
            <Grid container xs="12">
            <Grid item xs="12">
            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Grid container xs="12" style={{marginTop:20}}>
                    <Grid item xs="12">
                        <img src="/personalinjurysimplified.webp"/>
                    </Grid>
                </Grid>
            </div>
            </Grid>
            </Grid>
            <Grid container xs="12">
            <Grid item xs="12">
            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Grid container xs="12">
                    <Grid item xs="2"></Grid>
                    <Grid item xs="8">
                        <font style={{fontSize:"19px"}}>
                        We are thrilled to invite you to become a part of our exclusive network of providers for personal injury cases. By filling out a short application, you will be taking the first step towards participating in our state-of-the-art, fully interactive personal injury network. Our network is designed to connect patients in need of specialized care with the most qualified and experienced providers in the industry.
                        </font>
                    </Grid>
                    <Grid item xs="2"></Grid>
                </Grid>
            </div>
            </Grid>
            </Grid>
            <Grid container xs="12">
            <Grid item xs="12">
            <div style={{marginTop:120,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Grid container xs="12">
                    <Grid item xs="2"></Grid>
                    <Grid item xs="5" style={{display: 'flex', alignItems: 'center'}}>
                        <div> 
                            <font style={{fontSize:"32px"}}>
                                Up to 3 Locations
                            </font>
                        </div>
                    </Grid>
                    <Grid item xs="4">
                        {
                            (this.props.landingData && this.props.landingData.data && this.props.landingData.data.pricing) && (
                            <font style={{fontSize:"92px"}}>
                                ${this.props.landingData.data.pricing[0]['price']}
                            </font>
                            )
                        }
                        <div class="pull-right">
                        <font style={{fontSize:"18px"}}>
                            (As Low As)
                        </font>
                        </div>
                    </Grid>
                    <Grid item xs="2"></Grid>
                </Grid>
            </div>
            </Grid>
            </Grid>
            <Grid container xs="12">
            <Grid item xs="12">
            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Grid container xs="12">
                    <Grid item xs="6">
                        <img src="/lightbulb.webp"/>
                    </Grid>
                    <Grid item xs="6">
                        <Card style={{backgroundColor:"#F74301",margin:20,width:400,height:300}} className="mb-xlg border-1">
                            <CardBody>
                                <Grid container xs="12">
                                    <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <font style={{fontSize:'24px'}}>
                                        10 Minute Introduction
                                    </font>
                                    </div>
                                </Grid>
                                <Grid container xs="12">
                                    <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <div style={{width:'200px',background:'black',borderRadius:"25px 25px 25px 25px"}}>
                                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <font>
                                                <VideoCameraBackIcon/>&nbsp;Available Online
                                            </font>
                                            </div>
                                        </div>
                                    </div>
                                </Grid>
                                <Grid container xs="12" style={{marginBottom:20}}>
                                    <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <font style={{fontSize:'16px',textDecoration:'underline'}} >
                                        Read More
                                    </font>
                                    </div>
                                </Grid>
                                <Grid container xs="12">
                                    <div style={{marginLeft:5,marginRight:5}}>
                                        <div style={{borderBottom:"1px solid white",opacity:".5"}}></div>
                                    </div>
                                </Grid>
                                <Grid container xs="12" style={{marginTop:20}}>
                                    <div onClick={this.bookNow} style={{cursor:"pointer",marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                        <div style={{width:'200px',border:"2px solid white",borderRadius:"25px 25px 25px 25px"}}>
                                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <font style={{fontSize:'16px',}}>
                                                Book Now
                                            </font>
                                            </div>
                                        </div>
                                    </div>
                                </Grid>
                            </CardBody>
                        </Card>
                    </Grid>
                </Grid>
            </div>
            </Grid>
            </Grid>
            <Grid container xs="12">
            <Grid item xs="12">
            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Grid container xs="12">
                    <Grid item xs="12">
                        <div style={{border:"1px solid white"}}></div>
                    </Grid>
                </Grid>
            </div>
            </Grid>
            </Grid>
            <Grid container xs="12">
            <Grid item xs="12">
            <div style={{marginBottom:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    {
                    (this.props.landingData && this.props.landingData.data && this.props.landingData.data.pricing) && (
                    <>
                        {this.props.landingData.data.pricing.map((e) => { 
                            return (
                            <Grid item xs="3" style={{marginRight:10}}> 
                                <Card style={{border:"1px solid white",backgroundColor:"black"}} className="mb-xlg border-1">
                                    <CardBody style={{margin:0,padding:0}}>
                                        <div style={{backgroundColor:"#F74301"}}>
                                        <div style={{backgroundColor:"#F74301",display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <font style={{fontSize:"18px"}}>
                                                (* Up to 3 Locations. Annual plan)
                                            </font>
                                        </div>
                                        <div style={{backgroundColor:"#F74301",display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                            <font style={{fontSize:"35px"}}>
                                                ${e.price}/Month
                                            </font>
                                        </div>
                                        </div>
                                        <div style={{backgroundColor:"black",margin:10}}>
                                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                    {(e.duration === 12) && (
                                                        <font>
                                                        Annual Plan
                                                        </font>
                                                    )}
                                                    {(e.duration === 6) && (
                                                        <font>
                                                        6 Month Plan
                                                        </font>
                                                    )}
                                                    {(e.duration === 1) && (
                                                        <font>
                                                        1 Month Plan
                                                        </font>
                                                    )}
                                            </div>
                                            <div style={{margin:10,borderBottom:"1px solid white"}}></div>
                                            <div style={{margin:10,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <div style={{height:50,width:150,backgroundColor:"#fcc716",borderRadius:"10px 10px 10px 10px"}}>
                                                    <div style={{height:50,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                            {(e.duration === 12) && (
                                                                <font style={{color:'black',fontSize:'17px'}}>
                                                                SAVE 33%
                                                                </font>
                                                            )}
                                                            {(e.duration === 6) && (
                                                                <font style={{color:'black',fontSize:'17px'}}>
                                                                SAVE 17%
                                                                </font>
                                                            )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div style={{borderBottom:"1px solid white"}}></div>
                                            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                {(e.duration === 12) && (
                                                    <font style={{fontSize:'17px'}}>
                                                    Valid for <font style={{fontWeight:"bold",fontSize:'17px'}}>{e.duration} MONTHS</font>
                                                    </font>
                                                )}
                                                {(e.duration === 6) && (
                                                    <font style={{fontSize:'17px'}}>
                                                    Valid for <font style={{fontWeight:"bold",fontSize:'17px'}}>{e.duration} MONTHS</font>
                                                    </font>
                                                )}
                                                {(e.duration === 1) && (
                                                    <font style={{fontSize:'17px'}}>
                                                    Valid for <font style={{fontWeight:"bold",fontSize:'17px'}}>one MONTH</font>
                                                    </font>
                                                )}
                                            </div>
                                            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                {(e.duration === 12) && (
                                                    <font style={{fontSize:'17px'}}>
                                                    Renews Every year
                                                    </font>
                                                )}
                                                {(e.duration === 6) && (
                                                    <font style={{fontSize:'17px'}}>
                                                    Renews Every 6 MONTHS
                                                    </font>
                                                )}
                                                {(e.duration === 1) && (
                                                    <font style={{fontSize:'17px'}}>
                                                    Renews Every MONTH
                                                    </font>
                                                )}
                                            </div>
                                            <div style={{marginTop:20,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <font style={{fontSize:'17px'}}>
                                                Lower Marketing CoA, Higher ROI
                                                </font>
                                            </div>
                                            <div style={{marginTop:50,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <font style={{fontSize:'17px'}}>
                                                Powerful, Targeted Advertising Co-Op
                                                </font>
                                            </div>
                                            <div style={{marginTop:50,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <font style={{fontSize:'17px'}}>
                                                Hassle-free Autopay Billing
                                                </font>
                                            </div>
                                            <div style={{marginTop:50,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <font style={{fontSize:'17px'}}>
                                                Vetted/Top Rated Providers
                                                </font>
                                            </div>
                                            <div style={{borderBottom:"1px solid white"}}></div>
                                            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                <div onClick={() => this.register(e.id)} style={{cursor:"pointer",margin:10,width:"80%",height:50,backgroundColor:"#F74301",borderRadius:"10px 10px 10px 10px"}}>
                                                    <div style={{height:50,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                                    <font style={{color:"white"}}>
                                                        Select
                                                    </font>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Grid>
                            )
                        })}
                    </>
                    )
                    }
            </div>
            </Grid>
            </Grid>
            <Grid container xs="12">
            <Grid item xs="12">
            <div style={{marginTop:50,display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Grid container xs="12">
                    <Grid item xs="12">
                        <font style={{fontSize:"24px"}}>
                            Frequently asked Questions
                        </font>
                    </Grid>
                </Grid>
            </div>
                {faq.map((e) => {
                    return (
                    <>
                        <div style={{cursor:"pointer"}} onClick={() => this.selectFAQ(e.id)}>
                            <Grid container xs="12">
                                <Grid item xs="2"></Grid>
                                <Grid item xs="8">
                                    <div style={{display:'flex'}}>
                                        <div style={{flex:12}}>
                                            <font style={{fontSize:"18px"}}>
                                                {e.t}
                                            </font>
                                        </div>
                                        <div> 
                                        {(this.state.selIndex === e.id) && (
                                        <ExpandLessIcon/>
                                        )}
                                        {(this.state.selIndex !== e.id) && (
                                        <ExpandMoreIcon/>
                                        )}
                                        </div>
                                    </div>
                                </Grid>
                                <Grid item xs="2">
                                </Grid>
                            </Grid>
                            {(this.state.selIndex === e.id) && (
                                <Grid container xs="12"> 
                                    <Grid item xs="2"></Grid>
                                    <Grid item xs="8">
                                        <font style={{fontSize:"18px"}}>
                                            {e.a}
                                        </font>
                                    </Grid>
                                    <Grid item xs="2"></Grid>
                                </Grid>
                            )}
                            <Grid container xs="12" style={{marginBottom:20}}> 
                                <Grid item xs="2"></Grid>
                                <Grid item xs="8">
                                    <div style={{borderBottom:"1px solid #F74301"}}></div>
                                </Grid>
                                <Grid item xs="2">
                                </Grid>
                            </Grid>
                        </div>
                    </>
                )})}
            </Grid>
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        landingData: store.landingData
    }
}

export default connect(mapStateToProps)(Join);
