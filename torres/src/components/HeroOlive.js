import React, { Component } from "react";


class HeroOlive extends Component {
    render(){
        return(
            <div className={`header-area ${this.props.horizontal} ${this.props.bgshape}`} id="home" >
                <div className="header-bg"/>
                <div className="container h-100 ">
                    <div className="row">
                        <div className="col-lg-6 h-100">
                            <div className="banner-text">
                                <div className="banner-table-cell">
                                    <h1 style={{color:"white"}}>Revolutionizing <span style={{color:'#fa6a0a'}} className="theme-color">Patient Referrals</span><br/> Nationwide</h1>
                                    <h3 style={{color:"white"}}>Effortlessly connect with new patients and grow your practice with Pound Pain Technology.</h3>
                                    <p style={{color:"white"}}>Welcome to Pound Pain Technology, your ultimate solution for seamless patient referrals and practice growth. In today’s fast-paced healthcare environment, connecting with the right patients at the right time can be challenging. That's where we come in.
                                    </p>
                                    {(false) && (<div className="banner-buttons">
                                        <button type="button" className="button-default button-olive">Sign Up!</button>
                                        <a className="button-default button-white" href="/" role="button">Learn more</a>
                                    </div>
                                    )}
                                </div>
                            </div>

                            {(false) && (
                            <>
                            <div className="banner-apps"> 
                                <div className="single-app">
                                    <div className="single-app-table-cell">
                                        <i className="zmdi zmdi-apple"></i>
                                        <h4>ios</h4>
                                        <h3>102K</h3>
                                    </div>
                                </div>

                                <div className="single-app">
                                    <div className="single-app-table-cell">
                                        <i className="zmdi zmdi-cloud-download"></i>
                                        <h4>Download</h4>
                                        <h3>102K</h3>
                                    </div>
                                </div>

                                <div className="single-app">
                                    <div className="single-app-table-cell">
                                        <i className="zmdi zmdi-android"/>
                                        <h4>Android</h4>
                                        <h3>102K</h3>
                                    </div>
                                </div>
                            </div>
                            </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default HeroOlive;








