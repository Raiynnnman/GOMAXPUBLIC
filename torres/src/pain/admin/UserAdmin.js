import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Col, Grid } from 'reactstrap';
import { Nav, NavItem, NavLink } from 'reactstrap';
import { TabContent, TabPane } from 'reactstrap';
import cx from 'classnames';
import classnames from 'classnames';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import translate from '../utils/translate';
import AppSpinner from '../utils/Spinner';
import { getUserAdmin } from '../../actions/userAdmin';
//import { consultantAdminUpdate } from '../../actions/consultantAdminUpdate';
import UserAdminList from './UserAdminList';

class UserAdmin extends Component {
    constructor(props) { 
        super(props);
        this.state = { 
        }
        this.onSave = this.onSave.bind(this);
    } 

    componentWillReceiveProps(p) { 
    }

    onSave(e) { 
        /*this.props.dispatch(consultantAdminUpdate(e)).then(() => { 
            this.props.dispatch(getUserAdmin({page:0,limit:10000})).then((e) => {
              toast.success('Successfully saved consultant.',
                {
                    position:"top-right",
                    autoClose:3000,
                    hideProgressBar:true
                }
              );
            })
        })*/
    } 

    componentDidMount() {
    }

    render() {
        return (
        <>
            {(this.props.userAdmin && this.props.userAdmin.isReceiving) && (
                <AppSpinner/>
            )}
            <Grid md="12">
                <Grid item  md="12">
                    <UserAdminList onSave={this.onSave}/> 
                </Grid>                
            </Grid>
        </>
        )
    }
}

function mapStateToProps(store) {
    return {
        currentUser: store.auth.currentUser,
        userAdmin: store.userAdmin
    }
}

export default connect(mapStateToProps)(UserAdmin);
