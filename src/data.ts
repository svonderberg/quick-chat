import { createActions, handleActions, Action, Reducer, ReducerMap } from 'redux-actions';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { watchMessages } from './sagas';
import {
  SET_USER,
  SET_CHATROOM_ID,
  CHANGE_MESSAGE_INPUT,
  REMOTE_UPDATE_MESSAGES,
  REMOTE_UPDATE_USERS,
  ADD_MESSAGE,
  CHANGE_USERNAME
} from './constants';

export const { setChatRoomId, changeMessageInput, addMessage, changeUsername } =
  createActions<string | boolean, string>(
    {
      [SET_CHATROOM_ID]: chatRoomId => chatRoomId,
      [CHANGE_MESSAGE_INPUT]: messageInput => messageInput,
      [ADD_MESSAGE]: messageContent => messageContent,
      [CHANGE_USERNAME]: newUsername => newUsername
    }
  );

const defaultUser = { id: 0, username: 'User 1', isTyping: false };

const defaultState: ChatRoomState = {
  id: null,
  user: defaultUser,
  currentUsers: [defaultUser],
  messages: [],
  messageInput: '',
  message: null
};

const changeUsernameReducer: Reducer<ChatRoomState, string> =
  (state: ChatRoomState, { payload }: Action<string>): ChatRoomState =>
    ({ ...state, user: { ...state.user, username: payload || '' } });

const setUserReducer: Reducer<ChatRoomState, User> =
  (state: ChatRoomState, { payload }: Action<User>): ChatRoomState =>
    ({ ...state, user: payload || defaultUser });

const setChatRoomIdReducer: Reducer<ChatRoomState, string | null> =
  (state: ChatRoomState, { payload }: Action<string>): ChatRoomState =>
    ({ ...state, id: payload || null });

const changeMessageInputReducer: Reducer<ChatRoomState, string> =
  (state: ChatRoomState, { payload }: Action<string>): ChatRoomState =>
    ({ ...state, messageInput: payload || '' });

const remoteUpdateMessagesReducer: Reducer<ChatRoomState, Array<Message>> =
  (state: ChatRoomState, { payload }: Action<Array<Message>>) => ({...state, messages: payload || [] });

const remoteUpdateUsersReducer: Reducer<ChatRoomState, Array<User>> =
  (state: ChatRoomState, { payload }: Action<Array<User>>) => ({...state, currentUsers: payload || [] });

const reducers: ReducerMap<ChatRoomState, string | null | User | Array<User> | Array<Message>> = {
  [SET_USER]: setUserReducer,
  [SET_CHATROOM_ID]: setChatRoomIdReducer,
  [CHANGE_MESSAGE_INPUT]: changeMessageInputReducer,
  [REMOTE_UPDATE_MESSAGES]: remoteUpdateMessagesReducer,
  [CHANGE_USERNAME]: changeUsernameReducer,
  [REMOTE_UPDATE_USERS]: remoteUpdateUsersReducer
};

const reducer = handleActions<ChatRoomState, string>(reducers, defaultState);
const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(watchMessages);

export { store };