import React, { Component } from 'react';
import Select from 'react-select';
import { Form, FormGroup, Label, Input, InputGroup, InputGroupText } from 'reactstrap';
import { Button } from 'reactstrap';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { connect } from 'react-redux';
import SearchIcon from '@mui/icons-material/Search';
import { Col, Row } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import s from '../utils/default.module.scss';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getLandingData } from '../../actions/landingData';
import { register } from '../../actions/registration';
import createDOMPurify from 'dompurify'
import { JSDOM } from 'jsdom'
import AliceCarousel from 'react-alice-carousel';
import { Nav, NavItem, NavLink } from 'reactstrap';
import 'react-alice-carousel/lib/alice-carousel.css';
import './Landing.scss';
import Home from './Home';
import Join from './Join';

const handleDragStart = (e) => e.preventDefault();

class Landing extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
            selected:null,
            location:"/landing",
            faq:false,
            index:0
        } 
        this.selectMenu = this.selectMenu.bind(this);
        this.openFAQ = this.openFAQ.bind(this);
        this.register = this.register.bind(this);
        this.setEmail= this.setEmail.bind(this);
        this.setPhone = this.setPhone.bind(this);
        this.cancel = this.cancel.bind(this);
        this.save = this.save.bind(this);
        this.left = this.left.bind(this);
        this.right = this.right.bind(this);
        this.onGendChange = this.onGendChange.bind(this);
        this.onTimeChange = this.onTimeChange.bind(this);
        this.setLast = this.setLast.bind(this);
        this.setFirst = this.setFirst.bind(this);
        this.setAge = this.setAge.bind(this);
        this.setCity = this.setCity.bind(this);
        this.setStat = this.setStat.bind(this);
        this.setAddr = this.setAddr.bind(this);
        this.setZip = this.setZip.bind(this);
        this.setComments = this.setComments.bind(this);
        this.setProc = this.setProc.bind(this);
    } 

    componentWillReceiveProps(p) { 
        if (window.location.href.includes("join")) { 
            this.state.location = "/join";
        } 
        console.log("s",this.state);
        this.setState(this.state);
    }

    componentDidMount() {
        this.props.dispatch(getLandingData({}));
        this.state.location = this.props.match.path;
        console.log("s",this.state);
        this.setState(this.state);
    }

    selectMenu(e) { 
        console.log(e);
        window.location = e;
        this.state.location = e;
        this.setState(this.state);
    } 

    cancel() { 
        this.state.selected=null;
        this.setState(this.state);
    } 
    save() { 
        this.props.dispatch(register(this.state.selected)).then((e) => {
            window.location = '/#/thankyou';
        }); 
    } 
    login() { 
            window.location = '/#/login';
    } 
    search() { 
            window.location = '/#/search';
    } 
    onGendChange(e) { 
        this.state.selected.gender = e.value;
        this.setState(this.state);
    } 
    onTimeChange(e) { 
        this.state.selected.timeframe = e.value;
        this.setState(this.state);
    } 
    setCity(e) {
        this.state.selected.city=e.target.value;
        this.setState(this.state);
    } 
    setProc(e) {
        this.state.selected.procs=e.target.value;
        this.setState(this.state);
    } 
    setComments(e) {
        this.state.selected.comments=e.target.value;
        this.setState(this.state);
    } 
    openFAQ() { 
        this.state.faq = !this.state.faq;
        this.setState(this.state);
    } 
    setStat(e) {
        this.state.selected.state=e.target.value;
        this.setState(this.state);
    } 
    setAddr(e) {
        this.state.selected.addr1=e.target.value;
        this.setState(this.state);
    } 
    setAge(e) {
        this.state.selected.age=e.target.value;
        this.setState(this.state);
    } 
    setZip(e) { 
        this.state.selected.zipcode=e.target.value;
        this.setState(this.state);
    } 
    setPhone(e) { 
        let val = e.target.value.replace(/\D/g, "")
        .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
        let validPhone = !val[2] ? val[1]: "(" + val[1] + ") " + val[2] + (val[3] ? "-" + val[3] : "");
        this.setState(prevState => ({
          selected: {
            ...prevState.selected,
            phone: validPhone
          }
        }));
        if (validPhone.length < 14 && validPhone.length > 0) {
          this.setState({ phoneMessage: 'Please add a 10 digit phone number' });
      } else {
          this.setState({ phoneMessage: '' });
      }
    }

    setEmail(e) {
        this.state.selected.email = e.target.value;
        this.setState(this.state)
        //validate email 
        const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
        this.state.isValid = emailRegex.test(this.state.selected.email);
        if (this.state.isValid) {
          this.setState(prevState => ({
            register: {
              ...prevState.register,
              email: this.state.selected.email
            },
            errorMessage: '',
          }));
        } else {
          this.setState({ errorMessage: 'Invalid email format' });
        }
    }
    setFirst(e) {
        this.state.selected.first_name = e.target.value;
        this.setState(this.state)
    }
    setLast(e) { 
        this.state.selected.last_name = e.target.value;
        this.setState(this.state)
    }

    register(e) { 
        this.state.selected = {
            type:e,
            email:'',
            age:'',
            addr1:'',
            city:'',
            timeframe:'',
            gender:'',
            state:'',
            zipcode:'',
            comments:'',
            procs:'',
            first_name:'',
            last_name:'',
            phone:''
        } 
        this.setState(this.state);
    } 
    left() { 
        if (this.state.index - 1 < 0) { return; }
        this.state.index = this.state.index - 1;
        this.setState(this.state);
    } 
    right() { 
        if (this.state.index + 1 > this.props.landingData.data.reviews.length) { return; }
        this.state.index = this.state.index + 1;
        if (this.state.index + 3 > this.props.landingData.data.reviews.length) { 
            this.state.index = this.props.landingData.data.reviews.length - 3;
        }
        this.setState(this.state);
    } 

    render() {
        console.log("s",this.state);
        console.log("p",this.props);
        var rev = [];
        var c = this.state.index;
        if (this.props.landingData && this.props.landingData.data && this.props.landingData.data.reviews) { 
            for (c; c < this.state.index + 3;c++) { 
                if (c > this.props.landingData.data.reviews.length) { continue; }
                rev.push(this.props.landingData.data.reviews[c]);
            } 
        }
        return (
        <>
            <div style={{backgroundColor:"black",color:"white"}}>
                <div style={{marginLeft:150,marginRight:150,position:"sticky",top:"0px",zIndex:1000,backgroundColor:"black"}}>
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
                        <div style={{height:50,display: 'flex', alignItems: 'end',marginTop:20}} className="home-menu">
                            <a href="/" onClick={() => this.selectMenu("/#")}><font style={{fontFamily:"sans-serif",fontSize:"16px"}}>Home</font></a>
                        </div>
                        <div style={{height:50,display: 'flex', alignItems: 'end',marginTop:20}} className="home-menu">
                            <a onClick={() => this.selectMenu("/#/join")} ><font style={{fontFamily:"sans-serif",fontSize:"16px"}}>Join Our Network</font></a>
                        </div>
                        <div style={{height:50,display: 'flex', alignItems: 'end',marginTop:20}} className="home-menu">
                            <a href="/#/provider" onClick={() => this.selectMenu("/#/provider")}><font style={{fontFamily:"sans-serif",fontSize:"16px"}}>Preferred Provider</font></a>
                        </div>
                        <div style={{height:50,display: 'flex', alignItems: 'end',marginTop:20}} className="home-menu">
                            <a href="/#/about-us" onClick={() => this.selectMenu("/#/about-us")}><font style={{fontFamily:"sans-serif",fontSize:"16px"}}>About Us</font></a>
                        </div>
                        <div style={{height:50,display: 'flex', alignItems: 'end',marginTop:20}} className="home-menu">
                            <a href="/#/contact-us" onClick={() => this.selectMenu("/#")}><font style={{fontFamily:"sans-serif",fontSize:"16px"}}>Contact Us</font></a>
                        </div>
                        <div style={{height:50,display: 'flex', alignItems: 'end',marginTop:20}} className="home-menu">
                            <a href="/#/careers" onClick={() => this.selectMenu("/#")}><font style={{fontFamily:"sans-serif",fontSize:"16px"}}>Careers</font></a>
                        </div>
                        <div style={{height:50,display: 'flex', alignItems: 'end',marginTop:20}} className="home-menu">
                            <a href="/#/login"><font style={{fontFamily:"sans-serif",fontSize:"16px"}}>Login</font></a>
                        </div>
                    </div>
                </div>
                {(this.state.location === "/") && (
                    <Home landingData={this.props.landingData}/>
                )}
                {(this.state.location === "/landing") && (
                    <Home landingData={this.props.landingData}/>
                )}
                {(this.state.location === "/#/join") && (
                    <Join landingData={this.props.landingData}/>
                )}
                {(this.state.location === "/join") && (
                    <Join landingData={this.props.landingData}/>
                )}
                <div style={{marginTop:20}}> 
                    <Row md="12">
                        <Col md="3"></Col>
                        <Col md="3"> 
                            <Row md="12">
                            Chase Plaza Towers
                            </Row>
                            <Row md="12">
                            121 S Orange Ave. Suite. 1220
                            </Row>
                            <Row md="12">
                            Orlando, FL 32801
                            </Row>
                            <Row md="12">&nbsp;</Row>
                            <Row md="12">
                            info@poundpain.com
                            </Row>
                        </Col>
                        <Col md="3"> 
                            <Row md="12">
                                <a href="/">Home</a>
                            </Row>
                            <Row md="12" style={{marginTop:5}}>
                                <a href="/contact-us">Contact Us</a>
                            </Row>
                            <Row md="12" style={{marginTop:5}}>
                                <a href="/terms-of-service">Terms of Service</a>
                            </Row>
                            <Row md="12" style={{marginTop:5}}>
                                <a href="/privacy-policy">Privacy Policy</a>
                            </Row>
                        </Col>
                        <Col md="3"> 
                            <a href="https://www.facebook.com/poundpainusa"><img src="/facebook.webp"/></a>
                            <a href="https://www.instagram.com/poundpain/"><img src="/instagram.webp" style={{marginLeft:"-10px"}}/></a>
                        </Col>
                    </Row>
                </div>
            </div>
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

export default connect(mapStateToProps)(Landing);
