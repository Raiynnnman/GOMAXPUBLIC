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
                                                <img src={require('../assets/main_page/headshots/testimonial1.png')} alt="testimonial 1" />
                                            </div>
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/main_page/headshots/headshot-5.png')} alt="testimonial 1" />
                                            </div>
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
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/main_page/headshots/headshot-4.jpeg')} alt="testimonial 2" />
                                            </div>
                                        </Slider>

                                    </div>
                                </div>

                                <Slider {...testimonial2} style={{color:'black'}} asNavFor={this.state.nav1} 
                                    ref={slider => (this.testimonial2 = slider)} className="testimonial-text-slider text-center">
                                    <div className="sin-testiText">
                                        <h2>Dr. Ali Mullanack, Chiropractor</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>
Pound Pain is an innovative movement in PI.  Since our 3 locations became part of the network in December we have seen a 20x ROI.  Great combination of technology and human touch.
                                        </p>
                                    </div>
                                    <div className="sin-testiText">
                                        <h2>Dr. Curtis Phillips, Psychiatrist</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>
As a psychiatrist with over two decades of experience, I have had the opportunity to explore various platforms and technologies aimed at improving patient care and streamlining practice operations. I can confidently say that Pound Pain Technology has been a game-changer for my practice, transforming the way I connect with and treat my patients.
                                        </p>
                                    </div>
                                    <div className="sin-testiText">
                                        <h2>Lindsey Walker, Patient</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>
I am writing to express my gratitude from my family for the care given to my mother. There was care, compassion, and respect. A special thank you to your staff as well; they provided professional guidance, comfort, and strength to make our own decisions. Finally, I cannot praise the #Pain and team enough. They were patient and helpful. All our hope that you continue along this path.
                                        </p>
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
                                        <h2>Laura Hernandez, Patient</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>
Their professionalism and trustworthiness were evident from the start. After my accident, they went above and beyond to help me find the best care provider. Their dedication and support made a challenging time much easier. I highly recommend their services to anyone in need.
                                        </p>
                                    </div>
                                    <div className="sin-testiText">
                                        <h2>Robert Thompson, Patient</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>
I had an excellent experience with this company. They proved to be highly trustworthy and reliable. Following my accident, they went above and beyond to help me find the best chiropractor. Their commitment to customer satisfaction and their efficient service made a significant difference in my recovery process. I highly recommend their services to anyone in need of professional and dependable assistance.
                                        </p>
                                    </div>
                                    <div className="sin-testiText">
                                        <h2>Maria Smith, Patient</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>
I humbly submit my sincere gratitude to the management and staff of #Pain. They have been outstandingly helpful and provided a high quality of service, care and comfort to our lives. Thank you.
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







