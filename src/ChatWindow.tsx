import * as React from 'react';
import autoscroll from 'autoscroll-react';
 
class ChatWindow extends React.Component<ChatWindowProps> {
    render() {
        const { messages, ...props } = this.props;

        return (
            <ul {...props}>
                {messages.map(({ timestamp, content }) =>
                    <li key={timestamp}>{content}</li>
                )}
            </ul>
        );
    }
}

export default autoscroll(ChatWindow);