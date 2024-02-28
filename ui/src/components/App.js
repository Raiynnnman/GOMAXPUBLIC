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
import Search from '../pain/search/Search';
import Welcome from '../pain/welcome/Welcome';
import ThankYou from '../pain/landing/ThankYou';
import Verified from '../pain/landing/Verified';
import Register from '../pain/landing/Register';
import RegisterProvider from '../pain/landing/RegisterProvider';

const CloseButton = ({closeToast}) => <i onClick={closeToast} className="la la-close notifications-close"/>

class App extends React.PureComponent {
  
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
                      <Route path="/" exact render={() => <Redirect to="/landing"/>}/>
                      <Route path="/app" exact render={() => <Redirect to="/app/main"/>}/>
                      <UserRoute path="/app" dispatch={this.props.dispatch} component={LayoutComponent}/>
                      <Route path="/reset/:token" exact component={Reset}/>
                      <Route path="/verify/:token" exact component={Verified}/> 
                      <Route path="/register" exact component={Register}/> */}
                      <Route path="/register-provider/:id" exact component={RegisterProvider}/>
                      <AuthRoute path="/login" exact component={Login}/>
                      <AuthRoute path="/welcome" exact component={Welcome}/>
                      <AuthRoute path="/search" exact component={Search}/>
                      <AuthRoute path="/thankyou" exact component={ThankYou}/>
                      <AuthRoute path="/forgot" exact component={Forgot}/>
                      <Route path="/error" exact component={ErrorPage}/>
                      <Redirect from="*" to="/search"/>
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
