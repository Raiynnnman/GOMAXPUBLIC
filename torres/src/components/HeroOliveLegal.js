import React, { Component } from "react";


class HeroOliveProvider extends Component {
    render(){
        return(
            <div className={`header-area-legal ${this.props.horizontal} ${this.props.bgshape}`} id="home" >
                <div className="header-bg"/>
                <div className="container h-100 ">
                    <div className="row">
                        <div className="col-lg-6 h-100">
                            <div className="banner-text">
                                <div className="banner-table-cell">
                                    <h1 style={{color:"white"}}>America's <span style={{color:'#fa6a0a'}} className="theme-color">Largest</span><br/> Personal Injury Network</h1>
                                    <h3 style={{color:"white"}}>Generating Client Referrals At Scale With Advanced Technology.</h3>
                                    <p style={{color:"white"}}>At Pound Pain Tech, we understand the unique challenges that law firms face in acquiring clients, especially in the highly competitive field of personal injury law. Our innovative platform is designed to streamline the patient referral process, connecting lawyers with potential clients</p>
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

export default HeroOliveProvider;








