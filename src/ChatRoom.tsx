import * as React from 'react';
import { connect } from 'react-redux';
import { match } from 'react-router';
import ChatWindow from './ChatWindow';
import { setChatRoomId, changeMessageInput, addMessage, changeUsername } from './data';
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
          user,
          currentUsers,
          messages,
          messageInput,
          onMessageChange,
          onAddMessage,
          onChangeUsername
      } = this.props;

      const usernamesTyping =
        currentUsers
          .filter((currentUser: User) => currentUser.isTyping && (currentUser.id !== user.id))
          .map(({ username }: User) => username);

      let usersTypingMessage = '';
      if (usernamesTyping.length > 0) {
        switch (usernamesTyping.length) {
          case 1 :
            usersTypingMessage = `${usernamesTyping[0]} is`;
            break;

          case 2 :
            usersTypingMessage = `${usernamesTyping[0]} and ${usernamesTyping[1]} are`;
            break;

          default :
            usersTypingMessage = `Many people are`;
            break;
        }
        usersTypingMessage = `${usersTypingMessage} typing...`;
      }

      return (
        <div className="App">
          <h3>Super Simple Chat</h3>
          <p>Username:
            <input
              type="text"
              onChange={e => onChangeUsername(e.target.value)}
              onFocus={e => (e.target as HTMLInputElement).select()}
              value={user.username}
            />
          </p>
          {
            currentUsers.length - 1 === 0 ?
              <p>No one else is here, invite them by sending them the URL.</p> :
              <p>
                {currentUsers.length} people chatting:&nbsp;
                {currentUsers.map(({ username }: User) => username).join(', ')}
              </p>
          }
          <p>{usersTypingMessage}</p>
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
  onAddMessage: (messageInput: string) => dispatch(addMessage(messageInput)),
  onChangeUsername: (usernameInput: string) => dispatch(changeUsername(usernameInput))
});

const ConnectedChatRoomFunc = connect<ChatRoomState, ChatRoomDispatchProps>(mapStateToProps, mapDispatchToProps);
export default ConnectedChatRoomFunc(ChatRoom);