import React, { Component } from "react";


class HeroOliveCustomer extends Component {
    render(){
        return(
            <div className={`slider-area bg-color ${this.props.horizontal} ${this.props.bgshape}`} id="home"  style={{background:'#fa6a0a'}}>
                <div className="container h-100">
                    <div className="row">
                        <div className="col-lg-7 h-100">
                            <div className="banner-text">
                                <div className="banner-table-cell">
                                    <h1>Find the Best Care Providers in Your Area, <span style={{color:'black'}} className="theme-color">Fast</span></h1>
                                    <h3>Rigorously Vetted Providers Matched to Your Needs for a Smooth Care Journey</h3>
                                    <p style={{color:'black'}}>
Welcome to Pound Pain Technology, where your health and well-being are our top priority. Whether you're recovering from a personal injury or seeking specialized medical care, our platform connects you with the best care providers in your locale. We ensure a seamless and efficient healthcare experience by rigorously vetting providers and matching them to your specific needs.
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

export default HeroOliveCustomer;


