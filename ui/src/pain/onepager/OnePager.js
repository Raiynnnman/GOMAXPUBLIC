import React, { Component } from 'react';
import { Button } from 'reactstrap'; 
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import SearchIcon from '@mui/icons-material/Search';
import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import UpdateIcon from '@mui/icons-material/Update';
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import { connect } from 'react-redux';
import { Col, Row } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';

import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getTraffic } from '../../actions/trafficGet';
import ProviderMap from './ProviderMap';
import baseURLConfig from '../../baseURLConfig';

class OnePager extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
    } 

    componentWillReceiveProps(p) { 
    }

    componentDidMount() {
        this.props.dispatch(
            getTraffic({categories:[99]}
            )
        )
    }

    render() {
        return (
        <>
            <Row md="12" style={{margin:0,height:400}}>
                <Col md="6">
                <>
                    <font style={{fontWeight:600,fontSize:"5.1rem",color:"#fa6a0a"}}>
                        Expand&nbsp;
                    </font>
                    <font style={{fontWeight:600,fontSize:"5.1rem",color:"black"}}>
                        Your&nbsp;
                    </font>
                    <font style={{fontWeight:600,fontSize:"5.1rem",color:"#fa6a0a"}}>
                    Personal Injury&nbsp;
                    </font>
                    <font style={{fontWeight:600,fontSize:"5.1rem",color:"black"}}>
                        Practice With #PAIN
                    </font>
                    <div style={{textAlign:'center',margin:20,display:'flex',alignContent:'center',justifyContent:'center'}}>
                        This innovative, patent pending platform links Personal Injury Law Firms & Medical Providers 
                        into one seamless network, simplifying the Business- to- Business referral process. 
                        With #PAIN, Attorneys can quickly refer clients to Medical Providers through our HIPAA 
                        compliant case management system where both parties can communicate and transfer documents effortlessly.
                    </div>
                </>
                </Col>                
                {(this.props.trafficData && this.props.trafficData.data && this.props.trafficData.data.center) && (
                <Col md="6">
                    <ProviderMap data={this.props.trafficData} centerPoint={this.props.trafficData.data.center}/>
                </Col>                
                )}
            </Row>
            <Row md="12" style={{marginTop:100}}>
                <Col md="12">
                    <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                        <Card style={{
                            margin:20,
                            borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}} className="mb-xlg border-1">
                            <CardBody>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <img src='/lawyers.png'/>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <h3>Lawyers</h3>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{textAlign:'center',display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <h4>Have a client in need of medical treatment? </h4>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{textAlign:'center',display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <h4>Search for provider options based on specialty and location.</h4>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <Button outline onClick={this.lawyerMore} color="primary">Learn More</Button>
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                        <Card style={{
                            margin:20,
                            borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}} className="mb-xlg border-1">
                            <CardBody>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <img src='/providers.png'/>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <h3>Medical Providers</h3>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{textAlign:'center',display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <h4>Looking to grow your practice?</h4> 
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{textAlign:'center',display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <h4>Enable your office to receive seamless referrals</h4>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{textAlign:'center',display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <h4>from our entire network of Personal Injury attorneys.</h4>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <Button outline onClick={this.lawyerMore} color="primary">Learn More</Button>
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                        
                    </div>
                </Col>
            </Row>
            <Row md="12" style={{marginTop:40}}>
                <Col md="12">
                    <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                        <Card style={{
                            margin:20,
                            borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}} className="mb-xlg border-1">
                            <CardBody>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <img width="50%" height="50%" src='/lawyers-img.webp'/>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{backgroundColor:"#F9FBFD",borderRadius:"10px",
                                                boxShadow:"rgba(0, 0, 0, 0.30) 0px 5px 15px 0px"}}>
                                            <div style={{display:'flex',alignContent:'center',justifyContent:'start'}}>
                                            <AppRegistrationIcon style={{margin:20}}/>&nbsp;
                                            <font style={{margin:20,fontSize:18}}>
                                            Register at <a target="_blank" style={{color:"#fa6a0a"}} href={baseURLConfig() + "/#/register-legal"}>#PAIN</a>
                                            </font>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{backgroundColor:"#F9FBFD",borderRadius:"10px",
                                                boxShadow:"rgba(0, 0, 0, 0.30) 0px 5px 15px 0px"}}>
                                            <div style={{display:'flex',alignContent:'center',justifyContent:'start'}}>
                                            <AccountBoxIcon style={{margin:20}}/>&nbsp;
                                            <font style={{margin:20,fontSize:18}}>
                                            Create law firm profile
                                            </font>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{backgroundColor:"#F9FBFD",borderRadius:"10px",
                                                boxShadow:"rgba(0, 0, 0, 0.30) 0px 5px 15px 0px"}}>
                                            <div style={{display:'flex',alignContent:'center',justifyContent:'start'}}>
                                            <SearchIcon style={{margin:20}}/>&nbsp;
                                            <font style={{margin:20,fontSize:18}}>
                                            Search for a medical provider
                                            </font>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{backgroundColor:"#F9FBFD",borderRadius:"10px",
                                                boxShadow:"rgba(0, 0, 0, 0.30) 0px 5px 15px 0px"}}>
                                            <div style={{display:'flex',alignContent:'center',justifyContent:'start'}}>
                                            <EmojiPeopleIcon style={{margin:20}}/>&nbsp;
                                            <font style={{margin:20,fontSize:18}}>
                                            Submit new client referral
                                            </font>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{backgroundColor:"#F9FBFD",borderRadius:"10px",
                                                boxShadow:"rgba(0, 0, 0, 0.30) 0px 5px 15px 0px"}}>
                                            <div style={{display:'flex',alignContent:'center',justifyContent:'start'}}>
                                            <InsertChartIcon style={{margin:20}}/>&nbsp;
                                            <font style={{margin:20,fontSize:18}}>
                                            Track client progress
                                            </font>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{backgroundColor:"#F9FBFD",borderRadius:"10px",
                                                boxShadow:"rgba(0, 0, 0, 0.30) 0px 5px 15px 0px"}}>
                                            <div style={{display:'flex',alignContent:'center',justifyContent:'start'}}>
                                            <CloudDownloadIcon style={{margin:20}}/>&nbsp;
                                            <font style={{margin:20,fontSize:18}}>
                                            Download medical reports
                                            </font>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <Button outline style={{margin:20,borderRadius:"10px"}} 
                                            onClick={() => { window.location.href='/#/landing'}} color="primary">Schedule a Demo</Button>
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                        <Card style={{
                            margin:20,
                            borderRadius:"10px",boxShadow:"rgba(0, 0, 0, 0.15) 0px 5px 15px 0px"}} className="mb-xlg border-1">
                            <CardBody>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <img width="50%" height="50%" src='/medical-img.webp'/>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{backgroundColor:"#F9FBFD",borderRadius:"10px",
                                                boxShadow:"rgba(0, 0, 0, 0.30) 0px 5px 15px 0px"}}>
                                            <div style={{display:'flex',alignContent:'center',justifyContent:'start'}}>
                                            <AppRegistrationIcon style={{margin:20}}/>&nbsp;
                                            <font style={{margin:20,fontSize:18}}>
                                            Register at <a target="_blank" style={{color:"#fa6a0a"}} href={baseURLConfig() + "/#/register-provider"}>#PAIN</a>
                                            </font>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{backgroundColor:"#F9FBFD",borderRadius:"10px",
                                                boxShadow:"rgba(0, 0, 0, 0.30) 0px 5px 15px 0px"}}>
                                            <div style={{display:'flex',alignContent:'center',justifyContent:'start'}}>
                                            <AccountBoxIcon style={{margin:20}}/>&nbsp;
                                            <font style={{margin:20,fontSize:18}}>
                                            Create provider profile
                                            </font>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{backgroundColor:"#F9FBFD",borderRadius:"10px",
                                                boxShadow:"rgba(0, 0, 0, 0.30) 0px 5px 15px 0px"}}>
                                            <div style={{display:'flex',alignContent:'center',justifyContent:'start'}}>
                                            <SearchIcon style={{margin:20}}/>&nbsp;
                                            <font style={{margin:20,fontSize:18}}>
                                            Access directory of registered attorneys
                                            </font>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{backgroundColor:"#F9FBFD",borderRadius:"10px",
                                                boxShadow:"rgba(0, 0, 0, 0.30) 0px 5px 15px 0px"}}>
                                            <div style={{display:'flex',alignContent:'center',justifyContent:'start'}}>
                                            <EmojiPeopleIcon style={{margin:20}}/>&nbsp;
                                            <font style={{margin:20,fontSize:18}}>
                                            Process appointments 
                                            </font>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{backgroundColor:"#F9FBFD",borderRadius:"10px",
                                                boxShadow:"rgba(0, 0, 0, 0.30) 0px 5px 15px 0px"}}>
                                            <div style={{display:'flex',alignContent:'center',justifyContent:'start'}}>
                                            <UpdateIcon style={{margin:20}}/>&nbsp;
                                            <font style={{margin:20,fontSize:18}}>
                                            Provide timely updates
                                            </font>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{backgroundColor:"#F9FBFD",borderRadius:"10px",
                                                boxShadow:"rgba(0, 0, 0, 0.30) 0px 5px 15px 0px"}}>
                                            <div style={{display:'flex',alignContent:'center',justifyContent:'start'}}>
                                            <CloudDownloadIcon style={{margin:20}}/>&nbsp;
                                            <font style={{margin:20,fontSize:18}}>
                                            Download medical reports
                                            </font>
                                            </div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                            <div style={{height:20,width:5,backgroundColor:"#fa6a0a"}}></div>
                                        </div>
                                    </Col>
                                </Row>
                                <Row md="12">
                                    <Col md="12">
                                        <div style={{display:'flex',alignContent:'center',justifyContent:'center'}}>
                                        <Button outline style={{margin:20,borderRadius:"10px"}} 
                                            onClick={() => { window.location.href='/#/landing'}} color="primary">Schedule a Demo</Button>
                                        </div>
                                    </Col>
                                </Row>
                            </CardBody>
                        </Card>
                        
                    </div>
                </Col>
            </Row>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        trafficData: store.trafficData
    }
}

export default connect(mapStateToProps)(OnePager);
