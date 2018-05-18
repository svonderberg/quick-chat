import * as React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import { hri } from 'human-readable-ids';
import ChatRoom from './ChatRoom';
import { connect } from 'react-redux';
import './App.css';

const App = () =>
  (
    <div className="App">
      <Router>
        <div>
          <Route
            exact={true}
            path="/"
            render={() => (
              <Redirect to={'/' + hri.random()} />
            )}
          />
          <Route path="/:chatRoomId" component={ChatRoom} />
        </div>
      </Router>
    </div>
  );

const mapDispatchToProps = (dispatch: Function) => ({
});

const ConnectedApp = connect(null, mapDispatchToProps)(App);

export default ConnectedApp;