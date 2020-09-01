import React from "react";
import axios from "axios";
import { withRouter } from "react-router-dom";

import "./ForgotPass.css";

//For Error Handling
import makeToast from "../../components/Toaster";

class ForgotPass extends React.Component {
  state = {
    password: "",
    cnfpassword: "",
  };
  email = "";
  inputChangeHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  submitHandler = (e) => {
    e.preventDefault();
    if (this.state.password !== this.state.cnfpassword) {
      return makeToast("error", "Passwords didn't match");
    }
    axios
      .post(
        "http://localhost:9000/auth/forgotpassword",
        JSON.stringify({ password: this.state.password }),
        {
          headers: {
            email: this.email,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response.status !== 200 && response.status !== 201) {
          makeToast("error", response.data.error.errors[0]);
        }
        makeToast("sucess", "Password changed Succesfully");
        this.props.history.replace("/");
      })
      .catch((err) => makeToast("error", err.response.data.errors[0]));
  };
  componentDidMount() {
    //VALIDATING TOKEN
    const token = this.props.match.params.token;
    console.log(token);
    axios
      .post(
        `http://localhost:9000/auth/validateforgetToken`,
        JSON.stringify({ email: "email" }),
        {
          headers: {
            token: token,
          },
        }
      )
      .then((response) => {
        if (response.status !== 200 && response.status !== 201) {
          makeToast("error", response.data.error[0]);
          return;
        }
        this.email = response.data.email;
      })
      .catch((err) => makeToast("error", err.response.data.errors[0]));
  }
  render() {
    return (
      <div className="signup-form">
        <form onSubmit={(e) => e.preventDefault()}>
          <h2>Reset Your Password</h2>
          <p>Please fill this form to reset your password</p>
          <hr />
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon">
                <i className="fa fa-paper-plane"></i>
              </span>
              <input
                type="text"
                className="form-control"
                name="password"
                placeholder="New Password"
                required="required"
                value={this.state.password}
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
                name="cnfpassword"
                placeholder="New Password"
                required="required"
                value={this.state.cnfpassword}
                onChange={this.inputChangeHandler}
              />
            </div>
          </div>
          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              onClick={this.submitHandler}
            >
              Reset Password
            </button>
          </div>
        </form>
        <div className="text-center">
          <button onClick={this.toggleForm}>{"<-- Go Back to Home"}</button>
        </div>
      </div>
    );
  }
}

export default withRouter(ForgotPass);
