import { put, takeEvery, take, call, select, Effect } from 'redux-saga/effects';
import * as firebase from 'firebase';
import '@firebase/firestore';
import ReduxSagaFirebase from 'redux-saga-firebase';
import { Action } from 'redux-actions';
import {
  SET_CHATROOM_ID,
  ADD_MESSAGE,
  REMOTE_UPDATE_MESSAGES,
  CHANGE_MESSAGE_INPUT,
  ROOMS_COLLECTION,
  SET_USER,
  CHANGE_USERNAME,
  REMOTE_UPDATE_USERS
} from './constants';
import { getUserId, getChatRoomId } from './selectors';

const firebaseApp = firebase.initializeApp({
  apiKey: 'AIzaSyDj3_C5H-OrosfFgWakDBypMkHcaunyj1A',
  authDomain: 'super-simple-chat.firebaseapp.com',
  databaseURL: 'https://super-simple-chat.firebaseio.com',
  projectId: 'super-simple-chat',
  storageBucket: 'super-simple-chat.appspot.com',
  messagingSenderId: '928775487905'
});
const rsf = new ReduxSagaFirebase(firebaseApp, firebase.firestore());

function* getChatRoomCollectionSnapshot() {
  const chatRoomId = yield select(getChatRoomId);
  const collectionRef = firebase.firestore().collection(ROOMS_COLLECTION).where('id', '==', chatRoomId);
  const chatRoomDocSnapshot = yield call(
    rsf.firestore.getCollection,
    collectionRef
  );
  return chatRoomDocSnapshot;
}

function* getChatRoomDocSnapshot() {
  const chatRoomCollectionSnapshot = yield call(getChatRoomCollectionSnapshot);
  return chatRoomCollectionSnapshot.docs[0];
}

export function* getMessages() {
  const chatRoomId = yield select(getChatRoomId);
  const chatRoomSnapshot = yield call(getChatRoomCollectionSnapshot);

  let docRef;
  let userId = 0;
  let username = 'User 1';
  let currentUsers = [];

  // if this is a new chat room add the metadata/data structure
  if (chatRoomSnapshot.empty) {
    currentUsers = [username];
    docRef = yield call(
      rsf.firestore.addDocument,
      ROOMS_COLLECTION,
      {
        id: chatRoomId,
        users: currentUsers,
        usersTyping: [],
        messages: []
      }
    );
  } else {
    const docSnapshot = chatRoomSnapshot.docs[0];
    docRef = docSnapshot.ref;

    currentUsers = docSnapshot.get('users');
    userId = currentUsers.length;
    username = `User ${userId + 1}`;

    yield call(
      rsf.firestore.updateDocument,
      docRef,
      { users: currentUsers.concat(username) }
    );
  }

  yield put({
    type: SET_USER,
    payload: { id: userId, username }
  });

  yield call(watchMessagesAndUsers, docRef);
}

function* watchMessagesAndUsers(docRef: firebase.firestore.DocumentReference) {
  const messagesChannel = rsf.firestore.channel(docRef);

  while (true) {
    const newDocSnapshot = yield take(messagesChannel);
    const latestUsers = newDocSnapshot.get('users');
  
    yield put({
      type: REMOTE_UPDATE_MESSAGES,
      payload: newDocSnapshot.get('messages').map(
        (message: Message) =>
          ({ ...message, user: latestUsers[message.userId] })
      )
    });

    const usersTyping: Array<number> = newDocSnapshot.get('usersTyping');
    yield put({
      type: REMOTE_UPDATE_USERS,
      payload: newDocSnapshot.get('users').map(
        (username: string, idx: number) => ({ id: idx, username, isTyping: usersTyping.indexOf(idx) !== -1 })
      )
    });
  }
}

export function* addMessage({ payload }: Action<string>) {
  yield put({ type: CHANGE_MESSAGE_INPUT, payload: '' });

  const docSnapshot = yield call(getChatRoomDocSnapshot);
  const currentMessages = docSnapshot.get('messages');

  const userId = yield select(getUserId);  

  yield call(
    rsf.firestore.updateDocument,
    docSnapshot.ref,
    {
      messages: currentMessages.concat({
        userId: userId,
        content: payload,
        timestamp: new Date()
      })
    }
  );
}

export function* changeUsername({ payload }: Action<string>) {
  const docSnapshot = yield call(getChatRoomDocSnapshot);
  const currentUsers = docSnapshot.get('users');

  const userId = yield select(getUserId);  
  const updatedUsers = currentUsers.concat();
  updatedUsers[userId] = payload;

  yield call(
    rsf.firestore.updateDocument,
    docSnapshot.ref,
    { users: updatedUsers }
  );
}

function* setUserIsTyping(isTyping: boolean = true): IterableIterator<Effect | Promise<true>> {
  let docSnapshot = yield call(getChatRoomDocSnapshot);
  const currentUsersTyping: Array<number> = docSnapshot.get('usersTyping');

  const userId = yield select(getUserId);  

  let updatedUsersTyping = currentUsersTyping.concat();
  if (isTyping && currentUsersTyping.indexOf(userId) === -1) {
    updatedUsersTyping = updatedUsersTyping.concat(userId);
  } else if (!isTyping && currentUsersTyping.indexOf(userId) !== -1) {
    updatedUsersTyping.splice(updatedUsersTyping.indexOf(userId, 1));
  }

  yield call(
    rsf.firestore.updateDocument,
    docSnapshot.ref,
    { usersTyping: updatedUsersTyping }
  );
}

function* checkIsUserTyping({ payload }: Action<string>) {
  yield call(setUserIsTyping, payload !== '');
}

export function* watchMessages() {
  yield takeEvery(ADD_MESSAGE, addMessage);
  yield takeEvery(CHANGE_USERNAME, changeUsername);
  yield takeEvery(CHANGE_MESSAGE_INPUT, checkIsUserTyping);
  yield takeEvery(SET_CHATROOM_ID, getMessages);
}