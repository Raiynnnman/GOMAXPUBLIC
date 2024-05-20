import React from 'react';
import PropTypes from 'prop-types';
import { Link, withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { Alert, Button, Container } from 'reactstrap';
import Widget from '../../components/Widget';
import { authError, resetPassword } from '../../actions/auth';
import { getVersion } from '../../version';
import translate from '../utils/translate';
import { push } from 'connected-react-router';

class Reset extends React.Component {
    static propTypes = {
        dispatch: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

      this.state = {
        password: '',
        disabled: false,
        confirmPassword: ''
      };

        this.doLogin = this.doLogin.bind(this);
        this.changePassword = this.changePassword.bind(this);
        this.changeConfirmPassword = this.changeConfirmPassword.bind(this);
        this.checkPassword = this.checkPassword.bind(this);
        this.isPasswordValid = this.isPasswordValid.bind(this);
        this.doReset = this.doReset.bind(this);
    }

  changePassword(event) {
    this.state.disabled = false;
    this.state.password = event.target.value;
    this.setState(this.state);
  }

  changeConfirmPassword(event) {
    this.state.disabled = false;
    this.state.confirmPassword = event.target.value;
    this.setState(this.state);
  }

  checkPassword() {
    if (!this.isPasswordValid()) {
      if (!this.state.password) {
        this.props.dispatch(authError("Password field is empty"));
      } else {
        this.props.dispatch(authError("Passwords are not equal"));
      }
      setTimeout(() => {
        this.props.dispatch(authError());
      }, 3 * 1000)
    }
  }

  isPasswordValid() {
    return this.state.password && this.state.password === this.state.confirmPassword;
  }

  doReset(e) {
    e.preventDefault();

    const params = new URLSearchParams(this.props.location.search);
    const token = this.props.match.params.token;
    
    if (!token) {
      authError("Token Required")
    }

    if (!this.isPasswordValid()) {
      this.checkPassword();
    } else {
      this.state.disabled = true;
      this.props.dispatch(resetPassword(token, this.state.password));
      this.setState(this.state);
    }
  }

  doLogin() { 
      window.location.href = "/#/login"
  }

    render() {
      return (
        <div className="auth-page">
          <Container>
            <h5 className="auth-logo">
              <i className="la la-circle text-gray"/>
              #PAIN
              <i className="la la-circle text-warning"/>
            </h5>
            <Widget className="widget-auth mx-auto" title={<h3 className="mt-0">Reset password</h3>}>
              <p className="widget-auth-info">
                Please fill all fields below
              </p>
              <form className="mt" onSubmit={this.doReset}>
                {
                  this.props.errorMessage && (
                    <Alert className="alert-sm" color="danger">
                      {translate(this.props.errorMessage)}
                    </Alert>
                  )
                }
                <div className="form-group">
                  <input className="form-control no-border" value={this.state.password}
                         onChange={this.changePassword} type="password" required name="password"
                         placeholder="Password"/>
                </div>
                <div className="form-group">
                  <input className="form-control no-border" value={this.state.confirmPassword}
                         onChange={this.changeConfirmPassword} onBlur={this.checkPassword} type="password" required
                         name="confirmPassword"
                         placeholder="Confirm"/>
                </div>
                <Button type="submit" disabled={this.state.disabled} color="inverse" className="auth-btn mb-3"
                        size="sm">{this.props.isFetching ? 'Loading...' : 'Reset'}</Button>
              </form>
              <p className="widget-auth-info">
                or
              </p>
              <Link style={{color:'black'}} className="text-center" onClick={this.doLogin}>Login</Link>
            </Widget>
          </Container>
          <footer className="auth-footer">
                <small>#PAIN - {getVersion()}</small>
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

export default withRouter(connect(mapStateToProps)(Reset));

