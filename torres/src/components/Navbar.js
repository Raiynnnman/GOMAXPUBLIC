import React ,  { Component } from "react";
import { connect } from 'react-redux';

class Navbar extends Component {
    doLogin() {  
        window.location = '/login';
    } 
    render(){
        console.log("p",this.props);
        return(
            <div style={{backgroundColor:'#2d3e50'}} className="app-header header--transparent sticker" id="main-menu">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-3 col-sm-3 col-3">
                            <div className="logo">
                                <a href='/'>
                                    <img className="logo-1" style={{height:'100px'}} src={require('../assets/images/logo/logo.png')} alt="app landing"/>
                                </a>
                            </div>
                        </div>
                        {(this.props.currentUser && this.props.currentUser.entitlements && this.props.currentUser.entitlements.includes('Admin')) && (
                            <>
                            <div className="col-lg-9 d-none d-lg-block">
                                <div className="mainmenu-wrapper">
                                    <nav>
                                        <ul className="main-menu">
                                            <li className="active"><a href="/">Home</a></li>
                                            <li><a href="/app/main/admin/search">Search</a></li>
                                            <li><a href="/app/main/admin/customers">Customers</a></li>
                                            <li><a href="/app/main/admin/one-pager">One Page</a></li>
                                            <li><a href="/app/main/admin/referrals">Referrals</a></li>
                                            <li><a href="/app/main/admin/map">Map</a></li>
                                            <li><a href="/app/main/admin/registrations">Registrations</a></li>
                                            <li><a href="/app/main/admin/registrations">{this.props.currentUser.first_name + " " + this.props.currentUser.last_name}</a></li>
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
                                            <li><a href="/app/main/admin/one-pager">One Page</a></li>
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
