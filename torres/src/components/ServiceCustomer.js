import React, { Component } from "react";
import TemplateButton from '../pain/utils/TemplateButton';

class Service extends Component{
    constructor(props) { 
        super(props);
        this.state = { 
            showVideo:false
        } 
        this.showVideo = this.showVideo.bind(this);
        this.closeVideo = this.closeVideo.bind(this);
    }
    requestDemo() { 
        window.location = '/demo';
    }
    signUp() { 
        window.location = '/#pricing';
    }
    closeVideo() { 
        this.state.showVideo = false;
        this.setState(this.state);
    } 
    showVideo() { 
        this.state.showVideo = true;
        this.setState(this.state);
    } 
    render(){
        let data = [
            {
                icon: 'zmdi zmdi-settings',
                title: 'Get Started Today!',
                desc: 'Ready to Find the Best Care Providers in Your Area? Join thousands of satisfied patients who have transformed their healthcare experience with Pound Pain Technology. Sign up today and take the first step towards better health.  ',
                click:this.signUp
            },

            {
                icon: 'zmdi zmdi-favorite',
                title: 'Request a Consultation',
                desc: 'Request a personalized consultant to explore how Pound Pain Technology can help you.',
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
                        <p  style={{color:'black'}} className="desc">{val.desc}</p>
                    </div>
                </div>
            )
        });

        return (
            <div>
                {(this.state.showVideo) && (
                <>
                    <TemplateButton label='close' onClick={this.closeVideo}/>
                    <div style={{display:'flex',alignItems:'center',justifyItems:'end'}}>
                        <div style={{padding:'56.25% 0 0 0',position:'relative'}}>
                            <iframe src="https://player.vimeo.com/video/954405043?badge=0&amp;autopause=0&amp;player_id=0&amp;app_id=58479" 
                                frameborder="0" allow="autoplay; fullscreen; picture-in-picture; clipboard-write" 
                                style={{position:'absolute',top:0,left:0,width:'50%',height:'50%'}}
                                title="PoundPain_video_V1_2">
                            </iframe>
                        </div>
                    </div>
                </>
                )}
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

