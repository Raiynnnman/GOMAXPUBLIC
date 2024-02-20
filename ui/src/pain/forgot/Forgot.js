import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Alert, Button, Container } from 'reactstrap';
import Widget from '../../components/Widget';
import { sendPasswordResetEmail } from '../../actions/auth';
import { getVersion } from '../../version';

class Forgot extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
    };

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
      e.preventDefault();
      this.props.dispatch(sendPasswordResetEmail(this.state.email));
    }

    render() {
      return (
        <div className="auth-page">
          <Container>
            <h5 className="auth-logo">
              <i className="la la-circle text-gray"/>
              Direct Health Delivery
              <i className="la la-circle text-warning"/>
            </h5>
            <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Forgot password?</h3>}>
              <p className="widget-auth-info">
                Please fill your email below
              </p>
              <form className="mt" onSubmit={this.doSendResetEmail}>
                {
                  this.props.errorMessage && (
                    <Alert className="alert-sm" color="danger">
                      {this.props.errorMessage}
                    </Alert>
                  )
                }
                <div className="form-group">
                  <input className="form-control no-border" value={this.state.email}
                         onChange={this.changeEmail} type="email" required name="email"
                         placeholder="Email"/>
                </div>
                <p for="normal-field" md={12} className="text-md-right">
                  <font style={{color:"red"}}>
                      {this.state.errorMessage}
                  </font>
                </p>
                <Button type="submit" color="inverse" className="auth-btn mb-3" disabled={!this.state.isValid}
                        size="sm">{this.props.isFetching ? 'Loading...' : 'Send'}</Button>
              </form>
              <p className="widget-auth-info">
                Need to Login?
              </p>
              <Link className="d-block text-center" to="login">Enter the account</Link>
            </Widget>
          </Container>
          <footer className="auth-footer">
                <small>DirectHealthDelivery - {getVersion()}</small>
          </footer>
        </div>
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

