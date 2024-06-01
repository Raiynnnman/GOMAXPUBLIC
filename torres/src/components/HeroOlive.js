import React, { Component } from "react";


class HeroOlive extends Component {
    render(){
        return(
            <div className={`slider-area bg-color ${this.props.horizontal} ${this.props.bgshape}`} id="home"  style={{background:'#fa6a0a'}}>
                <div className="container h-100">
                    {/* <div className="row">
                        <div className="col-lg-7 h-100">
                            <div className="banner-text">
                                <div className="banner-table-cell">
                                    <h1>AWESOME <br /> <span className="theme-color">POUNDPAIN TECH</span> MOBILE APP.</h1>
                                    <p>Marketing message here</p>
                                    <div className="banner-buttons">
                                        <button type="button" className="button-default button-olive">Download</button>
                                        <a className="button-default button-white" href="/" role="button">Learn more</a>
                                    </div>
                                </div>
                            </div>

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
                                        <h4>Website</h4>
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
                        </div>
                    </div> */}
                </div>
            </div>
        )
    }
}

export default HeroOlive;








