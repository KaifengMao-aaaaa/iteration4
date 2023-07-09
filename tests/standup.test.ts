import { requestClear, requestChannelMessagesV3, requestStandupActiveV1, requestStandupSendV1, requestStandupStartV1, requestAuthRegisterV3, requestChannelsCreateV3 } from './testHelpers';
import { wait } from '../src/other';
beforeEach(() => {
  requestClear();
});
describe('test for startup/start/v1', () => {
  let User1: {authUserId: number, token: string};
  let channel1: {channelId: number};
  beforeEach(() => {
    User1 = requestAuthRegisterV3('User1@gmail.com', '123456adssada', 'User1', 'user');
    channel1 = requestChannelsCreateV3(User1.token, 'channel1', true);
  });
  test('start a standup', () => {
    const time = Math.floor(new Date().getTime() / 1000);
    const finshTime = requestStandupStartV1(User1.token, channel1.channelId, 3);
    expect(finshTime.timeFinish).toBeLessThanOrEqual(time + 5);
    expect(finshTime.timeFinish).toBeGreaterThanOrEqual(time);
    wait(5);
    expect(requestStandupActiveV1(User1.token, channel1.channelId).isActive).toStrictEqual(false);
  });
  test('invalid channelId or invalid length', () => {
    expect(requestStandupStartV1(User1.token + 'invalid', channel1.channelId, 4)).toStrictEqual(403);
    expect(requestStandupStartV1(User1.token, channel1.channelId + 100, 3)).toStrictEqual(400);
    expect(requestStandupStartV1(User1.token, channel1.channelId, -5)).toStrictEqual(400);
  });
  test('not a member of the channel', () => {
    const User2 = requestAuthRegisterV3('USER2@gmail.com', 'qwedqdq', 'user2', 'user');
    expect(requestStandupStartV1(User2.token, channel1.channelId, 4)).toStrictEqual(403);
  });
});

describe('test for startup/active/v1', () => {
  let User1: {authUserId: number, token: string};
  let channel1: {channelId: number};
  beforeEach(() => {
    User1 = requestAuthRegisterV3('User1@gmail.com', '123456asdaijn', 'User1', 'user');
    channel1 = requestChannelsCreateV3(User1.token, 'channel1', true);
  });
  test('check active of a channel', () => {
    const time = Math.floor(new Date().getTime() / 1000);
    requestStandupStartV1(User1.token, channel1.channelId, 3);
    const returnV = requestStandupActiveV1(User1.token, channel1.channelId);
    expect(returnV.timeFinsh).toBeGreaterThanOrEqual(time);
    expect(returnV.timeFinsh).toBeLessThanOrEqual(time + 5);
    expect(returnV.isActive).toEqual(true);
    wait(4);
    expect(requestStandupActiveV1(User1.token, channel1.channelId).isActive).toEqual(false);
    expect(requestStandupSendV1(User1.token, channel1.channelId, 'message1')).toStrictEqual(400);
  });
  test('invalid channelId or invalid token', () => {
    expect(requestStandupActiveV1(User1.token + 'invalid', channel1.channelId)).toStrictEqual(403);
    expect(requestStandupActiveV1(User1.token, channel1.channelId + 100)).toStrictEqual(400);
  });
  test('not a member of the channel', () => {
    const User2 = requestAuthRegisterV3('USER2@gmail.com', 'qwedqdq', 'user2', 'user');
    expect(requestStandupActiveV1(User2.token, channel1.channelId)).toStrictEqual(403);
  });
});
describe('test for startup/send/v1', () => {
  let User1: {authUserId: number, token: string};
  let channel1: {channelId: number};
  beforeEach(() => {
    User1 = requestAuthRegisterV3('User1@gmail.com', '123456asbdb', 'User1', 'user');
    channel1 = requestChannelsCreateV3(User1.token, 'channel1', true);
  });
  test('send a message to buffer', () => {
    requestStandupStartV1(User1.token, channel1.channelId, 3);
    expect(requestStandupSendV1(User1.token, channel1.channelId, 'message1')).toStrictEqual({});
    expect(requestChannelMessagesV3(User1.token, channel1.channelId, 0).messages.length).toEqual(0);
    wait(6);
    const message = requestChannelMessagesV3(User1.token, channel1.channelId, 0);
    expect(message.messages[0].message).toStrictEqual('user1user: message1');
  });
  test('invalid channelId or invalid token or invalid message', () => {
    requestStandupStartV1(User1.token, channel1.channelId, 3);
    expect(requestStandupSendV1(User1.token + 'invalid', channel1.channelId, 'message')).toStrictEqual(403);
    expect(requestStandupSendV1(User1.token, channel1.channelId + 100, 'message')).toStrictEqual(400);
    expect(requestStandupSendV1(User1.token, channel1.channelId, 'm'.repeat(1002))).toStrictEqual(400);
    wait(3);
  });
  test('inactive channel', () => {
    expect(requestStandupSendV1(User1.token, channel1.channelId + 100, 'message')).toStrictEqual(400);
  });
  test('not a member of the channel', () => {
    const User2 = requestAuthRegisterV3('USER2@gmail.com', 'qwedqdq', 'user2', 'user');
    requestStandupStartV1(User1.token, channel1.channelId, 3);
    expect(requestStandupSendV1(User2.token, channel1.channelId, 'message')).toStrictEqual(403);
    wait(3);
  });
});
