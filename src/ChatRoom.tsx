import * as React from 'react';
import { connect } from 'react-redux';
import { match } from 'react-router';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import ChatWindow from './ChatWindow';
import { setChatRoomId, changeMessageInput, addMessage, changeUsername } from './data';
import { ENTER_KEY } from './constants';

class ChatRoom extends React.Component<
    ChatRoomState & 
    ChatRoomDispatchProps &
    { match: match<{ chatRoomId: string }> }, {}
  > {

  componentDidMount() {
    // trigger saga to pull current chat room data off Firebase using
    // chat room ID from URL as provided by react-router
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

      // determine usernames of those typing by mapping user IDs to usernames -
      // this could be made a selector if needed
      const usernamesTyping =
        currentUsers
          .filter((currentUser: User) => currentUser.isTyping && (currentUser.id !== user.id))
          .map(({ username }: User) => username);

      // determine correct language for 'Users typing' message depending on how many are
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
        <div className="quick-chat-app">
          <header>
            <div className="title">
              <h1>
                <span>Quick</span>
                <span>Chat</span>
              </h1>

              <CopyToClipboard text={window.location}>
                <button>Copy a link to this chat to the clipboard.</button>
              </CopyToClipboard>
            </div>
            <div className="username">
              <p>Your username<br />(click to change)</p>
              <input
                type="text"
                onChange={e => onChangeUsername(e.target.value)}
                onFocus={e => (e.target as HTMLInputElement).select()}
                onKeyDown={e => {
                  e.stopPropagation();

                  // blur on Enter key pressed to dismiss keyboard on mobile
                  if (e.key === ENTER_KEY) { (e.target as HTMLInputElement).blur(); }
                }}
                value={user.username}
              />
            </div>
          </header>

          <ChatWindow
            messages={messages}
            currentUserId={user.id}
          />

          <div className="users-info">
            <p className="users-typing">{usersTypingMessage}</p>
            {
              currentUsers.length - 1 === 0 ?
                <p className="users-list">No one else is here, invite them by sending them the link.</p> :
                <p className="users-list">
                  {currentUsers.length} people chatting:&nbsp;
                  {currentUsers.map(({ username }: User) => username).join(', ')}
                </p>
            }
          </div>

          <div className="message-input-bar">
            <input
              type="text"
              placeholder="Message"
              value={messageInput}
              onChange={e => onMessageChange(e.target.value)}
              onKeyDown={e => {
                e.stopPropagation();

                // trigger saga to add message to Firebase on Enter key down
                if (e.key === ENTER_KEY) { onAddMessage(messageInput); }
              }}
            />
            <button onClick={e => onAddMessage(messageInput)}>Send</button>
          </div>
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