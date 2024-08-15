import React, { Component } from "react";


class HeroOlive extends Component {
    render(){
        return(
            <div className={`header-area-360 ${this.props.horizontal} ${this.props.bgshape}`} id="home" >
                <div className="header-bg"/>
                <div className="container ">
                    <div className="row" style={{fontFamily:'roboto'}}>
                        <div className="col-lg-6 h-100">
                            <div className="banner-text" style={{fontFamily:'roboto'}}>
                                <div className="banner-table-cell" style={{fontFamily:'roboto'}}>
                                    <h1 style={{color:"white",fontFamily:'roboto'}}>360BluConsulting</h1>
                                    <h3 style={{color:"white",fontFamily:'roboto'}}>
360BluConsulting is globally focused on helping organizations operate effectively.
When it comes to achieving sustainable growth, maximizing profitability, and delivering value, no one does it quite like 360BluConsulting. We specialize in business consulting services aimed at driving measurable revenue and profit for our clients over the long term.
Our expertise lies in optimizing various aspects of commercial strategy, such as product innovation, pricing and revenue management, marketing, and sales, to ensure sustainable growth and profitability for your company.
                                    </h3>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default HeroOlive;








