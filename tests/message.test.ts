import {
  dm, message, userType, requestClear, requestAuthRegisterV3, requestChannelsCreateV3, requestMessageSenddmV2, requestDmCreateV2, requestMessageSendV2,
  requestChannelMessagesV3, requestMessageEditV2, requestaddOwner, requestMessageRemoveV2, requestChannelInviteV3, requestMessageShareV1, requestDmMessagesV2,
  requestPinV1, requestUnpinV1, requestMessageReactV1, requestMessageUnReactV1, requestChannelJoinV3, requestMessageSendlaterV1, requestMessageSendlaterdmV1
} from './testHelpers';
import { wait } from '../src/other';
describe('tests for messageSenddmV2', () => {
  let user1: userType, user2: userType, user3: userType, uIds1: number[], dm1: dm;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('1231@gmail.com', '122342432453', 'aKaifeng', 'mao');
    user2 = requestAuthRegisterV3('1232@gmail.com', '122342432453', 'bKaifeng', 'mao');
    user3 = requestAuthRegisterV3('1233@gmail.com', '122342432453', 'cKaifeng', 'mao');
    uIds1 = [user2.authUserId, user3.authUserId];
    dm1 = requestDmCreateV2(user1.token, uIds1);
  });
  test('dmId does not refer to a valid DM', () => {
    expect(requestMessageSenddmV2(user1.token, dm1.dmId + 1, 'Hi')).toStrictEqual(400);
  });
  test('length of message is less than 1 or over 1000 characters', () => {
    expect(requestMessageSenddmV2(user1.token, dm1.dmId, '')).toStrictEqual(400);
    expect(requestMessageSenddmV2(user1.token, dm1.dmId, 'a'.repeat(1001))).toStrictEqual(400);
  });
  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const user4: userType = requestAuthRegisterV3('1234@gmail.com', '122342432453', 'dKaifeng', 'mao');
    expect(requestMessageSenddmV2(user4.token, dm1.dmId, 'Hi')).toStrictEqual(403);
  });
  test('token is invalid', () => {
    expect(requestMessageSenddmV2(user1.token.concat('1'), dm1.dmId, 'Hi')).toStrictEqual(403);
  });
  test('normal situation', () => {
    const message: message = requestMessageSenddmV2(user1.token, dm1.dmId, 'Hi');
    expect(message).toStrictEqual({
      messageId: message.messageId
    });
    const dmMessage = requestDmMessagesV2(user1.token, dm1.dmId, 0);
    expect(dmMessage).toStrictEqual({
      messages: dmMessage.messages,
      start: 0,
      end: -1,
    });
  });
});

describe('test for messageSendV2', () => {
  let User1: {token: string, authUserId: number};
  let channel1 : {channelId: number};
  beforeEach(() => {
    requestClear();
    User1 = requestAuthRegisterV3('123@gmail.com', '123124113', 'A', 'a');
    channel1 = requestChannelsCreateV3(User1.token, 'channel1', true);
  });
  test('check whether mutiple message is sent to correct channel', () => {
    expect(requestMessageSendV2(User1.token, channel1.channelId, 'message1')).toStrictEqual({ messageId: expect.any(Number) });
    let channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages[0].message).toStrictEqual('message1');
    requestMessageSendV2(User1.token, channel1.channelId, 'message2');
    requestMessageSendV2(User1.token, channel1.channelId, 'message3');
    channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages[0].message).toEqual('message3');
    expect(channelMes.messages[1].message).toEqual('message2');
    expect(channelMes.messages[2].message).toEqual('message1');
  });
  test('check invalid token', () => {
    expect(requestMessageSendV2(User1.token + 'aa', channel1.channelId, 'message')).toStrictEqual(403);
    const channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages).toEqual([]);
  });
  test('less 1 or larger 1000 characters', () => {
    expect(requestMessageSendV2(User1.token, channel1.channelId, '')).toStrictEqual(400);
    expect(requestMessageSendV2(User1.token, channel1.channelId, 'a'.repeat(1005))).toStrictEqual(400);
    const channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages).toEqual([]);
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const User2 = requestAuthRegisterV3('34@gmail.com', 'qweqdadqqw', 'B', 'b');
    expect(requestMessageSendV2(User2.token, channel1.channelId, 'message1')).toStrictEqual(403);
    expect(requestMessageSendV2(User1.token, channel1.channelId + 3, 'message2'));
    const channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages).toEqual([]);
  });
});
describe('test for messageEditV2', () => {
  let User1: {token: string, authUserId: number};
  let channel1 : {channelId: number};
  beforeEach(() => {
    requestClear();
    User1 = requestAuthRegisterV3('123@gmail.com', '123124113', 'A', 'a');
    channel1 = requestChannelsCreateV3(User1.token, 'channel1', true);
  });
  test('update a meesage', () => {
    const message1 = requestMessageSendV2(User1.token, channel1.channelId, 'message1');
    expect(requestMessageEditV2(User1.token, message1.messageId, 'newmessage1')).toStrictEqual({});
    const channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages[0].message).toEqual('newmessage1');
  });
  test('less 1 or larger 1000 characters', () => {
    const message = requestMessageSendV2(User1.token, channel1.channelId, 'sad');
    expect(message).toStrictEqual({ messageId: expect.any(Number) });
    expect(requestMessageEditV2(User1.token, message.messageId, 'a'.repeat(1005))).toStrictEqual(400);
    const channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages).toEqual([{
      message: 'sad',
      messageId: expect.any(Number),
      timeSent: expect.any(Number),
      uId: expect.any(Number),
    }]);
  });
  test('the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM', () => {
    const message1 = requestMessageSendV2(User1.token, channel1.channelId, 'message1');
    const User2 = requestAuthRegisterV3('3931@gmail.com', '12321312', 'B', 'b');
    expect(message1).toStrictEqual({ messageId: expect.any(Number) });
    expect(User2).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
    expect(requestMessageEditV2(User2.token, message1.messageId, 'newmessage1')).toStrictEqual(403);
    expect(requestChannelInviteV3(User1.token, channel1.channelId, User2.authUserId)).toStrictEqual({});
    expect(requestMessageEditV2(User2.token, message1.messageId, 'newmessage1')).toStrictEqual(403);
    expect(requestaddOwner(User1.token, channel1.channelId, User2.authUserId)).toStrictEqual({});
    expect(requestMessageEditV2(User2.token, message1.messageId, 'newmessage1')).toStrictEqual({});
    const channelMes = requestChannelMessagesV3(User2.token, channel1.channelId, 0);
    expect(channelMes.messages[0].message).toEqual('newmessage1');
  });
  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const message1 = requestMessageSendV2(User1.token, channel1.channelId, 'message1');
    expect(requestMessageEditV2(User1.token, message1.messageId + 10, 'newmessage1')).toStrictEqual(400);
  });
  test('token is invalid', () => {
    const message1 = requestMessageSendV2(User1.token, channel1.channelId, 'message1');
    expect(requestMessageEditV2(User1.token + 'aaa', message1.messageId, 'newmessage1')).toStrictEqual(403);
  });
});
describe('test for messageRemoveV2', () => {
  let User1: {token: string, authUserId: number};
  let channel1 : {channelId: number};

  beforeEach(() => {
    requestClear();
    User1 = requestAuthRegisterV3('123@gmail.com', '123124113', 'A', 'a');
    channel1 = requestChannelsCreateV3(User1.token, 'channel1', true);
  });
  test('remove a message', () => {
    const message1 = requestMessageSendV2(User1.token, channel1.channelId, 'message1');
    expect(requestMessageRemoveV2(User1.token, message1.messageId)).toStrictEqual({});
  });
  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const message1 = requestMessageSendV2(User1.token, channel1.channelId, 'message1');
    expect(requestMessageRemoveV2(User1.token, message1.messageId + 10)).toStrictEqual(400);
  });
  test('token is invalid', () => {
    const message1 = requestMessageSendV2(User1.token, channel1.channelId, 'message1');
    expect(requestMessageRemoveV2(User1.token + 'aaa', message1.messageId)).toStrictEqual(403);
  });
  test('the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM', () => {
    const message1 = requestMessageSendV2(User1.token, channel1.channelId, 'message1');
    const User2 = requestAuthRegisterV3('3931@gmail.com', '12321312', 'B', 'b');
    expect(requestMessageRemoveV2(User2.token, message1.messageId)).toStrictEqual(403);
    requestChannelInviteV3(User1.token, channel1.channelId, User2.authUserId);
    requestaddOwner(User1.token, channel1.channelId, User2.authUserId);
    expect(requestMessageRemoveV2(User2.token, message1.messageId)).toStrictEqual({});
    const channelMes = requestChannelMessagesV3(User2.token, channel1.channelId, 0);
    expect(channelMes.messages).toEqual([]);
  });
});

describe('test for messageShareV1', () => {
  let User1: {token: string, authUserId: number};
  let User2: {token: string, authUserId: number};
  let channel1 : {channelId: number};
  let message1 : {messageId: number};
  let dm1 : {dmId: number};
  beforeEach(() => {
    requestClear();
    User1 = requestAuthRegisterV3('123@gmail.com', '123124113', 'A', 'a');
    User2 = requestAuthRegisterV3('1234@gmail.com', '123124113', 'B', 'b');
    channel1 = requestChannelsCreateV3(User1.token, 'channel1', true);
    message1 = requestMessageSendV2(User1.token, channel1.channelId, 'hi');
    dm1 = requestDmCreateV2(User1.token, [User2.authUserId]);
  });
  test('token is invalid', () => {
    expect(requestMessageShareV1(User1.token + 'aaa', message1.messageId, '', -1, dm1.dmId)).toStrictEqual(403);
  });
  test('both channelId and dmId are invalid', () => {
    expect(requestMessageShareV1(User1.token, message1.messageId, '', channel1.channelId + 1, dm1.dmId + 1)).toStrictEqual(400);
  });
  test('neither channelId nor dmId are -1', () => {
    expect(requestMessageShareV1(User1.token, message1.messageId, '', channel1.channelId, dm1.dmId)).toStrictEqual(400);
  });
  test('ogMessageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    expect(requestMessageShareV1(User1.token, message1.messageId + 1, '', -1, dm1.dmId)).toStrictEqual(400);
  });
  test('length of optional message is more than 1000 characters', () => {
    expect(requestMessageShareV1(User1.token, message1.messageId, 'a'.repeat(1001), -1, dm1.dmId)).toStrictEqual(400);
  });
  test('the authorised user has not joined the channel or DM they are trying to share the message to', () => {
    const dm2 : {dmId: number} = requestDmCreateV2(User2.token, []);
    expect(requestMessageShareV1(User1.token, message1.messageId, '', -1, dm2.dmId)).toStrictEqual(403);
  });
  test('normal situation', () => {
    const message2 : {sharedMessageId: number} = requestMessageShareV1(User1.token, message1.messageId, '', -1, dm1.dmId);
    expect(message2).toStrictEqual({
      sharedMessageId: message2.sharedMessageId
    });
    const dmMessage = requestDmMessagesV2(User1.token, dm1.dmId, 0);
    expect(dmMessage).toStrictEqual({
      messages: dmMessage.messages,
      start: 0,
      end: -1,
    });
  });
});

describe.skip('tests for pinV1', () => {
  let user1: userType, user2: userType;
  let channel1 : {channelId: number};
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('abcd@gmail.com', '1234cd2', 'John', 'Smith');
    user2 = requestAuthRegisterV3('validemail@gmail.com', '123abc!@#', 'John', 'Smith');
    channel1 = requestChannelsCreateV3(user1.token, 'channel1', true);
  });
  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const message1 = requestMessageSendV2(user1.token, channel1.channelId, 'message1');
    expect(requestPinV1(user1.token, message1.messageId + 10)).toStrictEqual(400);
  });

  test('the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM', () => {
    const message1 = requestMessageSendV2(user1.token, channel1.channelId, 'message1');
    expect(requestPinV1(user2.token, message1.messageId)).toStrictEqual(403);
  });

  test('success case- message pinned by owner', () => {
    const message1 = requestMessageSendV2(user1.token, channel1.channelId, 'message1');
    expect(requestPinV1(user1.token, message1.messageId)).toStrictEqual({});
  });

  test('success case- message pinned by owner 2', () => {
    const message1 = requestMessageSendV2(user1.token, channel1.channelId, 'message1');
    expect(requestPinV1(user2.token, message1.messageId)).toStrictEqual(403);
    requestChannelInviteV3(user1.token, channel1.channelId, user2.authUserId);
    requestaddOwner(user1.token, channel1.channelId, user2.authUserId);
    expect(requestPinV1(user2.token, message1.messageId)).toStrictEqual({});
  });

  test('fail case- message is already pinned', () => {
    const message1 = requestMessageSendV2(user1.token, channel1.channelId, 'message1');
    expect(requestPinV1(user1.token, message1.messageId)).toStrictEqual({});
    expect(requestPinV1(user1.token, message1.messageId)).toStrictEqual(400);
  });
});

describe.skip('tests for unpinV1', () => {
  let user1: userType, user2: userType;
  let channel1 : {channelId: number};
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('abcd@gmail.com', '1234cd2', 'John', 'Smith');
    user2 = requestAuthRegisterV3('validemail@gmail.com', '123abc!@#', 'John', 'Smith');
    channel1 = requestChannelsCreateV3(user1.token, 'channel1', true);
  });
  test('messageId does not refer to a valid message within a channel/DM that the authorised user has joined', () => {
    const message1 = requestMessageSendV2(user1.token, channel1.channelId, 'message1');
    expect(requestUnpinV1(user1.token, message1.messageId + 10)).toStrictEqual(400);
  });

  test('the message was not sent by the authorised user making this request and the user does not have owner permissions in the channel/DM', () => {
    const message1 = requestMessageSendV2(user1.token, channel1.channelId, 'message1');
    expect(requestUnpinV1(user2.token, message1.messageId)).toStrictEqual(403);
  });

  test('success case- message unpinned by owner', () => {
    const message1 = requestMessageSendV2(user1.token, channel1.channelId, 'message1');
    requestPinV1(user1.token, message1.messageId);
    expect(requestUnpinV1(user1.token, message1.messageId)).toStrictEqual({});
  });

  test('success case- message unpinned by owner 2', () => {
    const message1 = requestMessageSendV2(user1.token, channel1.channelId, 'message1');
    requestPinV1(user1.token, message1.messageId);
    expect(requestUnpinV1(user2.token, message1.messageId)).toStrictEqual(403);
    requestChannelInviteV3(user1.token, channel1.channelId, user2.authUserId);
    requestaddOwner(user1.token, channel1.channelId, user2.authUserId);
    expect(requestUnpinV1(user2.token, message1.messageId)).toStrictEqual({});
  });

  test('fail case- message is not pinned', () => {
    const message1 = requestMessageSendV2(user1.token, channel1.channelId, 'message1');
    expect(requestUnpinV1(user1.token, message1.messageId)).toStrictEqual(400);
  });
});

describe.skip('Tests for messageReact in dms', () => {
  let user1: userType, user2: userType, user3: userType, uIds1: number[], dm1: dm, message: message;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('1231@gmail.com', '122342432453', 'aKaifeng', 'mao');
    user2 = requestAuthRegisterV3('1232@gmail.com', '122342432453', 'bKaifeng', 'mao');
    user3 = requestAuthRegisterV3('1233@gmail.com', '122342432453', 'cKaifeng', 'mao');
    uIds1 = [user2.authUserId, user3.authUserId];
    dm1 = requestDmCreateV2(user1.token, uIds1);
    message = requestMessageSenddmV2(user1.token, dm1.dmId, 'Hi');
  });
  test('Passcases', () => {
    expect(requestMessageReactV1(user1.token, message.messageId, 1)).toStrictEqual({});
    expect(requestMessageReactV1(user2.token, message.messageId, 1)).toStrictEqual({});
    expect(requestMessageReactV1(user3.token, message.messageId, 1)).toStrictEqual({});
  });
  test('Failcases', () => {
    expect(requestMessageReactV1(user1.token + 3, message.messageId, 1)).toStrictEqual(403);
    expect(requestMessageReactV1(user1.token, -1, 1)).toStrictEqual(400);
    expect(requestMessageReactV1(user1.token, message.messageId, 2)).toStrictEqual(400);
    requestMessageReactV1(user1.token, message.messageId, 1);
    expect(requestMessageReactV1(user1.token, message.messageId, 1)).toStrictEqual(400);
  });
});

describe.skip('Tests for messageReact in channels', () => {
  let user1: userType, user2: userType, user3: userType, channel1: {channelId: number}, channel2: {channelId: number}, message: message;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('1231@gmail.com', '122342432453', 'aKaifeng', 'mao');
    user2 = requestAuthRegisterV3('1232@gmail.com', '122342432453', 'bKaifeng', 'mao');
    user3 = requestAuthRegisterV3('1233@gmail.com', '122342432453', 'cKaifeng', 'mao');
    channel1 = requestChannelsCreateV3(user1.token, 'uIds1', true);
    requestChannelJoinV3(user2.token, channel1.channelId);
    requestChannelJoinV3(user3.token, channel1.channelId);
    channel2 = requestChannelsCreateV3(user2.token, 'uIds2', true);
    requestChannelJoinV3(user3.token, channel2.channelId);
    message = requestMessageSendV2(user1.token, channel1.channelId, 'Hi');
  });
  test('Passcases', () => {
    expect(requestMessageReactV1(user1.token, message.messageId, 1)).toStrictEqual({});
    expect(requestMessageReactV1(user2.token, message.messageId, 1)).toStrictEqual({});
    expect(requestMessageReactV1(user3.token, message.messageId, 1)).toStrictEqual({});
  });
  test('Failcases', () => {
    expect(requestMessageReactV1(user1.token + 3, message.messageId, 1)).toStrictEqual(403);
    expect(requestMessageReactV1(user1.token, -1, 1)).toStrictEqual(400);
    expect(requestMessageReactV1(user1.token, message.messageId, 2)).toStrictEqual(400);
    requestMessageReactV1(user1.token, message.messageId, 1);
    expect(requestMessageReactV1(user1.token, message.messageId, 1)).toStrictEqual(400);
  });
});

describe.skip('Tests for messageUnReact in dms', () => {
  let user1: userType, user2: userType, user3: userType, uIds1: number[], dm1: dm, message: message;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('1231@gmail.com', '122342432453', 'aKaifeng', 'mao');
    user2 = requestAuthRegisterV3('1232@gmail.com', '122342432453', 'bKaifeng', 'mao');
    user3 = requestAuthRegisterV3('1233@gmail.com', '122342432453', 'cKaifeng', 'mao');
    uIds1 = [user2.authUserId, user3.authUserId];
    dm1 = requestDmCreateV2(user1.token, uIds1);
    message = requestMessageSenddmV2(user1.token, dm1.dmId, 'Hi');
    requestMessageReactV1(user1.token, message.messageId, 1);
    requestMessageReactV1(user2.token, message.messageId, 1);
    requestMessageReactV1(user3.token, message.messageId, 1);
  });
  test('Passcases', () => {
    expect(requestMessageUnReactV1(user3.token, message.messageId, 1)).toStrictEqual({});
    expect(requestMessageUnReactV1(user2.token, message.messageId, 1)).toStrictEqual({});
    expect(requestMessageUnReactV1(user1.token, message.messageId, 1)).toStrictEqual({});
  });
  test('Failcases', () => {
    expect(requestMessageUnReactV1(user1.token + 3, message.messageId, 1)).toStrictEqual(403);
    expect(requestMessageUnReactV1(user1.token, -1, 1)).toStrictEqual(400);
    expect(requestMessageUnReactV1(user1.token, message.messageId, 2)).toStrictEqual(400);
    requestMessageUnReactV1(user1.token, message.messageId, 1);
    expect(requestMessageUnReactV1(user1.token, message.messageId, 1)).toStrictEqual(400);
  });
});

describe.skip('Tests for messageUnReact in channels', () => {
  let user1: userType, user2: userType, user3: userType, channel1: {channelId: number}, message: message;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('1231@gmail.com', '122342432453', 'aKaifeng', 'mao');
    user2 = requestAuthRegisterV3('1232@gmail.com', '122342432453', 'bKaifeng', 'mao');
    user3 = requestAuthRegisterV3('1233@gmail.com', '122342432453', 'cKaifeng', 'mao');
    channel1 = requestChannelsCreateV3(user1.token, 'uIds1', true);
    requestChannelJoinV3(user2.token, channel1.channelId);
    requestChannelJoinV3(user3.token, channel1.channelId);
    message = requestMessageSendV2(user1.token, channel1.channelId, 'Hi');
    requestMessageReactV1(user1.token, message.messageId, 1);
    requestMessageReactV1(user2.token, message.messageId, 1);
    requestMessageReactV1(user3.token, message.messageId, 1);
  });
  test('Passcases', () => {
    expect(requestMessageUnReactV1(user3.token, message.messageId, 1)).toStrictEqual({});
    expect(requestMessageUnReactV1(user2.token, message.messageId, 1)).toStrictEqual({});
    expect(requestMessageUnReactV1(user1.token, message.messageId, 1)).toStrictEqual({});
  });
  test('Failcases', () => {
    expect(requestMessageUnReactV1(user1.token + 3, message.messageId, 1)).toStrictEqual(403);
    expect(requestMessageUnReactV1(user1.token, -1, 1)).toStrictEqual(400);
    expect(requestMessageUnReactV1(user1.token, message.messageId, 2)).toStrictEqual(400);
    requestMessageUnReactV1(user1.token, message.messageId, 1);
    expect(requestMessageUnReactV1(user1.token, message.messageId, 1)).toStrictEqual(400);
  });
});

describe('test for messageSendlaterV1', () => {
  let User1: {token: string, authUserId: number};
  let channel1 : {channelId: number};
  beforeEach(() => {
    requestClear();
    User1 = requestAuthRegisterV3('123@gmail.com', '123124113', 'A', 'a');
    channel1 = requestChannelsCreateV3(User1.token, 'channel1', true);
  });
  test('channelId does not refer to a valid channel', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000);
    expect(requestMessageSendlaterV1(User1.token, channel1.channelId + 1, 'message', timeSent + 5)).toStrictEqual(400);
    const channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages).toEqual([]);
  });
  test('check invalid token', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000);
    expect(requestMessageSendlaterV1(User1.token + 'aa', channel1.channelId, 'message', timeSent + 5)).toStrictEqual(403);
    const channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages).toEqual([]);
  });
  test('less 1 or larger 1000 characters', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000);
    expect(requestMessageSendlaterV1(User1.token, channel1.channelId, '', timeSent + 5)).toStrictEqual(400);
    expect(requestMessageSendlaterV1(User1.token, channel1.channelId, 'a'.repeat(1005), timeSent)).toStrictEqual(400);
    const channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages).toEqual([]);
  });
  test('timeSent is a time in the past', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000);
    expect(requestMessageSendlaterV1(User1.token, channel1.channelId, 'message', timeSent - 1)).toStrictEqual(400);
    const channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages).toEqual([]);
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const User2 = requestAuthRegisterV3('34@gmail.com', 'qweqdadqqw', 'B', 'b');
    expect(requestMessageSendlaterV1(User2.token, channel1.channelId, 'message1', timeSent + 5)).toStrictEqual(403);
    const channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages).toEqual([]);
  });
  test('normal situation delay 2 second', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const message = requestMessageSendlaterV1(User1.token, channel1.channelId, 'message1', timeSent + 3);
    let channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages).toEqual([]);
    wait(4);
    channelMes = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(channelMes.messages).toStrictEqual([
      {
        messageId: message.messageId,
        uId: User1.authUserId,
        message: 'message1',
        timeSent: expect.any(Number),
      }
    ]);
  });
});

describe('test for messageSendlaterdmV1', () => {
  let User1: {token: string, authUserId: number};
  let dm1 : {dmId: number};
  beforeEach(() => {
    requestClear();
    User1 = requestAuthRegisterV3('123@gmail.com', '123124113', 'A', 'a');
    dm1 = requestDmCreateV2(User1.token, []);
  });
  test('dmId does not refer to a valid dm', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000);
    expect(requestMessageSendlaterdmV1(User1.token, dm1.dmId + 1, 'message', timeSent)).toStrictEqual(400);
    const dmMes = requestDmMessagesV2(User1.token, dm1.dmId, 0);
    expect(dmMes.messages).toEqual([]);
  });
  test('check invalid token', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000);
    expect(requestMessageSendlaterdmV1(User1.token + 'aa', dm1.dmId, 'message', timeSent + 5)).toStrictEqual(403);
    const dmMes = requestDmMessagesV2(User1.token, dm1.dmId, 0);
    expect(dmMes.messages).toEqual([]);
  });
  test('less 1 or larger 1000 characters', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000);
    expect(requestMessageSendlaterdmV1(User1.token, dm1.dmId, '', timeSent + 5)).toStrictEqual(400);
    expect(requestMessageSendlaterdmV1(User1.token, dm1.dmId, 'a'.repeat(1005), timeSent)).toStrictEqual(400);
    const dmMes = requestDmMessagesV2(User1.token, dm1.dmId, 0);
    expect(dmMes.messages).toEqual([]);
  });
  test('timeSent is a time in the past', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000);
    expect(requestMessageSendlaterdmV1(User1.token, dm1.dmId, 'message', timeSent - 1)).toStrictEqual(400);
    const dmMes = requestDmMessagesV2(User1.token, dm1.dmId, 0);
    expect(dmMes.messages).toEqual([]);
  });
  test('dmId is valid and the authorised user is not a member of the dm', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const User2 = requestAuthRegisterV3('34@gmail.com', 'qweqdadqqw', 'B', 'b');
    expect(requestMessageSendlaterdmV1(User2.token, dm1.dmId, 'message1', timeSent + 5)).toStrictEqual(403);
    const dmMes = requestDmMessagesV2(User1.token, dm1.dmId, 0);
    expect(dmMes.messages).toEqual([]);
  });
  test('normal situation delay 2 seconds', () => {
    const timeSent = Math.floor((new Date()).getTime() / 1000);
    const message = requestMessageSendlaterdmV1(User1.token, dm1.dmId, 'message1', timeSent + 3);
    expect(message).toStrictEqual({ messageId: message.messageId });
    let dmMes = requestDmMessagesV2(User1.token, dm1.dmId, 0);
    expect(dmMes.messages).toEqual([]);
    wait(4);
    dmMes = requestDmMessagesV2(User1.token, dm1.dmId, 0);
    expect(dmMes.messages).toEqual([{
      messageId: message.messageId,
      uId: User1.authUserId,
      message: 'message1',
      timeSent: expect.any(Number),
    }]);
  });
});
