import {
  userType, requestClear, requestAuthRegisterV3, requestChannelsCreateV3, requestChannelDetailsV3,
  requestUserRemoveV1, requestPermissionChangeV1, requestDmCreateV2, requestDmDetailsV2
} from '../tests/testHelpers';

describe.skip('adminUserRemoveV1', () => {
  let token: userType, token2: userType, user1: userType, user2: userType;
  beforeEach(() => {
    requestClear();
    token = requestAuthRegisterV3('Suji124@gmail.com', '1236556454', 'Sujanthan', 'Manoharan');
    token2 = requestAuthRegisterV3('SujMan@gmail.com', '6565465465', 'Suji', 'Mano');
    user1 = requestAuthRegisterV3('abcd@gmail.com', '1234cd2', 'John', 'Smith');
    user2 = requestAuthRegisterV3('validemail@gmail.com', '123abc!@#', 'John', 'Smith');
  });
  describe('Fail cases', () => {
    test('Invalid uId', () => {
      expect(requestUserRemoveV1(token.token, -1)).toStrictEqual(400);
    });
    test('Invalid token', () => {
      expect(requestUserRemoveV1('fail', user1.authUserId)).toStrictEqual(403);
    });
    test('User is not a global owner', () => {
      expect(requestUserRemoveV1(token2.token, user1.authUserId)).toStrictEqual(403);
    });
    test('User is the only global owner', () => {
      expect(requestUserRemoveV1(token.token, user2.authUserId)).toStrictEqual(400);
    });
  });
  describe('Pass cases', () => {
    test('Success', () => {
      requestPermissionChangeV1(token.token, token2.authUserId, 1);
      const result = requestUserRemoveV1(token.token, user2.authUserId);
      const dm = requestDmCreateV2(token.token, [user1.authUserId, user2.authUserId]);
      const channel = requestChannelsCreateV3(token.token, 'Channel1', true);
      requestChannelsCreateV3(token2.token, 'Channel2', true);
      requestChannelsCreateV3(user1.token, 'Channel2', false);
      requestDmCreateV2(token2.token, [user2.authUserId, user1.authUserId]);
      requestDmCreateV2(user1.token, [token2.authUserId, user2.authUserId]);
      expect(result).toEqual({});
      expect(requestChannelDetailsV3(token.token, channel.channelId)).toEqual({
        name: 'Channel1',
        isPublic: true,
        ownerMembers: [{
          uId: 0,
          nameFirst: 'Sujanthan',
          nameLast: 'Manoharan',
          email: 'Suji124@gmail.com',
          handleStr: 'sujanthanmanoharan',
        }],
        allMembers: [{
          uId: 0,
          nameFirst: 'Sujanthan',
          nameLast: 'Manoharan',
          email: 'Suji124@gmail.com',
          handleStr: 'sujanthanmanoharan',
        }]
      });
      expect(requestDmDetailsV2(token.token, dm.dmId)).toEqual({
        members: [{
          email: 'abcd@gmail.com',
          handleStr: 'johnsmith',
          nameFirst: 'John',
          nameLast: 'Smith',
          uId: 8
        },
        {
          email: 'validemail@gmail.com',
          handleStr: 'johnsmith0',
          nameFirst: 'Removed',
          nameLast: 'user',
          uId: 12
        },
        {
          email: 'Suji124@gmail.com',
          handleStr: 'sujanthanmanoharan',
          nameFirst: 'Sujanthan',
          nameLast: 'Manoharan',
          uId: 0
        }],
        name: 'johnsmith, johnsmith0, sujanthanmanoharan'
      });
    });
  });
});

describe.skip('adminUserPermissionChangeV1', () => {
  let token: userType, token2: userType, user1: userType, user2: userType;
  beforeEach(() => {
    requestClear();
    token = requestAuthRegisterV3('Suji124@gmail.com', '1236556454', 'Sujanthan', 'Manoharan');
    token2 = requestAuthRegisterV3('SujMan@gmail.com', '6565465465', 'Suji', 'Mano');
    user1 = requestAuthRegisterV3('abcd@gmail.com', '1234cd2', 'John', 'Smith');
    user2 = requestAuthRegisterV3('validemail@gmail.com', '123abc!@#', 'John', 'Smith');
  });
  describe('Fail cases', () => {
    test('Invalid uId', () => {
      expect(requestPermissionChangeV1(token.token, -1, 2)).toStrictEqual(400);
    });
    test('Invalid token', () => {
      expect(requestPermissionChangeV1('fail', user1.authUserId, 2)).toStrictEqual(403);
    });
    test('Permission Id is invalid', () => {
      expect(requestPermissionChangeV1(token.token, user1.authUserId, -1)).toStrictEqual(400);
    });
    test('Authorised User is not a global owner', () => {
      expect(requestPermissionChangeV1(token2.token, user1.authUserId, 1)).toStrictEqual(403);
    });
    test('User already has member permissions', () => {
      expect(requestPermissionChangeV1(token.token, user2.authUserId, 2)).toStrictEqual(400);
    });
    test('User already has owner permissions', () => {
      requestPermissionChangeV1(token.token, user2.authUserId, 1);
      expect(requestPermissionChangeV1(token.token, user2.authUserId, 1)).toStrictEqual(400);
    });
    test('User is the only global owner', () => {
      requestPermissionChangeV1(token.token, token.authUserId, 1);
      expect(requestPermissionChangeV1(token.token, token.authUserId, 2)).toStrictEqual(400);
    });
  });
  describe('Success cases', () => {
    test('Permission Id is 1', () => {
      requestPermissionChangeV1(token.token, token2.authUserId, 1);
      expect(requestPermissionChangeV1(token.token, user1.authUserId, 1)).toStrictEqual({});
    });
    test('Permission Id is 2', () => {
      requestPermissionChangeV1(token.token, token2.authUserId, 1);
      requestPermissionChangeV1(token.token, user2.authUserId, 1);
      expect(requestPermissionChangeV1(token.token, user2.authUserId, 2)).toStrictEqual({});
    });
  });
});
