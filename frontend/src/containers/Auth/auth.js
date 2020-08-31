import React from "react";
import axios from "axios";
import { withRouter } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";

import "./auth.css";

import makeToast from "../../components/Toaster";

class Auth extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      email: "",
      password: "",
      confirmPwd: "",
      signup: true,
    };
    this.value = "";
    this.captcha = null;
  }

  changeHandler = (value) => {
    this.value = value;
  };

  toggleForm = () => {
    this.setState((prevState) => {
      return { signup: !prevState.signup };
    });
    this.captcha.reset();
  };

  inputChangeHandler = (event) => {
    event.preventDefault();
    this.setState({ [event.target.name]: event.target.value });
  };

  submissionHandler = (event) => {
    event.preventDefault();
    this.captcha.reset();
    if (this.state.password !== this.state.confirmPwd && this.state.signup) {
      makeToast("error", "Passwords didn't match !!");
      return;
    }
    if (this.state.signup) {
      axios
        .post(
          "http://localhost:9000/auth/signup",
          JSON.stringify({
            email: this.state.email,
            password: this.state.password,
            value: this.value,
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          if (response.status !== 200 && response.status !== 201) {
            return makeToast("error", response.data.errors[0]);
          }
          this.setState({ signup: false, confirmPwd: "" });
          makeToast("success", "Sign In to continue");
        })
        .catch((err) => makeToast("error", err.response.data.errors[0]));
    } else {
      console.log(this.state.email, this.state.password);
      axios
        .post(
          "http://localhost:9000/auth/signin",
          JSON.stringify({
            email: this.state.email,
            password: this.state.password,
            value: this.value,
          }),
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        )
        .then((response) => {
          console.log(response);
          if (response.status !== 200 && response.status !== 201) {
            return makeToast("error", response.data.errors[0]);
          }
          localStorage.setItem("token", response.data.token);
          setTimeout(
            () => localStorage.removeItem("token"),
            response.data.expiresIn * 1000
          );
          this.props.history.push("/home");
        })
        .catch((err) => makeToast("error", err.response.data.errors[0]));
    }
  };

  forgotPasswordHandler = (e) => {
    e.preventDefault();
    axios
      .post(
        "http://localhost:9000/auth/preforgetpassword",
        JSON.stringify({ email: this.state.email }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response.status !== 200 && response.status !== 201) {
          return makeToast("error", response.data.errors[0]);
        }
        makeToast("success", "Forget Password mechansim initiated");
      })
      .catch((err) => makeToast("error", err.response.data.errors[0]));
  };

  render() {
    return (
      <div className="signup-form">
        <form onSubmit={(e) => e.preventDefault()}>
          <h2>{this.state.signup ? "Sign Up" : "Sign In"}</h2>
          <p>
            {this.state.signup
              ? "Please fill in this form to create an account!"
              : "Please fill in this form to Sign In !"}
          </p>
          <hr />
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon">
                <i className="fa fa-paper-plane"></i>
              </span>
              <input
                type="email"
                className="form-control"
                name="email"
                placeholder="Email Address"
                required="required"
                value={this.state.email}
                onChange={this.inputChangeHandler}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon">
                <i className="fa fa-lock"></i>
              </span>
              <input
                type="password"
                className="form-control"
                name="password"
                placeholder="Password"
                required="required"
                value={this.state.password}
                onChange={this.inputChangeHandler}
              />
            </div>
          </div>
          {this.state.signup ? (
            <div className="form-group">
              <div className="input-group">
                <span className="input-group-addon">
                  <i className="fa fa-lock"></i>
                  <i className="fa fa-check"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  name="confirmPwd"
                  placeholder="Confirm Password"
                  required="required"
                  value={this.state.confirmPwd}
                  onChange={this.inputChangeHandler}
                />
              </div>
            </div>
          ) : (
            <p
              className="Forgot"
              style={{ textAlign: "right", color: "violet", fontSize: "16px" }}
              onClick={this.forgotPasswordHandler}
            >
              Forget Password
            </p>
          )}
          <div className="form-group">
            <ReCAPTCHA
              sitekey="6LcI3MUZAAAAAN7fsZBEsOFwYp8zYhQXR2dlrHEd"
              onChange={this.changeHandler}
              ref={(el) => {
                this.captcha = el;
              }}
            />
          </div>
          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              onClick={this.submissionHandler}
            >
              {this.state.signup ? "Sign Up" : "Sign In"}
            </button>
          </div>
        </form>
        <div className="text-center">
          {this.state.signup
            ? "Already have an account? "
            : "Don't have an account "}
          <button onClick={this.toggleForm}>
            {this.state.signup ? "Singin here" : "Signup here"}
          </button>
        </div>
      </div>
    );
  }
}

export default withRouter(Auth);
