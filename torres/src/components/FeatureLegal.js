import React ,  { Component } from "react";
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import MonitorHeartIcon from '@mui/icons-material/MonitorHeart';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

class Feature extends Component{
    render(){
       let data = [
           
        {
            icon: <TrendingUpIcon style={{fontSize:50,height:100,color:"white"}}/>,
            title: 'Increase Your Client Base',
            desc: 'Tap into a broader network of clients actively seeking care.'
        },

        {
            icon: <MonitorHeartIcon style={{fontSize:50,height:100,color:"white"}}/>,
            title: 'Optimize Your Practice',
            desc: 'Utilize our platform’s tools to manage referrals, appointments, and client interactions effortlessly.'
        },

        {
            icon:<MonetizationOnIcon style={{fontSize:50,height:100,color:"white"}}/>,
            title: 'Maximize ROI',
            desc: 'Leverage high ROI models tailored to support and grow your practice.'
        },
        {
            icon: <CalendarMonthIcon style={{fontSize:50,height:100,color:"white"}}/>,
            title: 'Appointment Reminders',
            desc: 'Reduce no-shows and improve appointment adherence with our automated reminder system.'
        },
       ] 

       let DataList = data.map((val , i) => {
           return(
               /* Start Single Feature */
                   <div className="feature" key={i}>
                       <div style={{backgrounColor:'#fa6a0a'}} className="feature-icon">
                            <div style={{display:"flex",justifyContent:"center"}}>
                            {val.icon}
                           </div>
                       </div>
                       <div className="content">
                           <div style={{display:"flex",alignContent:'center',justifyContent:"center"}}>
                               <h4 className="title">{val.title}</h4>
                           </div>
                           <div style={{textAlign:'center',display:"flex",alignContent:'center',justifyContent:"center"}}>
                               <p className="desc" style={{color:'black'}}>{val.desc}</p>
                           </div>
                       </div>
                   </div>
               /* End Single Feature */
           )
       })

       return(
           <div className= {`feature-area feature-bg-image-legal pb--50 ${this.props.horizontalfeature}`} id="features">
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
