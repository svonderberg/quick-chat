import { createActions, handleActions, Action, Reducer, ReducerMap } from 'redux-actions';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { watchMessages } from './sagas';
import {
  SET_CHATROOM_ID,
  CHANGE_MESSAGE_INPUT,
  REMOTE_UPDATE_MESSAGES
} from './constants';

export const { setChatRoomId, changeMessageInput, addMessageAction } =
  createActions<string | boolean, string>(
    {
      [SET_CHATROOM_ID]: chatRoomId => chatRoomId,
      [CHANGE_MESSAGE_INPUT]: messageInput => messageInput,
    }
  );

const defaultState: ChatRoomState = { id: null, messages: [], messageInput: '', message: null };

const setChatRoomIdReducer: Reducer<ChatRoomState, string | null> =
  (state: ChatRoomState, { payload }: Action<string>): ChatRoomState =>
    ({ ...state, id: payload || null });

const changeMessageInputReducer: Reducer<ChatRoomState, string> =
  (state: ChatRoomState, { payload }: Action<string>): ChatRoomState =>
    ({ ...state, messageInput: payload || '' });

const remoteUpdateMessagesReducer: Reducer<ChatRoomState, Array<Message>> =
  (state: ChatRoomState, { payload }: Action<Array<Message>>) => ({...state, messages: payload || [] });

const reducers: ReducerMap<ChatRoomState, string | null | Array<Message>> = {
  [SET_CHATROOM_ID]: setChatRoomIdReducer,
  [CHANGE_MESSAGE_INPUT]: changeMessageInputReducer,
  [REMOTE_UPDATE_MESSAGES]: remoteUpdateMessagesReducer
};

const reducer = handleActions<ChatRoomState, string>(reducers, defaultState);
const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(watchMessages);

export { store };