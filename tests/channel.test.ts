import {
  userType, requestaddOwner, requestremoveOwner, requestClear, requestAuthRegisterV3, requestChannelsCreateV3, requestChannelJoinV3, requestChannelDetailsV3, requestChannelLeaveV2,
  requestChannelInviteV3, requestChannelMessagesV3, requestMessageSendV2, requestStandupActiveV1, requestStandupStartV1
} from '../tests/testHelpers';

describe('requestChannelJoinV3', () => {
  let token: userType, channelId1: {channelId: number}, token2: userType, channelId2: {channelId: number};
  beforeEach(() => {
    requestClear();
    token = requestAuthRegisterV3('Suji124@gmail.com', '1236556454', 'Sujanthan', 'Manoharan');
    token2 = requestAuthRegisterV3('SujMan@gmail.com', '6565465465', 'Suji', 'Mano');
    channelId1 = requestChannelsCreateV3(token.token, 'channel1', true);
    channelId2 = requestChannelsCreateV3(token2.token, 'channel2', false);
  });
  test('Invalid channelId', () => {
    expect(requestChannelJoinV3(token.token, -1)).toStrictEqual(400);
  });
  test('Invalid token', () => {
    expect(requestChannelJoinV3('fail', channelId1.channelId)).toStrictEqual(403);
  });
  test('User is already in a channel', () => {
    expect(requestChannelJoinV3(token.token, channelId1.channelId)).toStrictEqual(400);
  });
  test('Channel is private', () => {
    expect(requestChannelJoinV3(token2.token, channelId2.channelId)).toStrictEqual(400);
  });
  test('normal situation', () => {
    expect(requestChannelDetailsV3(token.token, channelId1.channelId)).toStrictEqual({
      name: expect.any(String),
      isPublic: expect.any(Boolean),
      ownerMembers: [{
        uId: expect.any(Number),
        email: expect.any(String),
        nameFirst: expect.any(String),
        nameLast: expect.any(String),
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: expect.any(Number),
        email: expect.any(String),
        nameFirst: expect.any(String),
        nameLast: expect.any(String),
        handleStr: expect.any(String),
      }],
    });
    expect(requestChannelJoinV3(token2.token, channelId1.channelId)).toStrictEqual({});
  });
  test('Success', () => {
    expect(requestChannelDetailsV3(token.token, channelId1.channelId)).toEqual({
      name: expect.any(String),
      isPublic: expect.any(Boolean),
      ownerMembers: [{
        uId: expect.any(Number),
        email: expect.any(String),
        nameFirst: expect.any(String),
        nameLast: expect.any(String),
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: expect.any(Number),
        email: expect.any(String),
        nameFirst: expect.any(String),
        nameLast: expect.any(String),
        handleStr: expect.any(String),
      }],
    });
    expect(requestChannelJoinV3(token2.token, channelId1.channelId)).toEqual({});
  });
});

describe('requestChannelDetailsV3', () => {
  let token: userType, channelId1: {channelId: number}, token2: userType; // channelId2: {channelId: number};
  beforeEach(() => {
    requestClear();
    token = requestAuthRegisterV3('Suji124@gmail.com', '1236556454', 'Sujanthan', 'Manoharan');
    channelId1 = requestChannelsCreateV3(token.token, 'channel1', true);
    token2 = requestAuthRegisterV3('SujMan@gmail.com', '6565465465', 'Suji', 'Mano');
    // channelId2 = requestChannelsCreateV3(token2.token, 'channel2', false);
  });
  test('Correctly outputs the details for the channel', () => {
    expect(requestChannelDetailsV3(token.token, channelId1.channelId)).toEqual({
      name: expect.any(String),
      isPublic: expect.any(Boolean),
      ownerMembers: [{
        uId: expect.any(Number),
        email: expect.any(String),
        nameFirst: expect.any(String),
        nameLast: expect.any(String),
        handleStr: expect.any(String),
      }],
      allMembers: [{
        uId: expect.any(Number),
        email: expect.any(String),
        nameFirst: expect.any(String),
        nameLast: expect.any(String),
        handleStr: expect.any(String),
      }],
    });
  });
  test('Invalid channelId', () => {
    expect(requestChannelDetailsV3(token.token, -1)).toStrictEqual(400);
  });
  test('Invalid token', () => {
    expect(requestChannelDetailsV3('fail', channelId1.channelId)).toStrictEqual(403);
  });
  test('User is not a member of the channel', () => {
    expect(requestChannelDetailsV3(token2.token, channelId1.channelId)).toStrictEqual(403);
  });
});

describe('Testing channelLeaveV1', () => {
  let user1: userType, user2: userType, user3: userType, user4: userType;
  let channelCreate1: {channelId: number}, channelCreate2: {channelId: number}, channelCreate3: {channelId: number};
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('abcd@gmail.com', '1234cd2', 'John', 'Smith');
    user2 = requestAuthRegisterV3('validemail@gmail.com', '123abc!@#', 'John', 'Smith');
    user3 = requestAuthRegisterV3('vahfberuwhcbl@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    user4 = requestAuthRegisterV3('c123@gmail.com', '1231agwrs', 'Barry', 'Bene');
    channelCreate1 = requestChannelsCreateV3(user1.token, 'channel1', true);
    channelCreate2 = requestChannelsCreateV3(user2.token, 'channel2', true);
    channelCreate3 = requestChannelsCreateV3(user3.token, 'channel3', true);
  });
  test('Pass Cases', () => {
    expect(requestChannelLeaveV2(user1.token, channelCreate1.channelId)).toStrictEqual({});
    expect(requestChannelLeaveV2(user2.token, channelCreate2.channelId)).toStrictEqual({});
    expect(requestChannelLeaveV2(user3.token, channelCreate3.channelId)).toStrictEqual({});
  });
  test('Fail Cases', () => {
    expect(requestChannelLeaveV2(user1.token, channelCreate1.channelId + 1000)).toStrictEqual(400);
    expect(requestChannelLeaveV2(user4.token, channelCreate1.channelId)).toStrictEqual(403);
    expect(requestChannelLeaveV2('32', channelCreate1.channelId)).toStrictEqual(403);
    expect(requestChannelLeaveV2(user1.token, channelCreate2.channelId)).toStrictEqual(403);
  });

  test('If user is a part of an active stand up error', () => {
    requestStandupStartV1(user1.token, channelCreate1.channelId, 2);
    requestStandupActiveV1(user1.token, channelCreate1.channelId);
    expect(requestChannelLeaveV2(user1.token, channelCreate1.channelId)).toStrictEqual(400);
  });

  test('If user is not a part of an active stand up', () => {
    requestChannelJoinV3(user2.token, channelCreate1.channelId);
    requestStandupStartV1(user1.token, channelCreate1.channelId, 2);
    requestStandupActiveV1(user1.token, channelCreate1.channelId);
    expect(requestChannelLeaveV2(user2.token, channelCreate1.channelId)).toStrictEqual({});
  });
});

describe('Checking if channel details was updated- success case (channel leave)', () => {
  let user1: userType, user2: userType, user3: userType, user4: userType;
  let newChannel: {channelId: number};
  // let channelJoin2, channelJoin3, channelJoin4, channelLeave;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('abcd@gmail.com', '1234cd2', 'Ben', 'Ten');
    user2 = requestAuthRegisterV3('validemail@gmail.com', '123abc!@#', 'John', 'Smith');
    user3 = requestAuthRegisterV3('vahfberuwhcbl@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    user4 = requestAuthRegisterV3('c123@gmail.com', '1231agwrs', 'Barry', 'Bene');
    newChannel = requestChannelsCreateV3(user1.token, 'channel', true);
    requestChannelJoinV3(user2.token, newChannel.channelId);
    requestChannelJoinV3(user3.token, newChannel.channelId);
    requestChannelJoinV3(user4.token, newChannel.channelId);
    requestChannelLeaveV2(user2.token, newChannel.channelId);
  });

  test('success case', () => {
    const expectArray = new Set([
      {
        uId: expect.any(Number),
        email: 'abcd@gmail.com',
        nameFirst: 'Ben',
        nameLast: 'Ten',
        handleStr: expect.any(String)
      },
      {
        uId: expect.any(Number),
        email: 'vahfberuwhcbl@gmail.com',
        nameFirst: 'Jake',
        nameLast: 'Renzella',
        handleStr: expect.any(String)
      },
      {
        uId: expect.any(Number),
        email: 'c123@gmail.com',
        nameFirst: 'Barry',
        nameLast: 'Bene',
        handleStr: expect.any(String)
      }
    ]);
    const returnV = requestChannelDetailsV3(user1.token, newChannel.channelId);
    expect(returnV).toStrictEqual({
      name: 'channel',
      isPublic: true,
      ownerMembers: [
        {
          uId: expect.any(Number),
          email: 'abcd@gmail.com',
          nameFirst: 'Ben',
          nameLast: 'Ten',
          handleStr: expect.any(String)
        },
      ],
      allMembers: expect.any(Array)
    });
    expect(new Set(returnV.allMembers)).toStrictEqual(expectArray);
  });
});

describe('requestaddOwner', () => {
  let token1: userType, token2: userType, token3: userType;
  let channelId1: {channelId: number}, channelId2: {channelId: number};
  beforeEach(() => {
    requestClear();
    token1 = requestAuthRegisterV3('Suji124@gmail.com', '1236556454', 'Sujanthan', 'Manoharan');
    token2 = requestAuthRegisterV3('SujMan@gmail.com', '6565465465', 'Suji', 'Mano');
    token3 = requestAuthRegisterV3('suii@gmail.com', '254964783', 'Suii', 'Ronaldo');
    channelId1 = requestChannelsCreateV3(token1.token, 'channel1', true);
    channelId2 = requestChannelsCreateV3(token2.token, 'channel2', true);
    requestChannelsCreateV3(token3.token, 'channel3', false);
    requestChannelJoinV3(token2.token, channelId1.channelId);
    requestChannelJoinV3(token1.token, channelId2.channelId);
    requestChannelJoinV3(token3.token, channelId1.channelId);
  });
  describe('Specific error cases', () => {
    test('Invalid channelId', () => {
      expect(requestaddOwner(token1.token, -1, token1.authUserId)).toEqual(400);
    });
    test('Invalid userId', () => {
      expect(requestaddOwner(token1.token, channelId1.channelId, -1)).toEqual(400);
    });
    test('uId not a member of the channel', () => {
      expect(requestaddOwner(token1.token, channelId2.channelId, token3.authUserId)).toEqual(400);
    });
    test('user is already a channel owner', () => {
      requestaddOwner(token2.token, channelId2.channelId, token1.authUserId);
      expect(requestaddOwner(token1.token, channelId2.channelId, token1.authUserId)).toEqual(400);
    });
    test('Invalid token', () => {
      expect(requestaddOwner('failcase', channelId1.channelId, token1.authUserId)).toEqual(403);
    });
    test('the user adding the new owner is not a global owner or channel owner, but is in the channel', () => {
      requestChannelJoinV3(token3.token, channelId2.channelId);
      requestChannelJoinV3(token1.token, channelId2.channelId);
      expect(requestaddOwner(token3.token, channelId2.channelId, token3.authUserId)).toEqual(403);
    });
  });
  describe('Success', () => {
    test('successful case', () => {
      expect(requestaddOwner(token1.token, channelId1.channelId, token3.authUserId)).toEqual({});
    });
  });
});

describe('removeChannelOwnerV2', () => {
  let token1: userType, token2: userType, token3: userType; // token4: userType;
  let channelId1: {channelId: number}, channelId2: {channelId: number};
  // let channelJoin1, channelJoin2;
  beforeEach(() => {
    requestClear();
    token1 = requestAuthRegisterV3('Suji124@gmail.com', '1236556454', 'Sujanthan', 'Manoharan');
    token2 = requestAuthRegisterV3('SujMan@gmail.com', '6565465465', 'Suji', 'Mano');
    token3 = requestAuthRegisterV3('suii@gmail.com', '254964783', 'Suii', 'Ronaldo');
    // token4 = requestAuthRegisterV3('validmail@gmail.com', 'password', 'Ben', 'Ten');
    channelId1 = requestChannelsCreateV3(token1.token, 'channel1', true);
    channelId2 = requestChannelsCreateV3(token2.token, 'channel2', true);
    requestChannelJoinV3(token2.token, channelId1.channelId);
    requestChannelJoinV3(token1.token, channelId2.channelId);
    requestaddOwner(token2.token, channelId2.channelId, token1.authUserId);
  });
  describe('Specific error cases', () => {
    test('Invalid channelId', () => {
      expect(requestremoveOwner(token1.token, -1, token1.authUserId)).toEqual(400);
    });
    test('Invalid userId', () => {
      expect(requestremoveOwner(token1.token, channelId1.channelId, -1)).toEqual(400);
    });
    test('Invalid token', () => {
      expect(requestremoveOwner('failcase', channelId1.channelId, token1.authUserId)).toEqual(403);
    });
    test('Removing an owner who is the only channel owner', () => {
      expect(requestremoveOwner(token1.token, channelId1.channelId, token2.authUserId)).toEqual(400);
    });
    test('User being removed as owner is not currently owner', () => {
      expect(requestremoveOwner(token2.token, channelId1.channelId, token3.authUserId)).toEqual(403);
    });
    test('User attempting to remove owner lacks permissions', () => {
      requestaddOwner(token2.token, channelId1.channelId, token1.authUserId);
      expect(requestremoveOwner(token3.token, channelId1.channelId, token2.authUserId)).toEqual(403);
    });
    test('User attempting to remove owner is not a member of the channel', () => {
      requestChannelJoinV3(token1.token, channelId2.channelId);
      requestaddOwner(token2.token, channelId2.channelId, token1.authUserId);
      expect(requestremoveOwner(token3.token, channelId2.channelId, token2.authUserId)).toEqual(403);
    });
  });
  describe('Success', () => {
    test('Successful case', () => {
      expect(requestremoveOwner(token1.token, channelId2.channelId, token2.authUserId)).toEqual({});
    });
  });
});

describe('tests for channelMessagesV3', () => {
  let User1: {token: string, authUserId: number};
  let channel1: {channelId: number};
  beforeEach(() => {
    requestClear();
    User1 = requestAuthRegisterV3('1231321@gmail.com', '12431231232', 'A', 'a');
    channel1 = requestChannelsCreateV3(User1.token, 'channel1', true);
  });
  test('view messages of a channel', async () => {
    const message1Time = Math.floor(new Date().getTime() / 1000);
    requestMessageSendV2(User1.token, channel1.channelId, 'message1');
    const messageInf = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(messageInf.messages[0].timeSent).toBeGreaterThanOrEqual(message1Time);
    expect(messageInf.messages[0].timeSent).toBeLessThanOrEqual(message1Time + 2);
    expect(messageInf.messages[0].message).toStrictEqual('message1');
    expect(messageInf.end).toBe(-1);
  });
  test('token is invalid or channelId does not refer to a valid channel or start is greater than the total number of messages in the channel', () => {
    requestMessageSendV2(User1.token, channel1.channelId, 'message1');
    expect(requestChannelMessagesV3(User1.token + 'asd', channel1.channelId, 0)).toStrictEqual(403);
    expect(requestChannelMessagesV3(User1.token, channel1.channelId + 10, 0)).toStrictEqual(400);
    expect(requestChannelMessagesV3(User1.token, channel1.channelId, 100)).toStrictEqual(400);
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const User2 = requestAuthRegisterV3('onqadio@gmail.com', 'adadwafd', 'B', 'b');
    expect(requestChannelMessagesV3(User2.token, channel1.channelId, 0)).toStrictEqual(403);
  });
  test('channel with over 50 messages', () => {
    for (let i = 0; i < 51; i++) {
      requestMessageSendV2(User1.token, channel1.channelId, 'message' + String(i));
    }

    expect(requestChannelMessagesV3(User1.token, channel1.channelId, 0)).toStrictEqual({
      start: 0,
      end: 50,
      messages: expect.any(Array)
    });
  });
});

describe('tests for channelInviteV3', () => {
  let User1: {token: string, authUserId: number};
  let channel1: {channelId: number};
  beforeEach(() => {
    requestClear();
    User1 = requestAuthRegisterV3('1231321@gmail.com', '12431231232', 'A', 'a');
    channel1 = requestChannelsCreateV3(User1.token, 'channel1', true);
  });
  test('invite a user to channel', () => {
    const User2 = requestAuthRegisterV3('onqadio@gmail.com', 'adadwafd', 'B', 'b');
    expect(requestChannelInviteV3(User1.token, channel1.channelId, User2.authUserId)).toStrictEqual({});
    expect(requestMessageSendV2(User2.token, channel1.channelId, 'message1')).toStrictEqual({
      messageId: expect.any(Number)
    });
  });
  test('token is invalid or uId does not refer to a valid user or channelId does not refer to a valid channel', () => {
    const User2 = requestAuthRegisterV3('onqadio@gmail.com', 'adadwafd', 'B', 'b');
    expect(requestChannelInviteV3(User1.token, channel1.channelId + 10, User2.authUserId)).toStrictEqual(400);
    expect(requestChannelInviteV3(User1.token + 'assad', channel1.channelId, User2.authUserId)).toStrictEqual(403);
    expect(requestChannelInviteV3(User1.token, channel1.channelId, User2.authUserId + 10)).toStrictEqual(400);
  });
  test('uId refers to a user who is already a member of the channel', () => {
    expect(requestChannelInviteV3(User1.token, channel1.channelId, User1.authUserId)).toStrictEqual(400);
  });
  test('channelId is valid and the authorised user is not a member of the channel', () => {
    const User2 = requestAuthRegisterV3('onqadio@gmail.com', 'adadwafd', 'B', 'b');
    const User3 = requestAuthRegisterV3('onasdasddio@gmail.com', 'adasfdaadwafd', 'C', 'c');
    expect(requestChannelInviteV3(User2.token, channel1.channelId, User3.authUserId)).toStrictEqual(403);
  });
  test('channelId is valid and the authorised user is not a member of the channel but it is global owner', () => {
    const User2 = requestAuthRegisterV3('onqadio@gmail.com', 'adadwafd', 'B', 'b');
    const User3 = requestAuthRegisterV3('onasdasddio@gmail.com', 'adasfdaadwafd', 'C', 'c');
    const channel2 = requestChannelsCreateV3(User2.token, 'channel2', false);
    expect(requestChannelInviteV3(User1.token, channel2.channelId, User3.authUserId)).toStrictEqual({});
    const channelInf = requestChannelDetailsV3(User2.token, channel2.channelId);
    expect(channelInf.allMembers.length).toBe(2);
    const IdArray = [channelInf.allMembers[0].uId, channelInf.allMembers[1].uId];
    expect(new Set(IdArray)).toStrictEqual(new Set([User2.authUserId, User3.authUserId]));
  });
});
