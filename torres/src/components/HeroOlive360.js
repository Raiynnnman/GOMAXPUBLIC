import React, { Component } from "react";


class HeroOlive extends Component {
    render(){
        return(
            <div className={`header-area-360 ${this.props.horizontal} ${this.props.bgshape}`} id="home" >
                <div className="header-bg"/>
                <div className="container ">
                    <div className="row">
                        <div className="col-lg-6 h-100">
                            <div className="banner-text">
                                <div className="banner-table-cell">
                                    <h1 style={{color:"white"}}>360BluConsulting</h1>
                                    <h3 style={{color:"white"}}>Management consulting is a global industry focused on helping organizations operate effectively
. A management consultant, or management analyst, provides an outside perspective on problem-solving, best practices, and strategy to help companies improve their performance.></h3>
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








