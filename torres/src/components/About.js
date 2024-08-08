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
                                <p style={{color:'black'}}>
                                <div style={{color:'black'}}>
Our innovative platform is designed to bridge the gap between patients in need and care providers across a wide range of specialties. From personal injury cases to comprehensive medical care, we ensure that patients receive the support they need, while care providers can focus on what they do best – delivering exceptional care.
                                </div>
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row align-items-center">
                        <div className="col-lg-5 offset-lg-1 mt--40">
                            <div className="about-thumbnail mr--35">
                                <img className="image-1" src={require('../assets/main_page/banner-mobile-mobile-offset.png')} alt="App Landing"/>
                            </div>
                        </div>
                        <div className="col-lg-6 mt--40">
                            <div className="about-content">
                                {(false) && (<h2 className="title">How <span className="theme-color"> it works:</span></h2>)}
                                <p style={{textAlign:'center',color:'black'}}>
Discover the transformative impact of Pound Pain Technology and learn how our innovative platform can revolutionize your practice while supporting rapid patient acquisition. Our software serves as a vital bridge between patients in need of specific care and legal support, connecting them seamlessly with practitioners and care providers.
                                </p>
                                <p style={{textAlign:'center',color:'black'}}>
With easy registration, care providers can quickly sign up and create a profile, showcasing their specialties and availability. This streamlined process allows for immediate visibility within our network. Our advanced patient matching algorithms ensure that patients are paired with the best-suited care providers based on their unique needs and preferences, enhancing the likelihood of successful outcomes.
                                </p>
                                <p style={{textAlign:'center',color:'black'}}>
In addition to patient matching, our platform facilitates seamless referrals. Patients can book appointments effortlessly through our app, ensuring timely and efficient care delivery. This process not only improves patient satisfaction but also optimizes the workflow for care providers, allowing them to focus more on delivering quality care rather than administrative tasks
                                </p>
                                <p style={{textAlign:'center',color:'black'}}>
Schedule a call for a personalized consultation and discover how Pound Pain Technology can benefit your practice. See firsthand how our platform can enhance your service delivery, improve patient outcomes, and streamline your operations.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default About;











