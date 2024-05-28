import React ,  { Component } from "react";

class Navbar extends Component {
    doLogin() {  
        window.location = '/login';
    } 
    render(){
        return(
            <div style={{backgroundColor:'#2d3e50'}} className="app-header header--transparent sticker" id="main-menu">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-4 col-sm-5 col-5">
                            <div className="logo">
                                <a href='/'>
                                    <img className="logo-1" style={{height:'100px'}} src={require('../assets/images/logo/logo.png')} alt="app landing"/>
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-8 d-none d-lg-block">
                            <div className="mainmenu-wrapper">
                                <nav>
                                    <ul className="main-menu">
                                        <li className="active"><a href="#home">Home</a></li>
                                        <li><a href="#about">About</a></li>
                                        <li><a href="#features">Features</a></li>
                                        <li><a href="#pricing">Pricing</a></li>
                                        <li><a href="#reviews">Reviews</a></li>
                                        <li><a href="#screenshots">Screenshots</a></li>
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
                                        <li><a href="#features">Features</a></li>
                                        <li><a href="#pricing">Pricing</a></li>
                                        <li><a href="#reviews">Reviews</a></li>
                                        <li><a href="#screenshots">Screenshots</a></li>
                                        <li><a href="#support">Support</a></li>
                                        <li><a href="/login">Login</a></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default Navbar;


