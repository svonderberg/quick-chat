import * as React from 'react';
import autoscroll from 'autoscroll-react';
import MarkdownIt from 'markdown-it';
import renderHTML from 'react-render-html';

const markdownRenderer = new MarkdownIt({ linkify: true });

class ChatWindow extends React.Component<ChatWindowProps> {
    render() {
        const { currentUserId, messages, ...props } = this.props;

        return (
            // props need to be passed down via the spread operator for the autoscroll library to work correctly
            <div className="chat-window" {...props}>
                {messages.map(({ timestamp, user, userId, content }: Message, idx: number, messagesArray: Message[]) =>
                    <div
                        key={timestamp}
                        className={currentUserId === userId ? 'message-own' : 'message-other'}
                    >
                        {
                            // only show user if previous message wasn't by the same user
                            ( idx === 0 || (userId !== messagesArray[idx - 1].userId) ) &&
                            <div className="message-username">{user}</div>
                        }
                        <div className="message-content">
                            {
                                renderHTML(
                                    markdownRenderer.renderInline(content)
                                )
                            }
                        </div>
                    </div>
                )}
            </div>
        );
    }
}

export default autoscroll(ChatWindow);