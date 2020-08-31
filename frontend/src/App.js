import React from "react";
import { withRouter, Switch, Route } from "react-router-dom";

import "./App.css";
import Auth from "./containers/Auth/auth";
import Home from "./containers/Home/Home";
import ResetPass from "./containers/ResetPass/ResetPass";
import ForgotPass from "./containers/ForgotPass/ForgotPass";

class App extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    return (
      <Switch>
        <Route path="/" exact component={Auth} />
        <Route path="/home" exact component={Home} />
        <Route path="/forgotpass/:token" component={ForgotPass} />
        <Route path="/resetpassword" exact component={ResetPass} />
      </Switch>
    );
  }
}

export default withRouter(App);
