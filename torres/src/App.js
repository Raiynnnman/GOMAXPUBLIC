import React from 'react';
import { connect } from 'react-redux';
import Demo from './demo/Demo';
import DemoTF from './demo/DemoTF';
import BlogGrid from './pages/BlogGrid';
import HomeOlive from './pages/HomeOlive';
import BlogDetails from './pages/BlogDetails';
import BlogTwoColumn from './pages/BlogTwoColumn';
import HomeHorizontal from './pages/HomeHorizontal';
import {Redirect, BrowserRouter, Switch, Route} from 'react-router-dom';
import Login from './pain/login/Login';
import Dashboard from './pain/dashboard/Dashboard';

const App = () => {
    return (
        <div className="App">
            <BrowserRouter basename={'/'}>
                <Switch>
                    <Route exact path='/' component={HomeHorizontal}/>
                    <Route exact path='/login' component={Login}/>
                    <Route path="/app" exact render={() => <Redirect to="/app/main"/>}/>
                    <Route path="/app/main" exact render={() => <Redirect to="/app/main/dashboard"/>}/>
                    <Route exact path='/app/main/dashboard' component={Dashboard}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/tf`} component={DemoTF}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/home-one`} component={HomeOlive}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/home-two`} component={HomeHorizontal}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/blog-grid`} component={BlogGrid}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/blog-two-column`} component={BlogTwoColumn}/>
                    <Route exact path={`${process.env.PUBLIC_URL}/blog-details`} component={BlogDetails}/>
                </Switch>
            </BrowserRouter>
        </div>
    );
}

const mapStateToProps = store => ({
  currentUser: store.auth
});

export default connect(mapStateToProps)(App);
