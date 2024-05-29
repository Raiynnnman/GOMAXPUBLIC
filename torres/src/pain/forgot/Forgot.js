import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { sendPasswordResetEmail } from '../../actions/auth';
import { getVersion } from '../../version';
import TemplateTextField from '../utils/TemplateTextField';
import Navbar from '../../components/Navbar';
import TemplateButton from '../utils/TemplateButton';

class Forgot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            email: '',
        };

        this.changeEmail = this.changeEmail.bind(this);
        this.doSendResetEmail = this.doSendResetEmail.bind(this);
    }

    changeEmail(event) {
      this.setState({email: event.target.value});
      //validate email 
      const emailRegex = /^[A-Za-z0-9._-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
      this.state.isValid = emailRegex.test(event.target.value);
      if (this.state.isValid) {
        this.setState(prevState => ({
            ...prevState.register,
            email: event.target.value,
            errorMessage: '',
        }));
      } else {
        this.setState({ errorMessage: 'Invalid email format' });
      }
    }

    doSendResetEmail(e) {
      console.log("res",e);
      e.preventDefault();
      this.props.dispatch(sendPasswordResetEmail(this.state.email));
    }

    render() {
      return (
      <>
            <Navbar/>
            <div className="container" style={{marginTop:20}}>
                <div className="row align-items-center">
                    <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}> 
                        <TemplateTextField style={{width:400}} label='Email' helpText='Email' onChange={this.changeEmail}/>
                    </div>
                </div>
                <div style={{display:'flex',alignItems:'center',justifyContent:'center'}}> 
                    <a href="/Login">Login</a>
                    <TemplateButton style={{margin:20}} onClick={this.doSendResetEmail} label='Reset' disable={false}/>
                </div>
            </div>
      </>
      );
    }
}

function mapStateToProps(state) {
  return {
    isFetching: state.auth.isFetching,
    errorMessage: state.auth.errorMessage,
  };
}

export default withRouter(connect(mapStateToProps)(Forgot));

