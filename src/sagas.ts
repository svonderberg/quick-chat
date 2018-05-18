import { put, takeEvery, take, call, select } from 'redux-saga/effects';
import * as firebase from 'firebase';
import '@firebase/firestore';
import ReduxSagaFirebase from 'redux-saga-firebase';
import { Action } from 'redux-actions';
import {
  SET_CHATROOM_ID,
  ADD_MESSAGE,
  REMOTE_UPDATE_MESSAGES,
  CHANGE_MESSAGE_INPUT,
  ROOMS_COLLECTION
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
  const collectionRef = firebase.firestore().collection(ROOMS_COLLECTION).where('id', '==', chatRoomId);
  const chatRoomSnapshot = yield call(
    rsf.firestore.getCollection,
    collectionRef
  );

  let docRef;

  // if this is a new chat room add the metadata/data structure
  if (chatRoomSnapshot.empty) {
    docRef = yield call(
      rsf.firestore.addDocument,
      ROOMS_COLLECTION,
      {
        id: chatRoomId,
        users: [
          {
            id: 0,
            username: 'User 1'
          }
        ],
        messages: []
      }
    );
  } else {
    const docSnapshot = chatRoomSnapshot.docs[0];
    docRef = docSnapshot.ref;

    const currentUsers = docSnapshot.get('users');
    const newUserNum = currentUsers.length + 1;
  
    // yield put({
    //   type: SET_USER_ID,
    //   payload: newUserNum
    // });

    yield call(
      rsf.firestore.updateDocument,
      docRef,
      {
        users: currentUsers.concat({
          id: newUserNum,
          username: `User ${newUserNum}`
        })
      }
    );
  }

  const messagesChannel = rsf.firestore.channel(docRef);

  while (true) {
    const newDocSnapshot = yield take(messagesChannel);

    yield put({
      type: REMOTE_UPDATE_MESSAGES,
      payload: newDocSnapshot.get('messages').map(
        (message: Message) => {
          return { ...message };
        }
      )
    });
  }
}

export function* addMessage({ payload }: Action<string>) {
  yield put({ type: CHANGE_MESSAGE_INPUT, payload: '' });

  const chatRoomId = yield select(getChatRoomId);
  const chatRoomSnapshot = yield call(
    rsf.firestore.getCollection,
    firebase.firestore().collection(ROOMS_COLLECTION).where('id', '==', chatRoomId)
  );
  const docSnapshot = chatRoomSnapshot.docs[0];
  const currentMessages = docSnapshot.get('messages');

  yield call(
    rsf.firestore.updateDocument,
    docSnapshot.ref,
    {
      messages: currentMessages.concat({
        user: 0,
        content: payload,
        timestamp: new Date()
      })
    }
  );
}

export function* watchMessages() {
  yield takeEvery(ADD_MESSAGE, addMessage);
  yield takeEvery(SET_CHATROOM_ID, getMessages);
}