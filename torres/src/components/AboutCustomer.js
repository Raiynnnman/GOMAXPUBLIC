import React ,  { Component } from "react";

class AboutCustomer extends Component{
    render(){
        return(
            <div className={`app-about ${this.props.horizontalabout}`}  id="about">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title text-center mb--40">
                                <h2>Why <span className="theme-color">Choose</span> POUND PAIN TECHNOLOGY</h2>
                                <img className="image-1" src={require('../assets/images/app/title-icon-3.png')} alt="App Landing"/>
                            </div>
                        </div>
                    </div>
                    <div className="row align-items-center">
                        <div className="col-lg-5 offset-lg-1 mt--40">
                            <div className="about-thumbnail mr--35">
                                <img className="image-1" src={require('../assets/main_page/customer-internal.jpg')} alt="App Landing"/>
                            </div>
                        </div>
                        <div className="col-lg-6 mt--40">
                            <div className="about-content">
                                {(false) && (<h2 className="title">How <span className="theme-color"> it works:</span></h2>)}
                                <p style={{textAlign:'center',color:'black'}}>
<b>Fast and Easy Provider Matching</b>: Finding the right care provider & lawyer has never been easier. Our advanced algorithms quickly match you with local providers who specialize in your specific needs, ensuring you get the best care as soon as possible.
                                </p>
                                <p style={{textAlign:'center',color:'black'}}>
<b>Rigorously Vetted Providers</b>: Your health deserves the highest standards. That’s why we rigorously vet all our care providers to ensure they meet our stringent criteria for quality, experience, and patient satisfaction. Rest assured, you're in good hands.
                                </p>
                                <p style={{textAlign:'center',color:'black'}}>
<b>Personalized Care Journey</b>: From personal injury recovery to specialized medical treatments, Pound Pain Technology supports you throughout your care journey. Our platform adapts to your changing needs, ensuring continuous, personalized support every step of the way.
                                </p>
                                <p style={{textAlign:'center',color:'black'}}>

                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default AboutCustomer;


