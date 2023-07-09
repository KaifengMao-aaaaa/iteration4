// import { channelsCreateV2, channelsListallV2 } from '../src/channels';
// import { clearV1, requestHelper } from '../src/other';
// import { authRegisterV2 } from '../src/auth';
import { userType, requestClear, requestAuthRegisterV3, requestChannelsCreateV3, requestChannelsListV3, requestChannelListallV3 } from '../tests/testHelpers';

describe('ChannelsCreateV2', () => {
  let token: userType;
  // let channel: {channelId: number};
  beforeEach(() => {
    requestClear();
    token = requestAuthRegisterV3('123@gmail.com', '12345678', 'zack', 'andrew');
  });

  test.each([
    { name: 'name', ispublic: true },
    { name: 'name', ispublic: false }
  ])('Pass Cases', ({ name, ispublic }) => {
    const channel = requestChannelsCreateV3(token.token, name, ispublic);
    expect(channel).toStrictEqual({
      channelId: expect.any(Number)
    });
  });

  test('Fail Cases', () => {
    expect(requestChannelsCreateV3(token.token + 'a', 'Name', true)).toStrictEqual(403);
    expect(requestChannelsCreateV3(token.token, 'KJFLKAJFLJKAFkjajkfklajfwiojqqjfqlekjqrkqfmfakljafjaklfjxvkjlxjfjqklfq', false)).toStrictEqual(400);
    expect(requestChannelsCreateV3(token.token, '', false)).toStrictEqual(400);
  });
});

describe('testing channelsListV3', () => {
  let userToken: userType;
  // let channel: {channelId: number};
  beforeEach(() => {
    requestClear();
    userToken = requestAuthRegisterV3('123@gmail.com', '12345678', 'zack', 'andrew');
    // channel =
    requestChannelsCreateV3(userToken.token, 'COMP1511', false);
  });

  test('invalid token', () => {
    expect(requestChannelsListV3('failcase')).toStrictEqual(403);
  });

  test('Success case', () => {
    expect(requestChannelsListV3(userToken.token)).toStrictEqual({
      channels: [{
        channelId: expect.any(Number),
        name: 'COMP1511',
      }]
    });
  });

  // test('Success case with multiple channels', () => {
  //   requestChannelsCreateV3(userToken.token, 'COMP1531', true);
  //   requestChannelsCreateV3(userToken.token, 'COMP1521', false);
  //   expect(requestChannelsListV3(userToken.token)).toStrictEqual({
  //     channels: [
  //       {
  //         channelId: expect.any(Number),
  //         name: 'COMP1511',
  //       },
  //       {
  //         channelId: expect.any(Number),
  //         name: 'COMP1531',
  //       },
  //       {
  //         channelId: expect.any(Number),
  //         name: 'COMP1521',
  //       }
  //     ]
  //   });
  // });
  test('check whether only return channels with allmembers including authuserid', () => {
    const user2 = requestAuthRegisterV3('janidajsdn@gmail.com', 'qweewddqwdwd', 'zack', 'andrew');
    const channel2 = requestChannelsCreateV3(user2.token, 'second', true);
    // const user3 = requestAuthRegisterV3('jafasdfdn@gmail.com', 'qwewe23qwdwd', 'ben', 'ten');
    // const channel3 = requestChannelsCreateV3(user3.token, 'third channel', false);
    expect(requestChannelsListV3(user2.token)).toStrictEqual({
      channels: [
        {
          channelId: channel2.channelId,
          name: 'second'
        }
      ]
    });
  });
});

describe('test for channelsListallV3', () => {
  let User1: {token: string, authUserId: number};
  // let channel, channel2;
  beforeEach(() => {
    requestClear();
    User1 = requestAuthRegisterV3('123@gmail.com', '123a2b3a', 'John', 'Smith');
    // channel =
    requestChannelsCreateV3(User1.token, 'channel1', false);
    // channel2 =
    requestChannelsCreateV3(User1.token, 'channel2', true);
  });
  test('list all channels', () => {
    const imf = requestChannelListallV3(User1.token);
    expect(new Set(imf.channels)).toStrictEqual(new Set([
      {
        channelId: expect.any(Number),
        name: 'channel1'
      },
      {
        channelId: expect.any(Number),
        name: 'channel2'
      }
    ]));
  });

  test('token is invalid', () => {
    expect(requestChannelListallV3(User1.token + 'invalid')).toStrictEqual(403);
  });
});
