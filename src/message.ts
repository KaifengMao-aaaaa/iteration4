import { Message, MessageType, Status } from './entity/Message';
import { getDMById, getChannelById, getUserByToken, updateUserTimeLine, updateWorkSpace, convertToTimeStamp, getMessageById } from './other';
import HTTPError from 'http-errors';
import { Method, TimePointType } from './entity/TimePoint';
import { Channel } from './entity/Channel';
import { User } from './entity/User';
import { checkHangman } from './hangmanlib';
export async function messageEditV2(token: string, messageId: number, message: string) {
  const user = await getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }
  const editMessage = await getMessageById(messageId);
  if (!editMessage) {
    throw HTTPError(400, 'no exist message');
  }
  const channel = await Channel.findOne({ where: { channelId: editMessage.channelId } });
  const channelMembers = channel.members.map(member => Number(member));
  const channelowners = channel.owners.map(owner => Number(owner));
  if (!channel) {
    throw HTTPError(400, 'invalid messageId');
  } else if (!channelMembers.includes(user.uId) && user.role !== 'Global Owner') {
    throw HTTPError(403, 'messageId does not refer to a valid message within a channel/DM that the authorised user has joined');
  } else if (message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  } else if (user.uId !== editMessage.user.uId && user.role !== 'Global Owner' && !channelowners.includes(user.uId)) {
    throw HTTPError(403, 'not authorised user');
  }
  if (message.length === 0) {
    editMessage.status = Status.INVALID;
  } else {
    editMessage.message = message;
  }
  await editMessage.save();
  return {};
}

export async function messageSendV2(token: string, channelId: number, message: string) {
  const user = await getUserByToken(token);
  const channel = await getChannelById(channelId);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  } else if (!channel) {
    throw HTTPError(403, 'invalid channelId');
  } else if (message.length > 1000 || message.length === 0) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  }
  const channelMembers = channel.members.map(member => Number(member));

  if (!channelMembers.includes(user.uId)) {
    throw HTTPError(403, 'the member is not belong the channel');
  }
  const messageObject = Message.create({
    type: MessageType.CHANNEL,
    status: Status.VALID,
    channelId: channelId,
    user,
    message,
    time: convertToTimeStamp(new Date())
  });
  await messageObject.save();
  await checkHangman(message, channel);
  await updateUserTimeLine(user, TimePointType.MESSAGE, Method.INCREASE);
  await updateWorkSpace(TimePointType.MESSAGE, Method.INCREASE);
  return { messageId: messageObject.messageId };
}
/**
  * the function remove one meesage from one channel
  * @param {string} token - The email the user inputs to access their account, stored at the time of registration
  * @param {number} messageId- id of message
  * ...
  *
  * @returns {{}} - the function work sucessfully
  * @returns {error} - token is invalid or messageId is invalid
*/
export async function messageRemoveV2(token: string, messageId: number) {
  const user = await getUserByToken(token);
  const removeMessage = await getMessageById(messageId);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  } else if (!removeMessage) {
    throw HTTPError(400, 'no this message');
  }
  const channel = await getChannelById(removeMessage.channelId);
  const channelowners = channel.owners.map(owner => Number(owner));
  if (removeMessage.user.uId !== user.uId && !channelowners.includes(user.uId)) {
    throw HTTPError(403, 'cannot do it');
  }
  removeMessage.status = Status.INVALID;
  await updateWorkSpace(TimePointType.MESSAGE, Method.DECREASE);
  await removeMessage.save();
  return {};
}
/**
  * <messageSenddmV2 require dmId and message to send a message to dm and return messageId>
  *
  * @param {string} token - token of user
  * @param {number} dmId - id of dm you want to send to
  * @param {string} message - message you want to send
  * ...
  *
  * @returns {messageId: number} - return a unique messageId
  * @returns {error} - returns an error if:
  *  token is invalid
  *  dmId is invalid
  *  length of message is less than 1 or over 1000 characters
  *  the authorised user is not a member of the DM.
*/
export async function messageSenddmV2(token: string, dmId: number, message: string) {
  const user = await getUserByToken(token);
  const dm = await getDMById(dmId);
  if (!dm) {
    throw HTTPError(400, 'dmId does not refer to a valid DM!');
  } else if (!user) {
    throw HTTPError(403, 'Invalid token!');
  }
  const dmMembers = dm.allMembers.map(member => Number(member));
  if (message.length < 1 || message.length > 1000) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters!');
  } else if (!dmMembers.includes(user.uId)) {
    throw HTTPError(403, 'The authorised user is not a member of the DM!');
  }
  const messageObject = Message.create({
    type: MessageType.DM,
    message,
    time: convertToTimeStamp(new Date()),
    dmId,
    user,
    status: Status.VALID
  });
  await messageObject.save();

  await updateUserTimeLine(user, TimePointType.MESSAGE, Method.INCREASE);
  await updateWorkSpace(TimePointType.MESSAGE, Method.INCREASE);
  const result = await Message.find({
    order: { messageId: 'DESC' },
    take: 1
  });
  return { messageId: result[0].messageId };
}
/**
  * <messageShareV1 require ogMessageId and message, channelId or dmId to share a message to dm or channel and return sharedMessageId>
  *
  * @param {string} token - token of user
  * @param {number} ogMessageId - id of message you want to share
  * @param {string} message - message you want to send
  * @param {number} dmId - id of dm you want to share to or will be -1 if user wants to share to a channel
  * @param {number} channelId - id of channel you want to share to or will be -1 if user wants to share to a dm
  * ...
  *
  * @returns {sharedMessageId: number} - return a unique sharedMessageId
  * @returns {error} - returns an error if:
  *  token is invalid
  *  both channelId and dmId are invalid
  *  neither channelId nor dmId are -1
  *  ogMessageId does not refer to a valid message
  *  length of message is over 1000 characters
  *  the authorised user is not a member of the DM or channel
*/
export async function messageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  const user = await getUserByToken(token);
  const channel = await getChannelById(channelId);
  const dm = await getDMById(dmId);
  const ogMessage = await Message.findOne({ where: { messageId: ogMessageId } });
  if (!user) {
    throw HTTPError(403, 'invalid token');
  } else if (!channel && !dm) {
    throw HTTPError(400, 'both channelId and dmId are invalid');
  } else if (channelId !== -1 && dmId !== -1) {
    throw HTTPError(400, 'neither channelId nor dmId are -1');
  } else if (!ogMessage) {
    throw HTTPError(400, 'ogMessageId does not refer to a valid message');
  } else if (message.length > 1000) {
    throw HTTPError(400, 'length of optional message is more than 1000 characters');
  }
  let newMessage;
  if (ogMessage.channelId) {
    newMessage = ogMessage.message + '|' + message;
  } else {
    newMessage = ogMessage.message + '|' + message;
  }
  if (channelId === -1) {
    const dmMembers = dm.allMembers.map(member => Number(member));
    if (!dmMembers.includes(user.uId)) {
      throw HTTPError(403, 'the authorised user has not joined the DM they are trying to share the message to');
    }
    const shareMessage = Message.create({
      message: newMessage,
      user,
      time: convertToTimeStamp(new Date()),
      type: MessageType.DM,
      status: Status.VALID,
      dmId: dmId
    });
    await shareMessage.save();
  } else {
    const channelMembers = channel.members.map(member => Number(member));
    if (!channelMembers.includes(user.uId)) {
      throw HTTPError(403, 'the authorised user has not joined the channel they are trying to share the message to');
    }
    const shareMessage = Message.create({
      message: newMessage,
      user,
      time: convertToTimeStamp(new Date()),
      type: MessageType.CHANNEL,
      status: Status.VALID,
      dmId: channelId
    });
    await shareMessage.save();
  }
  await updateUserTimeLine(user, TimePointType.MESSAGE, Method.INCREASE);
  await updateWorkSpace(TimePointType.MESSAGE, Method.INCREASE);
  const share = await Message.find({ order: { messageId: 'DESC' }, take: 1 });
  return { sharedMessageId: share[0].messageId };
}
/**
  * <messageSendlaterV1 require channelId, message and timeSent to send a message to channel in a future time and return messageId>
  *
  * @param {string} token - token of user
  * @param {number} channelId - id of channel you want to send to
  * @param {string} message - message you want to send
  * @param {number} timeSent - the time you want the message to be sent
  * ...
  *
  * @returns {messageId: number} - return a unique messageId
  * @returns {error} - returns an error if:
  *  token is invalid
  *  channelId is invalid
  *  length of message is less than 1 or over 1000 characters
  *  timeSent is a time in the past
  *  the authorised user is not a member of the channel.
*/
export async function messageSendlaterV1(token: string, channelId: number, message: string, timeSent: number) {
  const user = await getUserByToken(token);
  const channel = await getChannelById(channelId);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  } else if (!channel) {
    throw HTTPError(400, 'invalid channelId');
  } else if (message.length > 1000 || message.length === 0) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  } else if (timeSent < Math.floor((new Date()).getTime() / 1000)) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }
  const channelMembers = channel.members.map(member => Number(member));
  if (!channelMembers.includes(user.uId)) {
    throw HTTPError(403, 'the authorised user is not a member of the channel');
  }
  const messageObject = Message.create({
    message: message,
    type: MessageType.CHANNEL,
    time: timeSent,
    status: Status.RUNNING,
    channelId,
    user
  });
  await messageObject.save();
  const expect = await Message.find({ order: { messageId: 'DESC' }, take: 1 });
  setTimeout(sendHelper, (timeSent - Math.floor((new Date()).getTime() / 1000)) * 1000, user, expect[0].messageId);
  return { messageId: expect[0].messageId };
}
async function sendHelper(user: User, messageId: number) {
  const message = await Message.findOne({ where: { messageId } });
  message.status = Status.VALID;
  await message.save();
  await updateUserTimeLine(user, TimePointType.MESSAGE, Method.INCREASE);
  await updateWorkSpace(TimePointType.MESSAGE, Method.INCREASE);
}
/**
  * <messageSendlaterdmV1 require dmId, message and timeSent to send a message to dm in a future time and return messageId>
  *
  * @param {string} token - token of user
  * @param {number} dmId - id of dm you want to send to
  * @param {string} message - message you want to send
  * @param {number} timeSent - the time you want the message to be sent
  * ...
  *
  * @returns {messageId: number} - return a unique messageId
  * @returns {error} - returns an error if:
  *  token is invalid
  *  dmId is invalid
  *  length of message is less than 1 or over 1000 characters
  *  timeSent is a time in the past
  *  the authorised user is not a member of the dm.
*/
export async function messageSendlaterdmV1(token: string, dmId: number, message: string, timeSent: number) {
  const user = await getUserByToken(token);
  const dm = await getDMById(dmId);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  } else if (!dm) {
    throw HTTPError(400, 'invalid dmId');
  } else if (message.length > 1000 || message.length === 0) {
    throw HTTPError(400, 'length of message is less than 1 or over 1000 characters');
  } else if (timeSent < Math.floor((new Date()).getTime() / 1000)) {
    throw HTTPError(400, 'timeSent is a time in the past');
  }
  const dmMembers = dm.allMembers.map(member => Number(member));
  if (!dmMembers.includes(user.uId)) {
    throw HTTPError(403, 'the authorised user is not a member of the dm');
  }
  const messageObject = Message.create({
    message: message,
    type: MessageType.DM,
    time: timeSent,
    status: Status.RUNNING,
    dmId,
    user
  });
  await messageObject.save();
  const expect = await Message.find({ order: { messageId: 'DESC' }, take: 1 });

  setTimeout(sendHelper, (timeSent - Math.floor((new Date()).getTime() / 1000)) * 1000, user, expect[0].messageId);
  return { messageId: expect[0].messageId };
}
