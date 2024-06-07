import React from "react";
import Slider from "react-slick"

import {testimonial, testimonial2} from "./script";

class Testimonial extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
          nav1: null,
          nav2: null
        };
    }

    componentDidMount() {
        this.setState({
          nav1: this.testimonial,
          nav2: this.testimonial2
        });
    }


    render(){
        return(
            <div className="testimonial-wrapper pt--120 text-center" id="reviews">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="testimonial-activation">
                                <div className="section-title text-center mb--80">
                                    <h2>What our clients are <span style={{color:'#fa6a0a'}}>Saying</span></h2>
                                    <p style={{color:'black'}}>Real Stories from Care Providers and Patients Who Have Transformed Their Healthcare Experience with Pound Pain Technology</p>
                                </div>
                                <div className="row">
                                    <div className="col-lg-8 offset-lg-2 col-xl-6 offset-xl-3">

                                        <Slider {...testimonial} asNavFor={this.state.nav2} ref={slider => (this.testimonial = slider)} className="testimonial-image-slider text-center">
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/main_page/headshots/a_beautiful_woman_headshot_for_a_website.jpeg')} alt="testimonial 1" />
                                            </div>
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/main_page/headshots/headshot(2).jpeg')} alt="testimonial 2" />
                                            </div>
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/main_page/headshots/a_spanish_woman_headshot.jpeg')} alt="testimonial 3" />
                                            </div>
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/main_page/headshots/a_black_man_headshot.jpeg')} alt="testimonial 2" />
                                            </div>
                                        </Slider>

                                    </div>
                                </div>

                                <Slider {...testimonial2} style={{color:'black'}} asNavFor={this.state.nav1} 
                                    ref={slider => (this.testimonial2 = slider)} className="testimonial-text-slider text-center">
                                    <div className="sin-testiText">
                                        <h2>Dr. Samantha Reed, Chiropractor</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>Pound Pain Technology has been a game-changer for my practice. The steady stream of patient referrals has allowed me to focus more on patient care and less on marketing. The platform is easy to use, and the support team is always available to help.</p>
                                    </div>
                                    <div className="sin-testiText">
                                        <h2>Dr. Michael Nguyen, Telemedicine Specialist</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>
The integrated telehealth services are a huge benefit for my practice. I can reach patients who otherwise wouldn’t have access to specialized care. The analytics dashboard has also provided valuable insights into my patient demographics and referral sources.
                                        </p>
                                    </div>
                                    <div className="sin-testiText">
                                        <h2>Dr. Laura Hernandez, Psychiatrist</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>
I appreciate how Pound Pain Technology has simplified the referral process. The secure messaging feature allows me to maintain clear communication with my patients, which is essential in mental health care. My patient base has grown significantly since joining the platform.
                                        </p>
                                    </div>
                                    <div className="sin-testiText">
                                        <h2>Dr. Robert Thompson, Emergency Care Physician</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>
The platform's automated appointment reminders have reduced no-shows significantly. The comprehensive analytics dashboard helps me track and optimize my practice’s performance. Pound Pain Technology is a must-have for any busy emergency care provider.”
                                        </p>
                                    </div>
                                </Slider>
                                    
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
 export default Testimonial;







