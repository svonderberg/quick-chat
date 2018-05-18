import * as React from 'react';
import ChatWindow from './ChatWindow';
import { connect } from 'react-redux';
import { changeMessageInput } from './data';
import { ON_ADD_MESSAGE, ENTER_KEY } from './constants';
import './App.css';

const App = ({
  messages,
  messageInput,
  onMessageChange,
  onAddMessage
}: AppProps) =>
  (
    <div className="App">
      <h3>Super Simple Chat</h3>
      <ChatWindow messages={messages} />

      <input
        type="text"
        placeholder="Message"
        value={messageInput}
        onChange={e => onMessageChange(e.target.value)}
        onKeyDown={e => {
          e.stopPropagation();
          if (e.key === ENTER_KEY) { onAddMessage(messageInput); }
        }}
      />
      <button onClick={e => onAddMessage(messageInput)}>Send</button>
    </div>
  );

const mapStateToProps = (state: MessagesState) => ({ ...state });
const mapDispatchToProps = (dispatch: Function) => ({
  onMessageChange: (messageInput: string) => dispatch(changeMessageInput(messageInput)),
  onAddMessage: (messageInput: string) => dispatch({ type: ON_ADD_MESSAGE, payload: messageInput })
});

const ConnectedApp = connect(mapStateToProps, mapDispatchToProps)(App);

export default ConnectedApp;