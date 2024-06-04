import React ,  { Component } from "react";
import { connect } from 'react-redux';
import DropdownMenu from './DropdownMenu';
import { logoutUser } from '../actions/auth';
import { delContext } from '../actions/delContext';

class Navbar extends Component {

    constructor(props) { 
        super(props);
        this.logout = this.logout.bind(this);
        this.leaveContext = this.leaveContext.bind(this);
    } 
    
    doLogin() {  
        window.location = '/login';
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
                        <div className="col-lg-3 col-sm-3 col-3">
                            <div className="logo">
                                <a href='/'>
                                    <img className="logo-1" style={{height:'100px'}} src={require('../assets/images/logo/logo.png')} alt="app landing"/>
                                </a>
                            </div>
                        </div>
                        {(this.props.currentUser && this.props.currentUser.entitlements && 
                            this.props.currentUser.entitlements.includes('Customer')) && (
                        <>
                            <div className="col-lg-9 d-none d-lg-block">
                                <div className="mainmenu-wrapper">
                                    <nav>
                                        <ul className="main-menu">
                                            <li className="active"><a href="/app">Home</a></li>
                                            <li><a href="/app/main/client/appointments">Appointments</a></li>
                                            <li><a href="/app/main/client/search">Search</a></li>
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
                                            <li><a href="/app/main/client/appointments">Appointments</a></li>
                                            <li><a href="/app/main/client/search">Search</a></li>
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
                            this.props.currentUser.entitlements.includes('OfficeAdmin')) && (
                            <>
                            <div className="col-lg-9 d-none d-lg-block">
                                <div className="mainmenu-wrapper">
                                    <nav>
                                        <ul className="main-menu">
                                            <li className="active"><a href="/app">Home</a></li>
                                            <li><a href="/app/main/office/clients">Clients</a></li>
                                            <li><a href="/app/main/office/locations">Locations</a></li>
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
                                            <li><a href="/app/main/admin/referrals">Referrals</a></li>
                                            <li><a href="/app/main/admin/map">Map</a></li>
                                            <li><a href="/app/main/admin/registrations">Registrations</a></li>
                                            <li><a href="#">
                                                <DropdownMenu currentUser={this.props.currentUser} 
                                                    title='System' items={systemItems} dispatch={this.props.dispatch}/>
                                                </a>
                                            </li>
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
                                            <li className="active"><a href="/">Home</a></li>
                                            <li><a href="/app/main/admin/search">Search</a></li>
                                            <li><a href="/app/main/admin/referrals">Referrals</a></li>
                                            <li><a href="/app/main/admin/map">Map</a></li>
                                            <li><a href="/app/main/admin/registrations">Registrations</a></li>
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
                                            <li className="active"><a href="#home">Home</a></li>
                                            <li><a href="#about">About</a></li>
                                            <li><a href="#pricing">Pricing</a></li>
                                            <li><a href="#reviews">Reviews</a></li>
                                            <li><a href="/search">Search</a></li>
                                            <li><a href="#support">Support</a></li>
                                        </ul>
                                    </nav>
                                    <button onClick={this.doLogin} className="button-default button-olive" type="button">Login</button>
                                </div>
                            </div>
                            <div className="col-sm-7 col-7 d-block d-lg-none">
                                <div className="mobile-menu">
                                    <nav>
                                        <ul>                              
                                            <li className="active"><a href="#home">Home</a></li>
                                            <li><a href="#about">About</a></li>
                                            <li><a href="#pricing">Pricing</a></li>
                                            <li><a href="#reviews">Reviews</a></li>
                                            <li><a href="/search">Search</a></li>
                                            <li><a href="#support">Support</a></li>
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