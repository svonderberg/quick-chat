declare module '@firebase/app';
declare module 'redux-saga-firebase';
declare module 'react-contenteditable';
declare module 'autoscroll-react';
declare module 'human-readable-ids';

declare interface ChatRoomDispatchProps {
    onReceieveChatRoomId: Function;
    onMessageChange: Function;
    onAddMessage: Function;
}

declare interface ChatWindowProps {
    messages: Array<Message>;
}

declare interface Message {
    user: string;
    content: string;
    timestamp: number;
}

declare interface ChatRoomState {
    id: string | null;
    messages: Array<Message>;
    messageInput: string;
    message: string | null;
}