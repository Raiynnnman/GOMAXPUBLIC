import React, { Component } from "react";


class HeroOlive extends Component {
    render(){
        return(
            <div className={`slider-area bg-color ${this.props.horizontal} ${this.props.bgshape}`} id="home"  style={{background:'#fa6a0a'}}>
                <div className="container h-100">
                    <div className="row">
                        <div className="col-lg-7 h-100">
                            <div className="banner-text">
                                <div className="banner-table-cell">
                                    <h1>Revolutionizing <span style={{color:'black'}} className="theme-color">Patient Referrals</span><br/> for Care Providers Across the U.S.</h1>
                                    <h3>Effortlessly connect with new patients and grow your practice with Pound Pain Technology.</h3>
                                    <p>Welcome to Pound Pain Technology, your ultimate solution for seamless patient referrals and practice growth. In today’s fast-paced healthcare environment, connecting with the right patients at the right time can be challenging. That's where we come in.
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
                        <div className="col-lg-5">
                            <div className="banner-product-image text-right">
                                <img className="image-1" src={require('../assets/main_page/banner-mobile-provider.png')} alt="App Landing"/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default HeroOlive;








