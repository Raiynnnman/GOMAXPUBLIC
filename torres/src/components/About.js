import React ,  { Component } from "react";

class About extends Component{
    render(){
        return(
            <div className={`app-about ${this.props.horizontalabout}`}  id="about">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title text-center mb--40">
                                <h2>How it <span className="theme-color">WORKS</span></h2>
                                <img className="image-1" src={require('../assets/images/app/title-icon-3.png')} alt="App Landing"/>
                                <p>Our innovative platform is designed to bridge the gap between patients in need and care providers across a wide range of specialties. From personal injury cases to comprehensive medical care, we ensure that patients receive the support they need, while care providers can focus on what they do best – delivering exceptional care.</p>
                            </div>
                        </div>
                    </div>
                    <div className="row align-items-center">
                        <div className="col-lg-5 offset-lg-1 mt--40">
                            <div className="about-thumbnail mr--35">
                                <img className="image-1" src={require('../assets/main_page/mobile-home-second-image.png')} alt="App Landing"/>
                            </div>
                        </div>
                        <div className="col-lg-6 mt--40">
                            <div className="about-content">
                                {(false) && (<h2 className="title">How <span className="theme-color"> it works:</span></h2>)}
                                <p style={{textAlign:'center'}}>1. Easy Registration: Care providers can quickly sign up and create a profile, showcasing their specialties and availability.</p>
                                <p style={{textAlign:'center'}}>2. Patient Matching: Our advanced algorithms match patients with the best-suited care providers based on their unique needs and preferences.</p>
                                <p style={{textAlign:'center'}}>3. Seamless Referrals: We connect with patients and can easily book appointments through the app, ensuring timely and efficient care delivery.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default About;











