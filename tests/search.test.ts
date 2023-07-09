import {
  requestSearchV1, requestClear, requestAuthRegisterV3, requestChannelsCreateV3, requestDmCreateV2, requestMessageSendV2,
  requestMessageSenddmV2, requestChannelMessagesV3, requestChannelJoinV3, requestDmMessagesV2, userType
} from './testHelpers';

interface messages {
    messageId: number,
    uId: number,
    message : string,
    timeSent : number,
    isPinned: boolean
  }

type ReturnMessage = {
    messages: messages[],
    start: number,
    end: number
}

describe.skip('Tests for Search', () => {
  let user1: userType, user2: userType, user3: userType, uIds1: number[], channel1: { channelId: number }, dm1: { dmId: number },
    channelMsgs: ReturnMessage, dmMsg: ReturnMessage;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('1231@gmail.com', '122342432453', 'aKaifeng', 'mao');
    user2 = requestAuthRegisterV3('1232@gmail.com', '122342432453', 'bKaifeng', 'mao');
    user3 = requestAuthRegisterV3('1233@gmail.com', '122342432453', 'cKaifeng', 'mao');
    channel1 = requestChannelsCreateV3(user1.token, 'uIds1', true);
    requestChannelJoinV3(user2.token, channel1.channelId);
    requestChannelJoinV3(user3.token, channel1.channelId);
    requestMessageSendV2(user1.token, channel1.channelId, 'Good Day!');
    requestMessageSendV2(user2.token, channel1.channelId, 'Yes it is a Good Day!');
    requestMessageSendV2(user3.token, channel1.channelId, 'I also Agree!');
    channelMsgs = requestChannelMessagesV3(user1.token, channel1.channelId, 2);
    uIds1 = [user2.authUserId, user3.authUserId];
    dm1 = requestDmCreateV2(user1.token, uIds1);
    requestMessageSenddmV2(user1.token, dm1.dmId, 'Hi');
    requestMessageSenddmV2(user2.token, dm1.dmId, 'Hey, User3, How are you?');
    requestMessageSenddmV2(user1.token, dm1.dmId, 'Im doing well!');
    dmMsg = requestDmMessagesV2(user1.token, dm1.dmId, 2);
  });
  test('Passcases', () => {
    expect(requestSearchV1(user1.token, 'Hi')).toStrictEqual({
      messageReturn: [{
        messageId: dmMsg.messages[0].messageId,
        uId: dmMsg.messages[0].uId,
        message: dmMsg.messages[0].message,
        timeSent: dmMsg.messages[0].timeSent,
        reacts: [],
        isPinned: dmMsg.messages[0].isPinned
      }]
    });
    expect(requestSearchV1(user1.token, 'Good Day!')).toStrictEqual({
      messageReturn: [{
        messageId: channelMsgs.messages[1].messageId,
        uId: channelMsgs.messages[1].uId,
        message: channelMsgs.messages[1].message,
        timeSent: channelMsgs.messages[1].timeSent,
        reacts: [],
        isPinned: channelMsgs.messages[1].isPinned
      },
      {
        messageId: channelMsgs.messages[2].messageId,
        uId: channelMsgs.messages[2].uId,
        message: channelMsgs.messages[2].message,
        timeSent: channelMsgs.messages[2].timeSent,
        reacts: [],
        isPinned: channelMsgs.messages[2].isPinned
      }]
    });
  });
  test('Failcases', () => {
    expect(requestSearchV1(user1.token + 3, 'Hi')).toStrictEqual(403);
    expect(requestSearchV1(user1.token, '')).toStrictEqual(400);
  });
});
