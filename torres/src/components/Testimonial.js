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
                                    <h2>APP <span style={{color:'#fa6a0a'}}>REVIEWS</span></h2>
                                    <p>Review info here</p>
                                </div>
                                <div className="row">
                                    <div className="col-lg-8 offset-lg-2 col-xl-6 offset-xl-3">

                                        <Slider {...testimonial} asNavFor={this.state.nav2} ref={slider => (this.testimonial = slider)} className="testimonial-image-slider text-center">
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/images/client/1.png')} alt="testimonial 1" />
                                            </div>
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/images/client/1.png')} alt="testimonial 2" />
                                            </div>
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/images/client/2.png')} alt="testimonial 3" />
                                            </div>
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/images/client/3.png')} alt="testimonial 2" />
                                            </div>
                                            <div className="sin-testiImage">
                                                <img src={require('../assets/images/client/2.png')} alt="testimonial 3" />
                                            </div>
                                        </Slider>

                                    </div>
                                </div>

                                <Slider {...testimonial2} style={{color:'black'}} asNavFor={this.state.nav1} 
                                    ref={slider => (this.testimonial2 = slider)} className="testimonial-text-slider text-center">
                                    <div className="sin-testiText">
                                        <h2>S Miller</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star-half color"></i>
                                        </div>
                                        <p>I am writing to express my gratitude from my family for the care given to my mother. There was care, compassion, and respect. A special thank you to your staff as well; they provided professional guidance, comfort, and strength to make our own decisions. Finally, I cannot praise the #Pain and team enough. They were patient and helpful. All our hope that you continue along this path.</p>
                                    </div>
                                    <div className="sin-testiText">
                                        <h2>F Henderson</h2>
                                        <div className="client-rating">
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star color"></i>
                                            <i className="zmdi zmdi-star-half color"></i>
                                        </div>
                                        <p>
I humbly submit my sincere gratitude to the management and staff of #Pain. They have been outstandingly helpful and provided a high quality of service, care and comfort to our lives. Thank you.</p>
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







