import {
  requestAuthRegisterV3, requestChannelsCreateV3, requestChannelInviteV3, requestUserStatsV1, requestUsersStatsV1, requestChannelLeaveV2,
  requestChannelJoinV3, requestDmCreateV2, requestDmLeaveV2, requestMessageRemoveV2, requestMessageSendV2, requestStandupSendV1, requestStandupStartV1,
  requestMessageSenddmV2, requestMessageSendlaterV1, requestMessageSendlaterdmV1, requestMessageShareV1, requestClear
} from './testHelpers';
import { convertToTimeStamp, wait } from '../src/other';
function checkTimeBetween(targetTime: number, time: number, offset = 5) {
  if (targetTime < time) {
    return false;
  } else if (targetTime > time + offset) {
    return false;
  }
  return true;
}
let startDate: number;
let user1: {token: string, authUserId: number};
let user2: {token: string, authUserId: number};
let user3: {token: string, authUserId: number};
let channel1: {channelId: number};
let channel2: {channelId: number};
let channel3: {channelId: number};
let channel1Date: number;
let channel2Date: number;
let channel3Date: number;
beforeEach(() => {
  requestClear();
  startDate = convertToTimeStamp(new Date());
  user1 = requestAuthRegisterV3('emailsadDSA@gmail.com', 'password1', 'User1', 'User1');
  user2 = requestAuthRegisterV3('emailASDSAD2@gmail.com', 'password2', 'User2', 'User2');
  user3 = requestAuthRegisterV3('email3ASDASDDAF@gmail.com', 'password3', 'User3', 'User3');
  channel1Date = convertToTimeStamp(new Date());
  channel1 = requestChannelsCreateV3(user1.token, 'channel1', true);
  channel2Date = convertToTimeStamp(new Date());
  channel2 = requestChannelsCreateV3(user2.token, 'channel2', true);
  channel3Date = convertToTimeStamp(new Date());
  channel3 = requestChannelsCreateV3(user3.token, 'channel3', true);
});
describe('channel timeline', () => {
  test('check channelCreate, channelJoin, channel invite, channelLeave, authregister', () => {
    const returnValue = requestUserStatsV1(user1.token);
    expect(returnValue).toStrictEqual({
      userStats: {
        channelsJoined: [{
          numChannelsJoined: 0,
          timeStamp: expect.any(Number)
        }, {
          numChannelsJoined: 1,
          timeStamp: expect.any(Number)
        }],
        dmsJoined: [{
          numDmsJoined: 0,
          timeStamp: expect.any(Number)
        }],
        messagesSent: [{
          numMessagesSent: 0,
          timeStamp: expect.any(Number)
        }],
        involvementRate: 1 / 3
      }
    });
    const date1 = convertToTimeStamp(new Date());
    expect(requestChannelInviteV3(user2.token, channel2.channelId, user1.authUserId)).toEqual({});
    const date2 = convertToTimeStamp(new Date());
    expect(requestChannelInviteV3(user3.token, channel3.channelId, user1.authUserId)).toStrictEqual({});
    const returnValue2 = requestUserStatsV1(user1.token);
    const userTimeLine = [{ numChannelsJoined: 0, timeStamp: startDate }, { numChannelsJoined: 1, timeStamp: channel1Date }, { numChannelsJoined: 2, timeStamp: date1 }, { numChannelsJoined: 3, timeStamp: date2 }];
    for (const [index, timePoint] of returnValue2.userStats.channelsJoined.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, userTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numChannelsJoined).toStrictEqual(userTimeLine[index].numChannelsJoined);
    }
    const usersTimeLine = [{ numChannelsExist: 0, timeStamp: startDate }, { numChannelsExist: 1, timeStamp: channel1Date }, { numChannelsExist: 2, timeStamp: channel2Date }, { numChannelsExist: 3, timeStamp: channel3Date }];
    const workSpaceState = requestUsersStatsV1(user1.token);
    expect(workSpaceState).toStrictEqual({
      workspaceStats: {
        channelsExist: expect.any(Array),
        dmsExist: expect.any(Array),
        messagesExist: expect.any(Array),
        utilizationRate: 1
      }
    });
    for (const [index, timePoint] of workSpaceState.workspaceStats.channelsExist.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, usersTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numChannelsExist).toStrictEqual(usersTimeLine[index].numChannelsExist);
    }
    expect(workSpaceState.workspaceStats.utilizationRate).toEqual(1);
    const date3 = convertToTimeStamp(new Date());
    userTimeLine.push({ numChannelsJoined: 2, timeStamp: date3 });
    expect(requestChannelLeaveV2(user1.token, channel2.channelId)).toStrictEqual({});
    const channel4Date = convertToTimeStamp(new Date());
    usersTimeLine.push({ numChannelsExist: 4, timeStamp: channel4Date });
    const channel4 = requestChannelsCreateV3(user3.token, 'channel4', true);
    const date4 = convertToTimeStamp(new Date());
    userTimeLine.push({ numChannelsJoined: 3, timeStamp: date4 });
    expect(requestChannelJoinV3(user1.token, channel4.channelId)).toStrictEqual({});
    const returnValue3 = requestUserStatsV1(user1.token);
    for (const [index, timePoint] of returnValue3.userStats.channelsJoined.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, userTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numChannelsJoined).toStrictEqual(userTimeLine[index].numChannelsJoined);
    }
    const workSpaceState2 = requestUsersStatsV1(user1.token);
    for (const [index, timePoint] of workSpaceState2.workspaceStats.channelsExist.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, usersTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numChannelsExist).toStrictEqual(usersTimeLine[index].numChannelsExist);
    }
  });
});

describe('dm timeline', () => {
  test('check dmCreate and dmremove and dmLeave', () => {
    const date1 = convertToTimeStamp(new Date());
    const dm1 = requestDmCreateV2(user1.token, [user2.authUserId, user3.authUserId]);
    expect(dm1).toEqual({ dmId: expect.any(Number) });
    const date2 = convertToTimeStamp(new Date());
    const dm2 = requestDmCreateV2(user2.token, [user1.authUserId, user3.authUserId]);
    expect(dm2).toEqual({ dmId: expect.any(Number) });
    const returnValue1 = requestUserStatsV1(user1.token);
    const userTimeLine = [{ numDmsJoined: 0, timeStamp: startDate }, { numDmsJoined: 1, timeStamp: date1 }, { numDmsJoined: 2, timeStamp: date2 }];
    for (const [index, timePoint] of returnValue1.userStats.dmsJoined.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, userTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numDmsJoined).toStrictEqual(userTimeLine[index].numDmsJoined);
    }
    const usersTimeLine = [{ numDmsExist: 0, timeStamp: startDate }, { numDmsExist: 1, timeStamp: date1 }, { numDmsExist: 2, timeStamp: date2 }];
    const workSpaceState = requestUsersStatsV1(user1.token);
    for (const [index, timePoint] of workSpaceState.workspaceStats.dmsExist.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, usersTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numDmsExist).toStrictEqual(usersTimeLine[index].numDmsExist);
    }
    expect(workSpaceState.workspaceStats.utilizationRate).toEqual(1);
    const dataLeave1 = convertToTimeStamp(new Date());
    userTimeLine.push({ numDmsJoined: 1, timeStamp: dataLeave1 });
    expect(requestDmLeaveV2(user1.token, dm2.dmId)).toStrictEqual({});
    const dm3Date = convertToTimeStamp(new Date());
    requestDmCreateV2(user3.token, [user1.authUserId, user2.authUserId]);
    userTimeLine.push({ numDmsJoined: 2, timeStamp: dm3Date });
    usersTimeLine.push({ numDmsExist: 3, timeStamp: dm3Date });
    const returnValue3 = requestUserStatsV1(user1.token);
    for (const [index, timePoint] of returnValue3.userStats.dmsJoined.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, userTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numDmsJoined).toStrictEqual(userTimeLine[index].numDmsJoined);
    }
    const workSpaceState2 = requestUsersStatsV1(user1.token);
    for (const [index, timePoint] of workSpaceState2.workspaceStats.dmsExist.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, usersTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numDmsExist).toStrictEqual(usersTimeLine[index].numDmsExist);
    }
  });
});
describe('message timeline', () => {
  test('check messageSend,messageRemove, messagesenddm,messageshare,messagesendlate,messagesendlaterdm,standupsend', () => {
    const usersTimeLine = [{ numMessagesExist: 0, timeStamp: startDate }];
    const userTimeLine = [{ numMessagesSent: 0, timeStamp: startDate }];
    userTimeLine.push({ numMessagesSent: 1, timeStamp: convertToTimeStamp(new Date()) });
    usersTimeLine.push({ numMessagesExist: 1, timeStamp: convertToTimeStamp(new Date()) });
    const messgae1 = requestMessageSendV2(user1.token, channel1.channelId, 'message1');
    usersTimeLine.push({ numMessagesExist: 2, timeStamp: convertToTimeStamp(new Date()) });
    requestMessageSendV2(user2.token, channel2.channelId, 'message2');
    userTimeLine.push({ numMessagesSent: 2, timeStamp: convertToTimeStamp(new Date()) });
    usersTimeLine.push({ numMessagesExist: 3, timeStamp: convertToTimeStamp(new Date()) });
    requestMessageSendV2(user3.token, channel3.channelId, 'message3');
    const returnValue1 = requestUserStatsV1(user1.token);
    const workspace = requestUsersStatsV1(user1.token);
    for (const [index, timePoint] of returnValue1.userStats.messagesSent.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, userTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numMessagesSent).toStrictEqual(userTimeLine[index].numMessagesSent);
    }
    for (const [index, timePoint] of workspace.workspaceStats.messagesExist.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, usersTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numMessagesExist).toStrictEqual(usersTimeLine[index].numMessagesExist);
    }
    const dm1 = requestDmCreateV2(user2.token, [user1.authUserId, user3.authUserId]);
    userTimeLine.push({ numMessagesSent: 3, timeStamp: convertToTimeStamp(new Date()) });
    usersTimeLine.push({ numMessagesExist: 4, timeStamp: convertToTimeStamp(new Date()) });
    requestMessageSenddmV2(user1.token, dm1.dmId, 'message2');
    userTimeLine.push({ numMessagesSent: 4, timeStamp: convertToTimeStamp(new Date()) });
    usersTimeLine.push({ numMessagesExist: 5, timeStamp: convertToTimeStamp(new Date()) });
    expect(requestChannelInviteV3(user2.token, channel2.channelId, user1.authUserId)).toStrictEqual({});
    expect(requestMessageShareV1(user1.token, messgae1.messageId, '', channel2.channelId, -1)).toStrictEqual({ sharedMessageId: expect.any(Number) });
    const returnValue2 = requestUserStatsV1(user1.token);
    for (const [index, timePoint] of returnValue2.userStats.messagesSent.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, userTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numMessagesSent).toStrictEqual(userTimeLine[index].numMessagesSent);
    }
    const workspace2 = requestUsersStatsV1(user1.token);
    for (const [index, timePoint] of workspace2.workspaceStats.messagesExist.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, usersTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numMessagesExist).toStrictEqual(usersTimeLine[index].numMessagesExist);
    }

    const startTime = new Date();
    startTime.setSeconds(startTime.getSeconds() + 2);
    requestStandupStartV1(user1.token, channel1.channelId, 2);
    requestStandupSendV1(user1.token, channel1.channelId, 'message3');
    wait(2);
    const endTime = Math.floor(startTime.getTime() / 1000);
    userTimeLine.push({ numMessagesSent: 5, timeStamp: endTime });
    usersTimeLine.push({ numMessagesExist: 6, timeStamp: endTime });

    const currentTime = new Date();
    currentTime.setSeconds(currentTime.getSeconds() + 2);
    const finishTime = Math.floor(currentTime.getTime() / 1000);
    userTimeLine.push({ numMessagesSent: 6, timeStamp: finishTime });
    usersTimeLine.push({ numMessagesExist: 7, timeStamp: finishTime });
    expect(requestMessageSendlaterV1(user1.token, channel1.channelId, 'message4', finishTime)).toStrictEqual({ messageId: expect.any(Number) });

    const currentTime2 = new Date();
    currentTime2.setSeconds(currentTime2.getSeconds() + 2);
    const finishTime2 = Math.floor(currentTime2.getTime() / 1000);
    userTimeLine.push({ numMessagesSent: 7, timeStamp: finishTime2 + 2 });
    usersTimeLine.push({ numMessagesExist: 8, timeStamp: finishTime2 + 2 });
    requestMessageSendlaterdmV1(user1.token, dm1.dmId, 'message5', finishTime2 + 2);
    wait(5);

    usersTimeLine.push({ numMessagesExist: 7, timeStamp: Math.floor(new Date().getTime() / 1000) });
    requestMessageRemoveV2(user1.token, messgae1.messageId);

    const returnValue3 = requestUserStatsV1(user1.token);
    for (const [index, timePoint] of returnValue3.userStats.messagesSent.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, userTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numMessagesSent).toStrictEqual(userTimeLine[index].numMessagesSent);
    }
    const workspace3 = requestUsersStatsV1(user1.token);
    for (const [index, timePoint] of workspace3.workspaceStats.messagesExist.entries()) {
      expect(checkTimeBetween(timePoint.timeStamp, usersTimeLine[index].timeStamp)).toEqual(true);
      expect(timePoint.numMessagesExist).toStrictEqual(usersTimeLine[index].numMessagesExist);
    }
  });
});

// describe('test for hangman', () => {
//   test('test 1', () => {
//     const user = requestAuthRegisterV3('kaifeng@gmail.com', '1234564332', 'kaifeng', 'mao')
//     const channel = requestChannelsCreateV3(user.token,'channel1',true)
//     const messageList = ['/hangman','']
//     expect(requestMessageSendV2(user.token,channel.channelId,'/hangman'))

//   })

// })
