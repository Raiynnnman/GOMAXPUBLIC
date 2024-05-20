import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route, Redirect } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { ConnectedRouter } from 'connected-react-router';
import { getHistory } from '../index';
import { AdminRoute, UserRoute, AuthRoute } from './RouteComponents';

/* eslint-disable */
import ErrorPage from '../pages/error';
/* eslint-enable */

import '../styles/theme.scss';
import LayoutComponent from '../components/Layout';
import Login from '../pain/login';
import Reset from '../pain/reset/Reset';
import Forgot from '../pain/forgot/Forgot';
import Landing from '../pain/landing/Landing';
import Search from '../pain/search/Search';
import Welcome from '../pain/welcome/Welcome';
import ThankYou from '../pain/landing/ThankYou';
import Verified from '../pain/landing/Verified';
import Register from '../pain/landing/Register';
import RegisterProvider from '../pain/landing/RegisterProvider';
import RegisterLegal from '../pain/landing/RegisterLegal';
import RegisterReferrer from '../pain/landing/RegisterReferrer';
import Accept from '../pain/referral_accept/Accept';
import Reject from '../pain/referral_accept/Reject';

const CloseButton = ({closeToast}) => <i onClick={closeToast} className="la la-close notifications-close"/>

class App extends React.PureComponent {

  componentDidMount() { 
  }
  
  render() {
    if (this.props.loadingInit) {
      return <div/>;
    }
    return (
        <div>
            <ToastContainer
                autoClose={5000}
                hideProgressBar
                closeButton={<CloseButton/>}
            />
            <ConnectedRouter history={getHistory()}>
              <HashRouter>
                  <Switch>
                    {(this.props.currentUser && this.props.currentUser.entitlements &&
                      this.props.currentUser.entitlements.includes("Provider")) && (
                      <Route path="/" exact render={() => <Redirect to="/login"/>}/>
                    )}
                    {(this.props.currentUser && this.props.currentUser.entitlements &&
                      this.props.currentUser.entitlements.includes("Customer")) && (
                      <Route path="/" exact render={() => <Redirect to="/login"/>}/>
                    )}
                    {(this.props.currentUser && this.props.currentUser.entitlements &&
                      this.props.currentUser.entitlements.includes("Admin")) && (
                      <Route path="/" exact render={() => <Redirect to="/login"/>}/>
                    )}
                      <Route path="/app" exact render={() => <Redirect to="/app/main"/>}/>
                      <UserRoute path="/app" dispatch={this.props.dispatch} component={LayoutComponent}/>
                      <Route path="/reset/:token" exact component={Reset}/>
                      <Route path="/verify/:token" exact component={Verified}/> 
                      <Route path="/accept/:token" exact component={Accept}/> 
                      <Route path="/reject/:token" exact component={Reject}/> 
                      <Route path="/register" exact component={Register}/>}
                      <Route path="/landing" exact component={Landing}/>
                      <Route path="/register-provider" exact component={RegisterProvider}/>
                      <Route path="/register-provider/short" exact component={RegisterProvider}/>
                      <Route path="/register-provider/:id" exact component={RegisterProvider}/>
                      <Route path="/register-provider/o/:pq_id" exact component={RegisterProvider}/>
                      <Route path="/register-legal" exact component={RegisterLegal}/>
                      <Route path="/register-legal/:id" exact component={RegisterLegal}/>
                      <Route path="/register-legal/o/:pq_id" exact component={RegisterLegal}/>
                      <Route path="/register-referrer" exact component={RegisterReferrer}/>
                      <AuthRoute path="/login" exact component={Login}/>
                      <AuthRoute path="/welcome" exact component={Welcome}/>
                      <AuthRoute path="/search" exact component={Search}/>
                      <AuthRoute path="/thankyou" exact component={ThankYou}/>
                      <AuthRoute path="/forgot" exact component={Forgot}/>
                      <Route path="/error" exact component={ErrorPage}/>
                    {window.location.href.includes("search.") && (
                      <Redirect from="*" to="/search"/>
                    )}
                    {!window.location.href.includes("search.") && (
                      <Redirect from="*" to="/register-provider"/>
                    )}
                  </Switch>
              </HashRouter>
            </ConnectedRouter>
        </div>

    );
  }
}

const mapStateToProps = store => ({
  currentUser: store.auth.currentUser,
  loadingInit: store.auth.loadingInit,
});

export default connect(mapStateToProps)(App);
