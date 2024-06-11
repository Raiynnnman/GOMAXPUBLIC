import React ,  { Component } from "react";



class Feature extends Component{
    render(){
       let data = [
           
        {
            icon: 'zmdi zmdi-collection-text',
            title: 'Increase Your Patient Base',
            desc: 'Tap into a broader network of patients actively seeking care.'
        },

        {
            icon: 'zmdi zmdi-sun',
            title: 'Optimize Your Practice',
            desc: 'Utilize our platform’s tools to manage referrals, appointments, and patient interactions effortlessly.'
        },

        {
            icon: 'zmdi zmdi-brush',
            title: 'Maximize ROI',
            desc: 'Leverage high ROI models tailored to support and grow your practice.'
        },
        {
            icon: 'zmdi zmdi-desktop-mac',
            title: 'Automated Appointment Reminders',
            desc: 'Reduce no-shows and improve appointment adherence with our automated reminder system.'
        },
        /*{
            icon: 'zmdi zmdi-language-html5',
            title: 'Secure Patient Messaging',
            desc: 'Enhance communication between you and your patients with our secure messaging feature. Patients can easily reach out with questions or concerns, and you can provide timely responses, ensuring better patient engagement and satisfaction.'
        },
        {
            icon: 'zmdi zmdi-language-html5',
            title: 'Integrated Telehealth Services',
            desc: 'Our platform includes built-in telehealth capabilities, allowing providers to offer virtual consultations and follow-ups. This feature ensures patients can access care from the comfort of their homes, expanding the reach of your practice and enhancing patient convenience.'
        }*/
       ] 

       let DataList = data.map((val , i) => {
           return(
               /* Start Single Feature */
               <div className="feature" key={i}>
                   <div style={{backgrounColor:'#fa6a0a'}} className="feature-icon">
                       <i className={`${val.icon}`}/>
                   </div>
                   <div className="content">
                       <h4 className="title">{val.title}</h4>
                       <p className="desc" style={{color:'black'}}>{val.desc}</p>
                   </div>
               </div>
               /* End Single Feature */
           )
       })

       return(
           <div className= {`feature-area feature-bg-image pb--50 ${this.props.horizontalfeature}`} id="features">
               <div className="container">
                   <div className="row">
                       <div className="col-lg-12">
                            <div className="section-title text-center mb--40">
                                <h2>Key Benefits & <span className="theme-color">FEATURES</span></h2>
                                <img className="image-1" src={require('../assets/images/app/title-icon-3.png')} alt="App Landing"/>
                            </div>
                       </div>
                   </div>
                   <div className="row mt--30">
                       <div className="col-lg-7 offset-lg-5">
                            <div className="feature-list">
                                {DataList}
                            </div>
                       </div>
                   </div>
               </div>
           </div>
        )
    }
}

export default Feature;
