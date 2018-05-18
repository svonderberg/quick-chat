import { put, takeEvery, take, call, select } from 'redux-saga/effects';
import * as firebase from 'firebase';
import '@firebase/firestore';
import ReduxSagaFirebase from 'redux-saga-firebase';
import { Action } from 'redux-actions';
import {
  SET_CHATROOM_ID,
  ON_ADD_MESSAGE,
  REMOTE_UPDATE_MESSAGES,
  CHANGE_MESSAGE_INPUT,
  MESSAGES_PATH
} from './constants';
import { getChatRoomId } from './selectors';

const firebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyDj3_C5H-OrosfFgWakDBypMkHcaunyj1A',
  authDomain: 'super-simple-chat.firebaseapp.com',
  databaseURL: 'https://super-simple-chat.firebaseio.com',
  projectId: 'super-simple-chat',
  storageBucket: 'super-simple-chat.appspot.com',
  messagingSenderId: '928775487905'
});
const rsf = new ReduxSagaFirebase(firebaseApp, firebase.firestore());

export function* getMessages() {
  const chatRoomId = yield select(getChatRoomId);
  const fieldPath = `${chatRoomId}/${MESSAGES_PATH}`;

  const query = firebase.firestore().collection(fieldPath).orderBy('timestamp', 'asc');
  const messagesChannel = rsf.firestore.channel(query);
  
  while (true) {
    const { docs } = yield take(messagesChannel);

    yield put({
      type: REMOTE_UPDATE_MESSAGES,
      payload: docs.map(
        (doc: firebase.firestore.DocumentData) => {
          return { ...doc.data(), id: doc.id };
        }
      )
    });
  }
}

export function* addMessage({ payload }: Action<string>) {
  yield put({ type: CHANGE_MESSAGE_INPUT, payload: '' });

  const chatRoomId = yield select(getChatRoomId);
  const fieldPath = `${chatRoomId}/${MESSAGES_PATH}`;

  yield call(
    rsf.firestore.addDocument,
    firebase.firestore().collection(fieldPath),
    { content: payload, timestamp: new Date() }
  );
}

export function* watchMessages() {
  yield takeEvery(SET_CHATROOM_ID, getMessages);
  yield takeEvery(ON_ADD_MESSAGE, addMessage);
}