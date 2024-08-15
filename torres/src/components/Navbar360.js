import React ,  { Component } from "react";
import MenuIcon from '@mui/icons-material/Menu';
import { connect } from 'react-redux';
import DropdownMenu from './DropdownMenu';
import { logoutUser } from '../actions/auth';
import { delContext } from '../actions/delContext';
import { locationUpdate } from '../actions/location';
import siteType from '../siteType';

class Navbar extends Component {

    constructor(props) { 
        super(props);
        this.state = { 
            mylocation: null,
            prevlocation: null,
            delay:60000,
            geo: false,
        } 
        this.logout = this.logout.bind(this);
        this.leaveContext = this.leaveContext.bind(this);
        this.setLocation = this.setLocation.bind(this);
        this.sendLocation = this.sendLocation.bind(this);
    } 

    componentDidMount() { 
        /* if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((position) => {
                this.setLocation(position.coords.latitude, position.coords.longitude);
            }, this.getWithoutPermission);
        } else {
            this.setState({ geo: false });
        }
        setTimeout((e) => { e.sendLocation() }, this.state.delay, this)
        */
    }
    
    doLogin() {  
        window.location = '/login';
    } 

    setLocation = (lat, lon) => {
        this.setState({ geo:true, mylocation: { lat, lon } });
    };

    getWithoutPermission = () => {
        this.setState({ geo: false });
    };

    sendLocation() { 
        setTimeout((e) => { e.sendLocation() }, this.state.delay, this)
        if (!this.state.geo) { return; } 
        if (!this.props.currentUser) { return; }
        if (this.state.prevlocation && 
            this.state.prevlocation.lat === this.state.mylocation.lat &&
            this.state.prevlocation.lon === this.state.mylocation.lon) { 
            return;
        }  
        this.state.prevlocation = this.state.mylocation;
        this.props.dispatch(locationUpdate(this.state.mylocation));
        this.setState(this.state);
    } 

    logout() { 
        this.props.dispatch(logoutUser());
    } 

    leaveContext() { 
        this.props.dispatch(delContext({},function(err,args) { 
            localStorage.removeItem("context");
            window.location.href = '/app';
        }));
    } 

    render(){
        const MenuItems360 = [
            {
             n:'Home',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/';
             }
            },
        ];
        return(
            <div style={{backgroundColor:'black'}} className="app-header header--transparent sticker" id="main-menu">
                <div className="container">
                    <div className="row align-items-center">
                        <div className="col-lg-3 col-sm-4 col-4">
                            <div className="logo">
                                <a href='/'>
                                    <div style={{position:"relative"}}>
                                        <div style={{display:"flex"}}> 
                                            <h1 style={{fontFamily:'roboto',color:"white",fontSize:window.innerWidth < 600 ? 32: 40,fontWeight:"bold"}}>
                                            360BluConsulting
                                            </h1>
                                            <img style={{alignSelf:'flex-end',marginBottom:25}} height={10} width={10} src='/green-dot.png'/>
                                        </div>
                                    </div>
                                </a>
                            </div>
                        </div>
                        {(!this.props.currentUser && siteType() === "360bluconsulting") && (
                            <>
                            <div className="col-lg-8 d-none d-lg-block">
                                <div className="mainmenu-wrapper">
                                    <nav>
                                        <ul className="main-menu">
                                            <li className="active"><a href="/">Home</a></li>
                                        </ul>
                                    </nav>
                                </div>
                            </div>
                            <div className="col-sm-8 col-8 d-block d-lg-none">
                                <div className="mobile-menu" style={{color:'white'}}>
                                    <div style={{float:"right"}}>
                                            <DropdownMenu currentUser={this.props.currentUser} 
                                                title={<MenuIcon/>} items={MenuItems360} dispatch={this.props.dispatch}/>
                                    </div>
                                </div>
                            </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser
    }
}

export default connect(mapStateToProps)(Navbar);
