import React ,  { Component } from "react";

class AboutLegal extends Component{
    render(){
        return(
            <div className={`app-about ${this.props.horizontalabout}`}  id="about">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title text-center mb--40">
                                <h2><span className="theme-color">Seamless</span> Client Referral System</h2>
                                <img className="image-1" src={require('../assets/images/app/title-icon-3.png')} alt="App Landing"/>
                                <p style={{color:'black'}}>
Our platform leverages cutting-edge technology to match lawyers with clients who need legal assistance. By collaborating with a network of care providers, we ensure that you receive referrals from clients who are seeking legal representation for their personal injury cases. This targeted approach saves you time and resources, allowing you to focus on providing the best legal services.
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="row align-items-center">
                        <div className="col-lg-5 offset-lg-1 mt--40">
                            <div className="about-thumbnail mr--35">
                                <img className="image-1" src={require('../assets/main_page/legal-mobile.png')} alt="App Landing"/>
                            </div>
                        </div>
                        <div className="col-lg-6 mt--40">
                            <div className="about-content">
                                {(false) && (<h2 className="title">How <span className="theme-color"> it works:</span></h2>)}
                                <p style={{textAlign:'center',color:'black'}}>
<b>Advanced Matching Algorithms</b>: Our platform uses sophisticated algorithms to match clients with lawyers based on specific case details and requirements, ensuring that you receive relevant and high-quality referrals.
                                </p>
                                <p style={{textAlign:'center',color:'black'}}>
<b>Comprehensive Client Profiles</b>: Gain access to detailed client profiles that include medical records, injury reports, and other relevant information, enabling you to assess cases quickly and accurately.
                                </p>
                                <p style={{textAlign:'center',color:'black'}}>
<b>Real-Time Notifications</b>: Stay updated with instant notifications whenever a new referral is available, allowing you to act swiftly and secure clients before your competitors.
                                </p>
                                <p style={{textAlign:'center',color:'black'}}>
<b>ncreased Client Acquisition</b>: Our referral system helps you connect with a steady stream of potential clients, boosting your firm's case volume and revenue.
                                </p>
                                <p style={{textAlign:'center',color:'black'}}>
<b>Enhanced Efficiency</b>: By automating the referral process, we reduce the administrative burden on your team, allowing them to focus on case preparation and client advocacy.
                                </p>
                                <p style={{textAlign:'center',color:'black'}}>
<b>Better Case Outcomes</b>: With access to comprehensive client information, you can build stronger cases and achieve better outcomes for your clients, enhancing your firm's reputation and client satisfaction.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default AboutLegal;


