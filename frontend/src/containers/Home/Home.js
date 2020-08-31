import React from "react";
import { withRouter } from "react-router-dom";
import makeToast from "../../components/Toaster";

import "./Home.css";

class Home extends React.Component {
  changePassword = (e) => {
    e.preventDefault();
    this.props.history.push("/resetpassword");
  };

  signoutHandler = (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    this.props.history.replace("/");
  };

  componentDidMount() {
    if (!localStorage.getItem("token")) {
      makeToast("warning", "Get Authorization first !");
      this.props.history.replace("/");
    }
  }

  render() {
    return (
      <div className="ButtonsParent">
        <button className="pass HomeButtons" onClick={this.changePassword}>
          CHANGE PASSWORD
        </button>
        <button className="Out HomeButtons" onClick={this.signoutHandler}>
          SIGN OUT
        </button>
      </div>
    );
  }
}

export default withRouter(Home);
