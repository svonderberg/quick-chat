import * as React from 'react';
import { BrowserRouter as Router, Route, Redirect } from 'react-router-dom';
import { hri } from 'human-readable-ids';
import ChatRoom from './ChatRoom';
import { connect } from 'react-redux';

const App = () =>
  (
    <div className="App">
      <Router>
        <div>
          <Route
            exact={true}
            path="/quick-chat/"
            render={() => (
              <Redirect to={'/quick-chat/' + hri.random()} />
            )}
          />
          <Route path="/quick-chat/:chatRoomId" component={ChatRoom} />
        </div>
      </Router>
    </div>
  );

const mapDispatchToProps = (dispatch: Function) => ({
});

const ConnectedApp = connect(null, mapDispatchToProps)(App);

export default ConnectedApp;