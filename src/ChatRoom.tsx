import * as React from 'react';
import { connect } from 'react-redux';
import { match } from 'react-router';
import ChatWindow from './ChatWindow';
import { setChatRoomId, changeMessageInput, addMessage } from './data';
import { ENTER_KEY } from './constants';
import './App.css';

class ChatRoom extends React.Component<
    ChatRoomState & 
    ChatRoomDispatchProps &
    { match: match<{ chatRoomId: string }> }, {}
  > {
  componentDidMount() {
    this.props.onReceieveChatRoomId(this.props.match.params.chatRoomId);
  }

  render() {
      const {
          messages,
          messageInput,
          onMessageChange,
          onAddMessage
      } = this.props;

      return (
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
  }
}

const mapStateToProps = (state: ChatRoomState) => ({ ...state });
const mapDispatchToProps = (dispatch: Function) => ({
  onReceieveChatRoomId: (id: string) => dispatch(setChatRoomId(id)),
  onMessageChange: (messageInput: string) => dispatch(changeMessageInput(messageInput)),
  onAddMessage: (messageInput: string) => dispatch(addMessage(messageInput))
});

const ConnectedChatRoomFunc = connect<ChatRoomState, ChatRoomDispatchProps>(mapStateToProps, mapDispatchToProps);
export default ConnectedChatRoomFunc(ChatRoom);