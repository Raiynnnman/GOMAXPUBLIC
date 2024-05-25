import React, { Component } from 'react';
import Select from 'react-select';
import { Form, FormGroup, Label, Input, InputGroup, InputGroupText } from 'reactstrap';
import { Button } from 'reactstrap';
import { Card, CardBody, CardTitle, CardText, CardImg, } from 'reactstrap';
import { connect } from 'react-redux';
import SearchIcon from '@mui/icons-material/Search';
import { Col, Grid } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getLandingData } from '../../actions/landingData';
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
        this.setState(this.state);
    }

    componentDidMount() {
        this.props.dispatch(getLandingData({}));
        this.state.location = this.props.match.path;
        this.setState(this.state);
    }

    selectMenu(e) { 
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
            {(this.props.landingData && this.props.landingData.data && this.props.landingData.data.pricing) && (
            <>
            <div style={{backgroundColor:'black',display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <img width="330px" height="330px" src='/painlogo.png'/>
            </div>
            <div style={{height:800,backgroundColor:"black"}}>
                <div style={{backgroundColor:"black",display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <>
                    <Grid md="12">
                        {/*<Grid item  md="6" sx="6" style={{paddingLeft:0,marginLeft:0}}>
                            <div style={{backgroundColor:"black",display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <iframe 
                                    src={
                                        this.props.landingData.data.introduction.length > 0 ? 
                                            this.props.landingData.data.introduction[0].url : 
                                            "https://player.vimeo.com/video/939097958?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" 
                                    }
                                    allow="autoplay; fullscreen; picture-in-picture; clipboard-write" 
                                    style={{width:window.innerWidth < 500 ? window.innerWidth : "800px",
                                            height:window.innerWidth < 500 ? "100%vw" : "600px",
                                            }}
                                    title="PoundPain Sample">
                                </iframe>
                            </div>
                        </Grid>*/}
                        <Grid item  md="12" sx="12" style={{marginTop:10,paddingRight:0,marginRight:0}}>
                            <div style={{backgroundColor:"black",display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <iframe 
                                    src={
                                        this.props.landingData.data.introduction.length > 0 ? 
                                            this.props.landingData.data.introduction[1].url : 
                                            "https://calendly.com/d/ck2s-xvq-t7n/poundpain-introduction"
                                    }
                                    style={{width:window.innerWidth < 500 ? window.innerWidth : "600px",
                                            height:window.innerWidth < 500 ? "800px" : "800px",
                                            }}
                                    title="PoundPain Invite">
                                </iframe>
                            </div>
                        </Grid>
                    </Grid>
                    </>
                </div>
            </div>
            </>
            )}
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
