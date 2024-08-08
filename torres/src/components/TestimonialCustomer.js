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
                                    <h2>What our patients are <span style={{color:'#fa6a0a'}}>Saying</span></h2>
                                    <p style={{color:'black'}}>Real Stories from Patients Who Have Transformed Their Healthcare Experience with PoundPain Technology</p>
                                </div>
                                <div className="row">
                                    <div className="col-lg-8 offset-lg-2 col-xl-6 offset-xl-3">

                                        <Slider {...testimonial} asNavFor={this.state.nav2} ref={slider => (this.testimonial = slider)} className="testimonial-image-slider text-center">
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/main_page/headshots/a_black_man_headshot.jpeg')} alt="testimonial 2" />
                                            </div>
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/main_page/headshots/a_spanish_woman_headshot.jpeg')} alt="testimonial 3" />
                                            </div>
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/main_page/headshots/headshot(2).jpeg')} alt="testimonial 2" />
                                            </div>
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/main_page/headshots/a_beautiful_woman_headshot_for_a_website.jpeg')} alt="testimonial 1" />
                                            </div>
                                        </Slider>

                                    </div>
                                </div>

                                <Slider {...testimonial2} style={{color:'black'}} asNavFor={this.state.nav1} 
                                    ref={slider => (this.testimonial2 = slider)} className="testimonial-text-slider text-center">
                                    <div className="sin-testiText">
                                        <h2>Mark T., Personal Injury Patient</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>
Pound Pain Technology made it so easy to find a great chiropractor after my accident. The entire process was quick and hassle-free, and I’m now on the road to recovery.
                                        </p>
                                    </div>
                                    <div className="sin-testiText">
                                        <h2>Sarah J., Telemedicine Patient</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>
I love the convenience of telemedicine through Pound Pain. I was matched with a fantastic specialist who understood my needs perfectly. Highly recommend!”
                                        </p>
                                    </div>
                                    <div className="sin-testiText">
                                        <h2>James W., Physical Therapy Patient</h2>
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
                                        <h2>Emily D., Telemedicine Patient</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                        </div>
                                        <p>
Finding a telemedicine specialist was so easy with Pound Pain Technology. The process was straightforward, and the provider I was matched with was fantastic. I love the convenience and quality of care I received.
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







