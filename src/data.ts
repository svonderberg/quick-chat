import { createActions, handleActions, Action, Reducer, ReducerMap } from 'redux-actions';
import { createStore, applyMiddleware } from 'redux';
import createSagaMiddleware from 'redux-saga';
import { watchMessages } from './sagas';
import {
  CHANGE_MESSAGE_INPUT,
  REMOTE_UPDATE_MESSAGES
} from './constants';

export const { changeMessageInput, addMessageAction } =
  createActions<string | boolean, string>(
    {
      [CHANGE_MESSAGE_INPUT]: messageInput => messageInput
    }
  );

const defaultState: MessagesState = { messages: [], messageInput: '', message: null };

const changeMessageInputReducer: Reducer<MessagesState, string> =
  (state: MessagesState, { payload }: Action<string>): MessagesState =>
    ({ ...state, messageInput: payload || '' });

const remoteUpdateMessagesReducer: Reducer<MessagesState, Array<Message>> =
  (state: MessagesState, { payload }: Action<Array<Message>>) => ({...state, messages: payload || [] });

const reducers: ReducerMap<MessagesState, string> = {
  [CHANGE_MESSAGE_INPUT]: changeMessageInputReducer,
  [REMOTE_UPDATE_MESSAGES]: remoteUpdateMessagesReducer
};

const reducer = handleActions<MessagesState, string>(reducers, defaultState);
const sagaMiddleware = createSagaMiddleware();
const store = createStore(reducer, applyMiddleware(sagaMiddleware));

sagaMiddleware.run(watchMessages);

export { store };