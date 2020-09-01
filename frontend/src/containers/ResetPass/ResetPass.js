import React from "react";
import axios from "axios";
import { withRouter } from "react-router-dom";

import "./ResetPass.css";

//For Error Handling
import makeToast from "../../components/Toaster";

class ResetPass extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      oldPwd: "",
      newPwd: "",
      cnfnewPwd: "",
      loader: false,
    };
  }
  componentDidMount() {
    //CHECKING AUTHORIZAION
    if (!localStorage.getItem("token")) {
      makeToast("warning", "Get Authorization first !");
      this.props.history.replace("/");
    }
  }
  inputChangeHandler = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };
  submissionHandler = (e) => {
    e.preventDefault();
    this.setState({ loader: true });
    if (this.state.newPwd !== this.state.cnfnewPwd) {
      return makeToast("error", "Passwords didn't match");
    }
    const token = localStorage.getItem("token");
    axios
      .post(
        "http://localhost:9000/auth/resetpassword",
        JSON.stringify({
          oldPwd: this.state.oldPwd,
          newPwd: this.state.newPwd,
        }),
        {
          headers: {
            token: token,
            "Content-Type": "application/json",
          },
        }
      )
      .then((response) => {
        if (response.status !== 200 && response.status !== 201) {
          return makeToast("error", response.data.error.errors[0]);
        }
        makeToast("success", "Password reset Succesfull");
        this.props.history.replace("/home");
      })
      .catch((err) => {
        makeToast("error", err.response.data.errors[0]);
        this.setState({ loader: false });
      });
  };
  render() {
    return (
      <div className="signup-form">
        <form onSubmit={(e) => e.preventDefault()}>
          <h2>Change Your Password</h2>
          <p>Please fill this form to change your password</p>
          <hr />
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon">
                <i className="fa fa-paper-plane"></i>
              </span>
              <input
                type="password"
                className="form-control"
                name="oldPwd"
                placeholder="Old Password"
                required="required"
                value={this.state.oldPwd}
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
                type="text"
                className="form-control"
                name="newPwd"
                placeholder="New Password"
                required="required"
                value={this.state.newPwd}
                onChange={this.inputChangeHandler}
              />
            </div>
          </div>
          <div className="form-group">
            <div className="input-group">
              <span className="input-group-addon">
                <i className="fa fa-lock"></i>
                <i className="fa fa-check"></i>
              </span>
              <input
                type="password"
                className="form-control"
                name="cnfnewPwd"
                placeholder="Confirm New Password"
                required="required"
                value={this.state.cnfnewPwd}
                onChange={this.inputChangeHandler}
              />
            </div>
          </div>
          <div className="form-group">
            <button
              type="submit"
              className="btn btn-primary btn-lg"
              onClick={this.submissionHandler}
            >
              {"Change Password"}
              {this.state.loader == true ? (
                <i className="fas fa-spinner fa-spin m-2"></i>
              ) : (
                ""
              )}
            </button>
          </div>
        </form>
        <div className="text-center">
          <button onClick={this.submissionHandler}>
            {"<-- Go Back to Home"}
          </button>
        </div>
      </div>
    );
  }
}

export default withRouter(ResetPass);
