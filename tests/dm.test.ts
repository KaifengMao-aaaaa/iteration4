import { userType, requestClear, requestAuthRegisterV3, requestDmListV2, requestDmCreateV2, requestDmRemoveV2, requestDmDetailsV2, requestDmLeaveV2, requestDmMessagesV2, requestMessageSenddmV2, dm } from '../tests/testHelpers';

// type allMembers = {
//     uId: number,
//     email: string,
//     nameFirst: string,
//     nameLast: string,
//     handleStr: string,
// }

// type dmDetails = {
//     name: string,
//     allMembers: allMembers[],
// }

type messages = {
    messageId: number,
    uId: number,
    message: string,
    timeSent: number,
}
type dmMessage = {
    messages: messages,
    start: number,
    end: number,
}

describe('tests for dmCreateV1', () => {
  let user1: userType;
  let user2: userType;
  let user3: userType;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('123@gmail.com', '1231adfalk;erja', 'aarya', 'dave');
    user2 = requestAuthRegisterV3('a123@gmail.com', '1231adfalk;erja1', 'aaryag', 'daveg');
    user3 = requestAuthRegisterV3('b123@gmail.com', '1231adfalk;erja2', 'haarya', 'hdave');
  });
  test('Pass Cases', () => {
    expect(requestDmCreateV2(user1.token, [user2.authUserId, user3.authUserId])).toStrictEqual({ dmId: expect.any(Number) });
    expect(requestDmCreateV2(user1.token, [user2.authUserId])).toStrictEqual({ dmId: expect.any(Number) });
    expect(requestDmCreateV2(user1.token, [])).toStrictEqual({ dmId: expect.any(Number) });
  });
  test('token is invalid', () => {
    expect(requestDmCreateV2(user1.token + 'a', [])).toStrictEqual(403);
  });
  test('Uid does not refer to a valid user', () => {
    expect(requestDmCreateV2(user1.token, [1, user2.authUserId, user3.authUserId])).toStrictEqual(400);
  });
  test('There are duplicate Uids', () => {
    expect(requestDmCreateV2(user1.token, [user1.authUserId, user1.authUserId, user2.authUserId])).toStrictEqual(400);
  });
});

describe('Tests for dmCreateV1 to check if the name is generated correctly', () => {
  let user1: userType;
  let user2: userType;
  let user3: userType;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('123@gmail.com', '1231adfalk;erja', 'aarya', 'dave');
    user2 = requestAuthRegisterV3('a123@gmail.com', '1231adfalk;erja1', 'aaryag', 'daveg');
    user3 = requestAuthRegisterV3('b123@gmail.com', '1231adfalk;erja2', 'haarya', 'hdave');
  });
  test('Name is valid', () => {
    // const dmCreate1: dm =
    requestDmCreateV2(user1.token, [user2.authUserId, user3.authUserId]);
    // const dmCreate2: dm =
    requestDmCreateV2(user2.token, []);
    const dmNew = requestDmListV2(user1.token).dms;
    const dmNew1 = requestDmListV2(user2.token).dms;
    expect(dmNew[0].name).toStrictEqual('aaryadave, aaryagdaveg, haaryahdave');
    expect(dmNew1[1].name).toStrictEqual('aaryagdaveg');
  });
});

describe('tests for dmListV2', () => {
  let user1: userType;
  let user2: userType;
  let user3: userType;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('1231@gmail.com', '122342432453', 'aKaifeng', 'mao');
    user2 = requestAuthRegisterV3('1232@gmail.com', '122342432453', 'bKaifeng', 'mao');
    user3 = requestAuthRegisterV3('1233@gmail.com', '122342432453', 'cKaifeng', 'mao');
  });
  test('token is invalid', () => {
    expect(requestDmListV2(user1.token.concat('1'))).toStrictEqual(403);
  });
  test('normal situation with emptyUIds', () => {
    const emptyUIds: number[] = [];
    const dm: dm = requestDmCreateV2(user1.token, emptyUIds);
    expect(requestDmListV2(user1.token)).toStrictEqual({
      dms: [{
        dmId: dm.dmId,
        name: 'akaifengmao'
      }]
    });
  });
  test('normal situation with 2 uIds in each 2 dms', () => {
    const uIds1: number[] = [user2.authUserId, user3.authUserId];
    const uIds2: number[] = [user1.authUserId, user3.authUserId];
    const dm1: dm = requestDmCreateV2(user1.token, uIds1);
    const dm2: dm = requestDmCreateV2(user2.token, uIds2);
    expect(requestDmListV2(user1.token)).toStrictEqual({
      dms: [{
        dmId: dm1.dmId,
        name: 'akaifengmao, bkaifengmao, ckaifengmao'
      },
      {
        dmId: dm2.dmId,
        name: 'akaifengmao, bkaifengmao, ckaifengmao'
      }]
    });
  });
});

describe('tests for dmRemoveV2', () => {
  let uIds1: number[], uIds2: number[], dm1: dm, dm2: dm;
  let user1: userType, user2: userType, user3: userType;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('1231@gmail.com', '122342432453', 'aKaifeng', 'mao');
    user2 = requestAuthRegisterV3('1232@gmail.com', '122342432453', 'bKaifeng', 'mao');
    user3 = requestAuthRegisterV3('1233@gmail.com', '122342432453', 'cKaifeng', 'mao');
    uIds1 = [user2.authUserId, user3.authUserId];
    uIds2 = [user1.authUserId, user3.authUserId];
    dm1 = requestDmCreateV2(user1.token, uIds1);
    dm2 = requestDmCreateV2(user2.token, uIds2);
  });
  test('dmId does not refer to a valid DM', () => {
    expect(requestDmRemoveV2(user1.token, dm1.dmId + 100)).toStrictEqual(400);
  });
  test('dmId is valid and the authorised user is not the original DM creator', () => {
    expect(requestDmRemoveV2(user2.token, dm1.dmId)).toStrictEqual(403);
  });
  test('dmId is valid and the authorised user is no longer in the DM', () => {
    requestDmLeaveV2(user1.token, dm1.dmId);
    expect(requestDmRemoveV2(user1.token, dm1.dmId)).toStrictEqual(403);
  });
  test('token is invalid', () => {
    expect(requestDmRemoveV2(user1.token.concat('1'), dm1.dmId)).toStrictEqual(403);
  });
  test('normal situation', () => {
    expect(requestDmRemoveV2(user1.token, dm1.dmId)).toStrictEqual({});
    expect(requestDmListV2(user1.token)).toStrictEqual({
      dms: [{
        dmId: dm2.dmId,
        name: 'akaifengmao, bkaifengmao, ckaifengmao'
      }]
    });
  });
});

describe('tests for dmDetailsV2', () => {
  let user1: userType, user2: userType, user3:userType, uIds1: number[], dm1: dm;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('1231@gmail.com', '122342432453', 'aKaifeng', 'mao');
    user2 = requestAuthRegisterV3('1232@gmail.com', '122342432453', 'bKaifeng', 'mao');
    user3 = requestAuthRegisterV3('1233@gmail.com', '122342432453', 'cKaifeng', 'mao');
    uIds1 = [user2.authUserId, user3.authUserId];
    dm1 = requestDmCreateV2(user1.token, uIds1);
  });
  test('dmId does not refer to a valid DM', () => {
    expect(requestDmDetailsV2(user2.token, dm1.dmId + 1000)).toStrictEqual(400);
  });
  test('dmId is valid and the authorised user is not a member of the DM', () => {
    const user4: userType = requestAuthRegisterV3('1234@gmail.com', '122342432453', 'dKaifeng', 'mao');
    expect(requestDmDetailsV2(user4.token, dm1.dmId)).toStrictEqual(403);
  });
  test('token is invalid', () => {
    expect(requestDmDetailsV2(user1.token + 'i', dm1.dmId)).toStrictEqual(403);
  });
  describe('Tests for dmLeavev1', () => {
    let user1: userType;
    let user2: userType;
    let user3: userType;
    let user4: userType;
    let user5: userType;
    let dmCreate: dm;
    beforeEach(() => {
      requestClear();
      user1 = requestAuthRegisterV3('123@gmail.com', '1231adfalk;erja', 'aarya', 'dave');
      user2 = requestAuthRegisterV3('a123@gmail.com', '1231adfalk;erja1', 'aaryag', 'daveg');
      user3 = requestAuthRegisterV3('b123@gmail.com', '1231adfalk;erja2', 'haarya', 'hdave');
      user4 = requestAuthRegisterV3('c123@gmail.com', '1231adfalkasdfa', 'baarya', 'bdave');
      dmCreate = requestDmCreateV2(user1.token, [user2.authUserId, user3.authUserId, user4.authUserId]);
    });
    test('Pass Cases', () => {
      expect(requestDmLeaveV2(user2.token, dmCreate.dmId)).toStrictEqual({});
      expect(requestDmLeaveV2(user3.token, dmCreate.dmId)).toStrictEqual({});
      expect(requestDmLeaveV2(user4.token, dmCreate.dmId)).toStrictEqual({});
    });
    test('Fail Cases', () => {
      user5 = requestAuthRegisterV3('1234@gmail.com', '1231adfalk;erasdfja', 'aaryab', 'dave');
      expect(requestDmLeaveV2(user1.token, 3)).toStrictEqual(400);
      expect(requestDmLeaveV2(user4.token, 3)).toStrictEqual(400);
      expect(requestDmLeaveV2('4', dmCreate.dmId)).toStrictEqual(403);
      expect(requestDmLeaveV2(user5.token, dmCreate.dmId)).toStrictEqual(403);
    });
  });

  describe('tests for dmMessagesV2', () => {
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
      expect(requestDmMessagesV2(user1.token, dm1.dmId + 1, 0)).toStrictEqual(400);
    });
    test('start is greater than the total number of messages in the dm', () => {
      requestMessageSenddmV2(user1.token, dm1.dmId, 'Hi');
      expect(requestDmMessagesV2(user1.token, dm1.dmId, 2)).toStrictEqual(400);
    });
    test('dmId is valid and the authorised user is not a member of the DM', () => {
      const user4: userType = requestAuthRegisterV3('1234@gmail.com', '122342432453', 'dKaifeng', 'mao');
      requestMessageSenddmV2(user1.token, dm1.dmId, 'Hi');
      expect(requestDmMessagesV2(user4.token, dm1.dmId, 0)).toStrictEqual(403);
    });
    test('token is invalid', () => {
      requestMessageSenddmV2(user1.token, dm1.dmId, 'Hi');
      expect(requestDmMessagesV2(user1.token.concat('1'), dm1.dmId, 0)).toStrictEqual(403);
    });
    test('normal situation with 1 message in the dm', () => {
      requestMessageSenddmV2(user1.token, dm1.dmId, 'Hi');
      const dmMessage: dmMessage = requestDmMessagesV2(user1.token, dm1.dmId, 0);
      expect(dmMessage).toStrictEqual({
        messages: dmMessage.messages,
        start: 0,
        end: -1,
      });
    });
    test('normal situation with 50 messages in the dm', () => {
      for (let i = 0; i < 50; i++) {
        requestMessageSenddmV2(user1.token, dm1.dmId, 'Hi');
      }
      const dmMessage: dmMessage = requestDmMessagesV2(user1.token, dm1.dmId, 0);
      expect(dmMessage).toStrictEqual({
        messages: dmMessage.messages,
        start: 0,
        end: -1,
      });
    });
    test('normal situation with 51 messages in the dm', () => {
      for (let i = 0; i < 51; i++) {
        requestMessageSenddmV2(user1.token, dm1.dmId, 'Hi');
      }
      const dmMessage: dmMessage = requestDmMessagesV2(user1.token, dm1.dmId, 0);
      expect(dmMessage).toStrictEqual({
        messages: dmMessage.messages,
        start: 0,
        end: 50,
      });
    });
  });
});
