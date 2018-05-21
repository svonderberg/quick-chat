import * as React from 'react';
import autoscroll from 'autoscroll-react';
 
class ChatWindow extends React.Component<ChatWindowProps> {
    render() {
        const { currentUserId, messages, ...props } = this.props;

        return (
            <div className="chat-window" {...props}>
                {messages.map(({ timestamp, user, userId, content }: Message, idx: number, messagesArray: Message[]) =>
                    <div key={timestamp} className={currentUserId === userId ? 'message-own' : 'message-other'}>
                        {
                            // only show user if previous message wasn't by the same user
                            ( idx === 0 || (userId !== messagesArray[idx - 1].userId) ) &&
                            <div className="message-username">{user}</div>
                        }
                        <div className="message-content">{content}</div>
                    </div>
                )}
            </div>
        );
    }
}

export default autoscroll(ChatWindow);