import React, { Component } from "react";



class Service extends Component{
    requestDemo() { 
        window.location = '/demo';
    }
    signUp() { 
        window.location = '/register-provider';
    }
    showVideo() { 
        window.location = 'https://pain-public.s3.amazonaws.com/videos/PoundPain_video_V1_2.mp4';
    } 
    render(){
        let data = [
            {
                icon: 'zmdi zmdi-settings',
                title: 'Get Started Today!',
                desc: 'Join the network of successful care providers who have transformed their practices with Pound Pain Technology. Sign up now and see the difference.',
                click:this.signUp
            },

            {
                icon: 'zmdi zmdi-favorite',
                title: 'Request a Demo',
                desc: 'See our platform in action. Request a personalized demo to explore how Pound Pain Technology can benefit your practice.',
                click:this.requestDemo
            },

            {
                icon: 'zmdi zmdi-time',
                title: 'Watch How',
                desc: 'Curious to see how it all works? Watch our demo video to learn more about the features and benefits of our platform.',
                click:this.showVideo
            }
        ];
        let DataList = data.map((val, i) => {
            return(
                <div onClick={val.click ? val.click : null} className="col-lg-4 service-column" style={{cursor:'pointer'}} key={i}>
                    <div className="single-service text-center">
                        <div className="service-icon">
                            <i className={`${val.icon}`}></i>
                        </div>
                        <h4 className="title">{val.title}</h4>
                        <p className="desc">{val.desc}</p>
                    </div>
                </div>
            )
        });

        return (
            <div>
                {/* Start Service Area */}
                <div className={`service-area ${this.props.horizontal}`}>
                    <div className="container">
                        <div className="row">
                            {DataList}
                        </div>
                    </div>
                </div>
                {/* End Service Area */}
            </div>
        )
    }
}

export default Service;

