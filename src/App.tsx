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
          {/* Loading root path means no chat room ID has been
              specified so create a new one by redirecting to a random ID.  */}
          <Route
            exact={true}
            path="/"
            render={() => (
              <Redirect to={'/' + hri.random()} />
            )}
          />
          {/* Pull the specified chat room ID from the requested URL. */}
          <Route path="/:chatRoomId" component={ChatRoom} />
        </div>
      </Router>
    </div>
  );

const ConnectedApp = connect()(App);

export default ConnectedApp;