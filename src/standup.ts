import HTTPError from 'http-errors';
import { getUserByToken, getChannelById, updateUserTimeLine, updateWorkSpace } from './other';
import { Message, MessageType, Status } from './entity/Message';
import { Channel } from './entity/Channel';
import { Method, TimePointType } from './entity/TimePoint';
/**
  * the function start a standup period
  * @param {string} token - The email the user inputs to access their account, stored at the time of registration
  * @param {number} channelId- id of channel
  * @param {number} length- the length of standup
  * ...
  *
  * @returns {object{timeFinsh}} - the function work sucessfully
  * @returns {error} - token is invalid or channelId is invalid or length is negative
*/
export async function standupStartV1(token: string, channelId: number, length: number) {
  const user = await getUserByToken(token);
  const channel = await getChannelById(channelId);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  } else if (!channel) {
    throw HTTPError(400, 'invalid channelId');
  } else if (length < 0) {
    throw HTTPError(400, 'negative length');
  }
  const channelMembers = channel.members.map(member => Number(member));
  if (!channelMembers.includes(user.uId)) {
    throw HTTPError(403, 'wrong user');
  } else if (channel.isActive) {
    throw HTTPError(400);
  }
  setTimeout(sendHelper, length * 1000, token, channelId);
  const time = new Date();
  time.setSeconds(time.getSeconds() + length);
  const timeFinish = Math.floor(time.getTime() / 1000);
  channel.isActive = true;
  channel.timeFinish = timeFinish;
  channel.standupStarter = user.uId;
  await channel.save();
  return { timeFinish };
}
async function sendHelper(token: string, channelId: number) {
  const channel = await getChannelById(channelId);
  const user = await getUserByToken(token);
  if (channel && channel.standupBuffer.length !== 0) {
    const message = Message.create({
      type: MessageType.CHANNEL,
      message: convertGetupBufferToString(channel),
      time: channel.timeFinish,
      channelId: channelId,
      user,
      status: Status.VALID
    });
    await message.save();
    await updateUserTimeLine(user, TimePointType.MESSAGE, Method.INCREASE);
    await updateWorkSpace(TimePointType.MESSAGE, Method.INCREASE);
  }
  if (channel) {
    channel.isActive = false;
    channel.standupBuffer = [];
    channel.timeFinish = null;
    channel.standupStarter = null;
    await channel.save();
  }
}
function convertGetupBufferToString(channel: Channel) {
  const returnS = channel.standupBuffer.join('\n');
  return returnS;
}
/**
  * the function checkout whether a channel have aactive standup
  * @param {string} token - The email the user inputs to access their account, stored at the time of registration
  * @param {number} channelId- id of channel
  * ...
  *
  * @returns {object{timeFinsh, isActive}} - the function work sucessfully
  * @returns {error} - token is invalid or channelId is invalid or length is negative
*/
export async function standupActiveV1(token: string, channelId: number) {
  const user = await getUserByToken(token);
  const channel = await getChannelById(channelId);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  } else if (!channel) {
    throw HTTPError(400, 'invalid channelId');
  }
  const channelMembers = channel.members.map(member => Number(member));
  if (!channelMembers.includes(user.uId)) {
    throw HTTPError(403, 'wrong user');
  }
  return {
    isActive: channel.isActive,
    timeFinsh: channel.timeFinish
  };
}
/**
  * the function send a message to standup buffer
  * @param {string} token - The email the user inputs to access their account, stored at the time of registration
  * @param {number} channelId- id of channel
  * @param {string} message- message
  * ...
  *
  * @returns {{}} - the function work sucessfully
  * @returns {error} - token is invalid or channelId is invalid or length is negative
*/
export async function standupSendV1(token: string, channelId: number, message: string) {
  const user = await getUserByToken(token);
  const channel = await getChannelById(channelId);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  } else if (!channel) {
    throw HTTPError(400, 'invalid channelId');
  }
  const userMembers = channel.members.map(member => Number(member));
  if (!userMembers.includes(user.uId)) {
    throw HTTPError(403, 'wrong user');
  } else if (message.length > 1000) {
    throw HTTPError(400, 'long message');
  } else if (!channel.isActive) {
    throw HTTPError(400, 'inactive standup');
  }
  channel.standupBuffer.push(user.handleStr + ': ' + message);
  await channel.save();
  return {};
}
