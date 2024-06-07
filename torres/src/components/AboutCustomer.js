import React ,  { Component } from "react";

class AboutCustomer extends Component{
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
Our innovative platform is designed to bridge the gap between patients in need and care providers across a wide range of specialties. From personal injury cases to comprehensive medical care, we ensure that patients receive the support they need, while care providers can focus on what they do best – delivering exceptional care.
                                </p>
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
                                <p style={{textAlign:'center',color:'black'}}>1. Sign Up and Create Your Profile: Start by signing up and creating a profile. Provide us with your health details and preferences to help us understand your unique needs.</p>
                                <p style={{textAlign:'center',color:'black'}}>2. Get Matched with Providers: Our system quickly matches you with the best care providers in your area based on your profile. You’ll receive a list of top-rated providers ready to assist you.</p>
                                <p style={{textAlign:'center',color:'black'}}>3. Book an Appointment: Choose provider needs and book an appointment through our user-friendly platform. You can easily schedule, reschedule, or cancel appointments as needed.</p>
                                <p style={{textAlign:'center',color:'black'}}>4. Access Continuous Support: Throughout your care journey, you’ll have access to secure messaging, appointment reminders, and 24/7 support from our dedicated team.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default AboutCustomer;


