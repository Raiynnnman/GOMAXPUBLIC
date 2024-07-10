import React ,  { Component } from "react";
import { connect } from 'react-redux';
import DropdownMenu from './DropdownMenu';
import { logoutUser } from '../actions/auth';
import { delContext } from '../actions/delContext';
import { locationUpdate } from '../actions/location';

class Navbar extends Component {

    constructor(props) { 
        super(props);
        this.state = { 
            mylocation: null,
            prevlocation: null,
            delay:60000,
            geo: false,
        } 
        this.logout = this.logout.bind(this);
        this.leaveContext = this.leaveContext.bind(this);
        this.setLocation = this.setLocation.bind(this);
        this.sendLocation = this.sendLocation.bind(this);
    } 

    componentDidMount() { 
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.setLocation(position.coords.latitude, position.coords.longitude);
            }, this.getWithoutPermission);
        } else {
            this.setState({ geo: false });
        }
        setTimeout((e) => { e.sendLocation() }, this.state.delay, this)
    }
    
    doLogin() {  
        window.location = '/login';
    } 

    setLocation = (lat, lon) => {
        this.setState({ geo:true, mylocation: { lat, lon } });
    };

    getWithoutPermission = () => {
        this.setState({ geo: false });
    };

    sendLocation() { 
        setTimeout((e) => { e.sendLocation() }, this.state.delay, this)
        if (!this.state.geo) { return; } 
        if (!this.props.currentUser) { return; }
        if (this.state.prevlocation && 
            this.state.prevlocation.lat === this.state.mylocation.lat &&
            this.state.prevlocation.lon === this.state.mylocation.lon) { 
            return;
        }  
        this.state.prevlocation = this.state.mylocation;
        this.props.dispatch(locationUpdate(this.state.mylocation));
        this.setState(this.state);
    } 

    logout() { 
        this.props.dispatch(logoutUser());
    } 

    leaveContext() { 
        this.props.dispatch(delContext({},function(err,args) { 
            localStorage.removeItem("context");
            window.location.href = '/app';
        }));
    } 

    render(){
        const profileItems = [
            {n:'Leave Context',
             v:function(c) { 
                return (c.context ? true : false)
             },
             a:this.leaveContext,
             u:'/'
            },
            {n:'Logout',
             a:this.logout,
             v:function(c) { return true; },
             u:'/'  
            },
        ]
        const systemItems = [
            {
             n:'Providers',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/providers';
             }
            },
            {
             n:'Invoices',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/invoices';
             }
            },
            {
             n:'Commissions',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/commissions';
             }
            },
            {
             n:'Coupons',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/coupons';
             }
            },
            {
             n:'Plans',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/plans';
             }
            },
            {
             n:'Users',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/users';
             }
            },
        ];
        return(
            <div style={{backgroundColor:'black'}} className="app-header header--transparent sticker" id="main-menu">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-3 col-sm-4 col-4">
                            <div className="logo">
                                <a href='/'>
                                    <img className="logo-1" 
                                        style={{
                                            height:this.props.currentUser !== null ? '100px': '200px',
                                            width:this.props.currentUser !== null ? '100px': '200px'
                                        }} 
                                        src={require('../assets/images/logo/logo.png')} alt="app landing"/>
                                </a>
                            </div>
                        </div>
                        {(this.props.currentUser && this.props.currentUser.entitlements && 
                            this.props.currentUser.entitlements.includes('CRMUser')) && (
                        <>
                            <div className="col-lg-9 d-none d-lg-block">
                                <div className="mainmenu-wrapper">
                                    <nav>
                                        <ul className="main-menu">
                                            <li className="active"><a href="/app">Home</a></li>
                                            <li><a href="/app/main/admin/registrations">CRM</a></li>
                                            <li><a> 
                                                <DropdownMenu currentUser={this.props.currentUser} 
                                                    title={
                                                    this.props.currentUser.first_name + " " + this.props.currentUser.last_name
                                                          } items={profileItems} dispatch={this.props.dispatch}/>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                            <div className="col-sm-9 col-9 d-block d-lg-none">
                                <div className="mobile-menu">
                                    <nav>
                                        <ul>                              
                                            <li className="active"><a href="/app">Home</a></li>
                                            <li><a href="/app/main/admin/registrations">CRM</a></li>
                                            <li><a href="#"> // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                                <DropdownMenu currentUser={this.props.currentUser} 
                                                    title={
                                                    this.props.currentUser.first_name + " " + this.props.currentUser.last_name
                                                          } items={profileItems} dispatch={this.props.dispatch}/>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </>
                        )}
                        {(this.props.currentUser && this.props.currentUser.entitlements && 
                            this.props.currentUser.entitlements.includes('Customer')) && (
                        <>
                            <div className="col-lg-9 d-none d-lg-block">
                                <div className="mainmenu-wrapper">
                                    <nav>
                                        <ul className="main-menu">
                                            <li className="active"><a href="/app">Home</a></li>
                                            <li><a href="/app/main/client/appointments">Appointments</a></li>
                                            <li><a href="/app/main/client/chat">Chat</a></li>
                                            <li><a href="/app/main/client/search">Search</a></li>
                                            <li><a> 
                                                <DropdownMenu currentUser={this.props.currentUser} 
                                                    title={
                                                    this.props.currentUser.first_name + " " + this.props.currentUser.last_name
                                                          } items={profileItems} dispatch={this.props.dispatch}/>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                            <div className="col-sm-9 col-9 d-block d-lg-none">
                                <div className="mobile-menu">
                                    <nav>
                                        <ul>                              
                                            <li className="active"><a href="/app">Home</a></li>
                                            <li><a href="/app/main/client/appointments">Appointments</a></li>
                                            <li><a href="/app/main/client/search">Search</a></li>
                                            <li><a href="#"> // eslint-disable-next-line jsx-a11y/anchor-is-valid
                                                <DropdownMenu currentUser={this.props.currentUser} 
                                                    title={
                                                    this.props.currentUser.first_name + " " + this.props.currentUser.last_name
                                                          } items={profileItems} dispatch={this.props.dispatch}/>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                        </>
                        )}
                        {(this.props.currentUser && this.props.currentUser.entitlements && 
                            this.props.currentUser.entitlements.includes('OfficeAdmin')) && (
                            <>
                            <div className="col-lg-9 d-none d-lg-block">
                                <div className="mainmenu-wrapper">
                                    <nav>
                                        <ul className="main-menu">
                                            <li className="active"><a href="/app">Home</a></li>
                                            <li><a href="/app/main/office/clients">Clients</a></li>
                                            <li><a href="/app/main/office/locations">Locations</a></li>
                                            <li><a href="/app/main/office/chat">Chat</a></li>
                                            {/*<li><a href="/app/main/office/invoices">Invoices</a></li>*/}
                                            <li><a href="#">
                                                <DropdownMenu currentUser={this.props.currentUser} 
                                                    title={
                                                    this.props.currentUser.first_name + " " + this.props.currentUser.last_name
                                                          } items={profileItems} dispatch={this.props.dispatch}/>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                            <div className="col-sm-9 col-9 d-block d-lg-none">
                                <div className="mobile-menu">
                                    <nav>
                                        <ul>                              
                                            <li className="active"><a href="/app">Home</a></li>
                                            <li><a href="/app/main/admin/locations">Locations</a></li>
                                            <li><a href="/app/main/office/clients">Clients</a></li>
                                            <li><a href="#">
                                                <DropdownMenu currentUser={this.props.currentUser} 
                                                    title={
                                                    this.props.currentUser.first_name + " " + this.props.currentUser.last_name
                                                          } items={profileItems} dispatch={this.props.dispatch}/>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                            </>
                        )}
                        {(this.props.currentUser && this.props.currentUser.entitlements && 
                          this.props.currentUser.entitlements.includes('Admin') && !this.props.currentUser.context) && (
                            <>
                            <div className="col-lg-9 d-none d-lg-block">
                                <div className="mainmenu-wrapper">
                                    <nav>
                                        <ul className="main-menu">
                                            <li className="active"><a href="/app">Home</a></li>
                                            <li><a href="/app/main/admin/search">Search</a></li>
                                            <li><a href="/app/main/admin/customers">Customers</a></li>
                                            <li><a href="/app/main/admin/map">Map</a></li>
                                            <li><a href="/app/main/admin/registrations">CRM</a></li>
                                            <li><a>
                                                <DropdownMenu currentUser={this.props.currentUser} 
                                                    title='System' items={systemItems} dispatch={this.props.dispatch}/>
                                                </a>
                                            </li>
                                            <li><a>
                                                <DropdownMenu currentUser={this.props.currentUser} 
                                                    title={
                                                    this.props.currentUser.first_name + " " + this.props.currentUser.last_name
                                                          } items={profileItems} dispatch={this.props.dispatch}/>
                                                </a>
                                            </li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                            <div className="col-sm-9 col-9 d-block d-lg-none">
                                <div className="mobile-menu">
                                    <nav>
                                        <ul>                              
                                            <li className="active"><a href="/">Home</a></li>
                                            <li><a href="/app/main/admin/search">Search</a></li>
                                            <li><a href="/app/main/admin/customers">Customers</a></li>
                                            <li><a href="/app/main/admin/map">Map</a></li>
                                            <li><a href="/app/main/admin/registrations">CRM</a></li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                            </>
                        )}
                        {(!this.props.currentUser) && (
                            <>
                            <div className="col-lg-8 d-none d-lg-block">
                                <div className="mainmenu-wrapper">
                                    <nav>
                                        <ul className="main-menu">
                                            <li className="active"><a href="/">Home</a></li>
                                            <li><a href="/#about">About</a></li>
                                            <li><a href="/#pricing">Pricing</a></li>
                                            <li><a href="/#reviews">Reviews</a></li>
                                            <li><a href="/search">Search</a></li>
                                            <li><a href="/#support">Support</a></li>
                                        </ul>
                                    </nav>
                                    <button onClick={this.doLogin} className="button-default button-olive" type="button">Login</button>
                                </div>
                            </div>
                            <div className="col-sm-7 col-7 d-block d-lg-none">
                                <div className="mobile-menu">
                                    <nav>
                                        <ul>                              
                                            <li className="active"><a href="/">Home</a></li>
                                            <li><a href="/#about">About</a></li>
                                            <li><a href="/#pricing">Pricing</a></li>
                                            <li><a href="/#reviews">Reviews</a></li>
                                            <li><a href="/search">Search</a></li>
                                            <li><a href="/#support">Support</a></li>
                                            <li><a href="/login">Login</a></li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser
    }
}

export default connect(mapStateToProps)(Navbar);
