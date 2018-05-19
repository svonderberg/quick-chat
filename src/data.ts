import { createActions, handleActions, Action, Reducer, ReducerMap } from 'redux-actions';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { watchMessages } from './sagas';
import {
  SET_USER_ID,
  SET_CHATROOM_ID,
  CHANGE_MESSAGE_INPUT,
  REMOTE_UPDATE_MESSAGES,
  ADD_MESSAGE
} from './constants';

export const { setChatRoomId, changeMessageInput, addMessage } =
  createActions<string | boolean, string>(
    {
      [SET_CHATROOM_ID]: chatRoomId => chatRoomId,
      [CHANGE_MESSAGE_INPUT]: messageInput => messageInput,
      [ADD_MESSAGE]: messageContent => messageContent
    }
  );

const defaultState: ChatRoomState = { userId: 0, id: null, messages: [], messageInput: '', message: null };

const setUserIdReducer: Reducer<ChatRoomState, number> =
  (state: ChatRoomState, { payload }: Action<number>): ChatRoomState =>
    ({ ...state, userId: payload });

const setChatRoomIdReducer: Reducer<ChatRoomState, string | null> =
  (state: ChatRoomState, { payload }: Action<string>): ChatRoomState =>
    ({ ...state, id: payload || null });

const changeMessageInputReducer: Reducer<ChatRoomState, string> =
  (state: ChatRoomState, { payload }: Action<string>): ChatRoomState =>
    ({ ...state, messageInput: payload || '' });

const remoteUpdateMessagesReducer: Reducer<ChatRoomState, Array<Message>> =
  (state: ChatRoomState, { payload }: Action<Array<Message>>) => ({...state, messages: payload || [] });

const reducers: ReducerMap<ChatRoomState, string | null | number | Array<Message>> = {
  [SET_USER_ID]: setUserIdReducer,
  [SET_CHATROOM_ID]: setChatRoomIdReducer,
  [CHANGE_MESSAGE_INPUT]: changeMessageInputReducer,
  [REMOTE_UPDATE_MESSAGES]: remoteUpdateMessagesReducer
};

const reducer = handleActions<ChatRoomState, string>(reducers, defaultState);
const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(watchMessages);

export { store };