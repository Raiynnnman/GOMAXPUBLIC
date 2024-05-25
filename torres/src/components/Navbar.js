import React ,  { Component } from "react";
import { connect } from 'react-redux';

class Navbar extends Component {
    constructor(props) { 
        super(props);
        this.dologin = this.dologin.bind(this);
        this.doregister = this.doregister.bind(this);
    } 
    componentDidMount() { 
    } 
    componentWillMount() { 
    } 
    dologin() { 
        console.log("here");
        window.location = '/login';
    } 
    doregister() { 
        window.location = '/register';
    } 
    render(){
        return(
            <>
            <div className="row" style={{height:90}}>
                <div className="app-header header--transparent sticker" id="main-menu" 
                    style={{background:'#2d3e50'}}>
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-4 col-sm-5 col-5">
                                <div className="logo">
                                    <a href='/'>
                                        <img className="logo-1" style={{height:80,width:80}}
                                            src={require('../assets/images/logo/logo.png')} alt="app landing"/>
                                    </a>
                                </div>
                            </div>
                            <div className="col-lg-8 d-none d-lg-block">
                                <div className="mainmenu-wrapper">
                                    <nav>
                                        <ul className="main-menu">
                                            <li className="active"><a href="/">Home</a></li>
                                            <li><a href="/#about">About</a></li>
                                            <li><a href="/#features">Features</a></li>
                                            <li><a href="/#pricing">Pricing</a></li>
                                            <li><a href="/#reviews">Reviews</a></li>
                                            <li><a href="/#support">Support</a></li>
                                        </ul>
                                    </nav>
                                    <button onClick={this.dologin} className="button-default button-olive" type="button">Login</button>
                                    <button onClick={this.doregister} style={{marginLeft:10}} className="button-default button-olive" type="button">Register</button>
                                </div>
                            </div>
                            <div className="col-sm-7 col-7 d-block d-lg-none">
                                <div className="mobile-menu">
                                    <nav>
                                        <ul>                              
                                            <li className="active"><a href="/#home">Home</a></li>
                                            <li><a href="/#about">About</a></li>
                                            <li><a href="/#features">Features</a></li>
                                            <li><a href="/#pricing">Pricing</a></li>
                                            <li><a href="/#reviews">Reviews</a></li>
                                            <li><a href="/#support">Support</a></li>
                                        </ul>
                                    </nav>
                                    <button onClick={this.dologin} className="button-default button-olive" type="button">Login</button>
                                    <button onClick={this.doregister} style={{marginLeft:10}} className="button-default button-olive" type="button">Register</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            </>
        )
    }
}

const mapStateToProps = store => ({
  currentUser: store.auth.currentUser
});

export default connect(mapStateToProps)(Navbar);


