import React ,  { Component } from "react";

class About extends Component{
    render(){
        return(
            <div className={`app-about ${this.props.horizontalabout}`}  id="about">
                <div className="container">
                    <div className="row">
                        <div className="col-lg-12">
                            <div className="section-title text-center mb--40">
                                <h2>ABOUT <span style={{color:'#fa6a0a'}}>POUNDPAIN TECH</span></h2>
                                <p>Marketing message here</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}

export default About;











