import React,  { Component } from "react";
import { connect } from 'react-redux';

class Pricing extends Component{
    
    selectPlan(e) { 
        window.location = '/register-provider/' + e;
    } 
    render() {
        return (
            <>
            {(this.props.landingData && this.props.landingData.data && this.props.landingData.data.pricing &&
              this.props.landingData.data.pricing.length > 0) && ( 
            <div className={`pricing-table-area pt--40 pt_sm--100 ${this.props.horizontalpricing}`} id="pricing">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title text-center mb--40">
                                <h2>PRICING <span className="theme-color">PLAN</span></h2>
                                <img className="image-1" src={require('../assets/images/app/title-icon.png')} alt="App Landing"/>
                                <img className="image-2" src={require('../assets/images/app/title-icon-2.png')} alt="App Landing"/>
                                <img className="image-3" src={require('../assets/images/app/title-icon-3.png')} alt="App Landing"/>
                                <p>Sales message here</p>
                            </div>
                        </div>
                    </div>
                    <div className="row mt--30">

                        {/* Start Single Pricing */}
                        <div className="col-lg-4 col-md-6 col-12 pricing-column mt--40">
                            <div className="single-price-package">
                                <div className="price-title">
                                    <h3>{this.props.landingData.data.pricing[0].description}</h3>
                                    <div className="price">
                                        <h4><span className="text-top">$</span><span className="text-large">
                                            {this.props.landingData.data.pricing[0].price}</span></h4>
                                        <p><span className="text-bottom">/month</span></p>
                                    </div>
                                </div>
                                <div className="price-list">
                                    <ul>
                                        {this.props.landingData.data.pricing[0].benefits.map((e) => { 
                                            return (
                                                <li>{e.description}</li>
                                            )
                                        })}
                                    </ul>
                                    <div className="price-btn">
                                        <button onClick={() => this.selectPlan(this.props.landingData.data.pricing[0].id)} 
                                            className="button" type="button">Sign up</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* End Single Pricing */}

                        {/* Start Single Pricing */}
                        <div className="col-lg-4 col-md-6 col-12 pricing-column mt--40">
                            <div className="single-price-package list-large">
                                <div className="price-title">
                                    <h3>{this.props.landingData.data.pricing[1].description}</h3>
                                    <div className="price">
                                        <h4><span className="text-top">$</span><span className="text-large">
                                            {this.props.landingData.data.pricing[1].price}</span></h4>
                                        <p><span className="text-bottom">/month</span></p>
                                    </div>
                                </div>
                                <div className="price-list">
                                    <ul>
                                        {this.props.landingData.data.pricing[1].benefits.map((e) => { 
                                            return (
                                                <li>{e.description}</li>
                                            )
                                        })}
                                    </ul>
                                    <div className="price-btn">
                                        <button onClick={() => this.selectPlan(this.props.landingData.data.pricing[1].id)} 
                                            className="button" type="button">Sign up</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* End Single Pricing */}

                        {/* Start Single Pricing */}
                        <div className="col-lg-4 col-md-6 col-12 pricing-column mt--40">
                            <div className="single-price-package">
                                <div className="price-title">
                                    <h3>{this.props.landingData.data.pricing[2].description}</h3>
                                    <div className="price">
                                        <h4><span className="text-top">$</span><span className="text-large">
                                            {this.props.landingData.data.pricing[2].price}</span></h4>
                                        <p><span className="text-bottom">/month</span></p>
                                    </div>
                                </div>
                                <div className="price-list">
                                    <ul>
                                        {this.props.landingData.data.pricing[2].benefits.map((e) => { 
                                            return (
                                                <li>{e.description}</li>
                                            )
                                        })}
                                    </ul>
                                    <div className="price-btn">
                                        <button onClick={() => this.selectPlan(this.props.landingData.data.pricing[2].id)} 
                                            className="button" type="button">Sign up</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* End Single Pricing */}
                    </div>
                </div>
            </div>
            )}
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        landingData: store.landingData
    }
}

export default connect(mapStateToProps)(Pricing);











