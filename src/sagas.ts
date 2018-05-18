import { put, takeEvery, take, call } from 'redux-saga/effects';
import * as firebase from 'firebase';
import '@firebase/firestore';
import ReduxSagaFirebase from 'redux-saga-firebase';
import {
  ON_ADD_MESSAGE,
  REMOTE_UPDATE_MESSAGES,
  MESSAGES_COLLECTION,
  CHANGE_MESSAGE_INPUT
} from './constants';
import { Action } from 'redux-actions';

interface OnAddMessageAction extends Action<string> {
  payload: string;
}

const firebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyDj3_C5H-OrosfFgWakDBypMkHcaunyj1A',
  authDomain: 'super-simple-chat.firebaseapp.com',
  databaseURL: 'https://super-simple-chat.firebaseio.com',
  projectId: 'super-simple-chat',
  storageBucket: 'super-simple-chat.appspot.com',
  messagingSenderId: '928775487905'
});
const rsf = new ReduxSagaFirebase(firebaseApp, firebase.firestore());

export function* addMessage({ payload }: OnAddMessageAction) {
  yield put({ type: CHANGE_MESSAGE_INPUT, payload: '' });

  yield call(
    rsf.firestore.addDocument, MESSAGES_COLLECTION,
    { content: payload, timestamp: new Date() }
  );
}

export function* watchMessages() {
  yield takeEvery(ON_ADD_MESSAGE, addMessage);
  yield getMessages();
}

export function* getMessages() {
  const query = firebase.firestore().collection(MESSAGES_COLLECTION).orderBy('timestamp', 'asc');
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