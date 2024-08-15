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
        const mainMenuItems = [
            {
             n:'Home',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/';
             }
            },
            {
             n:'Login',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/login';
             }
            },
        ];
        const patientMenuItems = [
            {
             n:'Home',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/';
             }
            },
            {
             n:'Login',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/login';
             }
            },
        ];
        const mobileMainItems = [
            {
             n:'Home',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/view/incidentmap';
             }
            },
            {
             n:'Login',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/login';
             }
            },
        ];
        const mobileInvestorItems = [
            {
             n:'Home',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/view/incidentmap';
             }
            },
            {n:'Logout',
             a:this.logout,
             v:function(c) { return true; },
             u:'/'  
            },
        ];
        const anonymousMenuItems= [
            {
             n:'Home',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/';
             }
            },
            {
             n:'About',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/#about';
             }
            },
            {
             n:'Pricing',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/#pricing';
             }
            },
            {
             n:'Support',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/#support';
             }
            },
            {
             n:'Login',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/login';
             }
            },
        ]
        const mobileAdminItems= [
            {
             n:'Home',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app';
             }
            },
            {
             n:'Map',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/map';
             }
            },
            {
             n:'CRM',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/registrations';
             }
            },
            {
             n:'Search',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/search';
             }
            },
            {
             n:'Investors',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/investors';
             }
            },
            {n:'Logout',
             a:this.logout,
             v:function(c) { return true; },
             u:'/'  
            },
        ]
        const profileItems = [
            {n:'Leave Context',
             v:function(c) { 
                return (c.context ? true : false)
             },
             a:this.leaveContext,
             u:'/'
            },
            {n:'Logout',
             a:this.logout,
             v:function(c) { return true; },
             u:'/'  
            },
        ]
        const systemItems = [
            {
             n:'Providers',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/providers';
             }
            },
            {n:'Data Science',
             v:function(c) { 
                return (c.entitlements.includes('DataScience') ? true : false)
             },
             a:function() { 
                window.location = '/app/main/admin/datascience';
             },
             u:'/'
            },
            {
             n:'Invoices',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/invoices';
             }
            },
            {
             n:'Commissions',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/commissions';
             }
            },
            {
             n:'Coupons',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/coupons';
             }
            },
            {
             n:'Plans',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/plans';
             }
            },
            {
             n:'Online Demos',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/demos';
             }
            },
            {
             n:'Users',
             v:function(c) { 
                return true;
             },
             a:function() { 
                window.location = '/app/main/admin/users';
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
                                            <h1 style={{color:"white",fontSize:40,fontWeight:"bold"}}>
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
