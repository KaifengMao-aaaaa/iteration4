import { In } from 'typeorm';
import { Channel } from './entity/Channel';
import { Message, MessageType, Status } from './entity/Message';
import { Method, TimePointType } from './entity/TimePoint';
import { Token } from './entity/Tokens';
import { getUserByToken, updateUserTimeLine, usersDetail, getChannelById, getUserById, getHashOf } from './other';
import HTTPError from 'http-errors';

export async function channelJoinV3(token: string, channelId: number) {
  const user = await getUserByToken(token);
  const channel = await Channel.findOne({ where: { channelId } });
  if (!channel) {
    throw HTTPError(400, 'Invalid channelId!');
  } else if (!user) {
    throw HTTPError(403, 'Invalid Id!');
  }
  const channelMembers = channel.members.map(member => Number(member));
  if (channelMembers.includes(user.uId)) {
    throw HTTPError(400, 'Invalid Id!');
  } else if (!channel.isPublic && !channelMembers.includes(user.uId) && user.role !== 'Global owner') {
    throw HTTPError(403, 'cannot join!');
  }
  channel.members.push(user.uId);
  await channel.save();
  await updateUserTimeLine(user, TimePointType.CHANNEL, Method.INCREASE);
  return {};
}
export async function channelDetailsV3(token: string, channelId: number) {
  const channel = await Channel.findOne({ where: { channelId } });
  const user = await getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Invalid token!');
  }
  if (!channel) {
    throw HTTPError(400, 'Invalid channelId!');
  } else if (!channel.members.map(member => Number(member)).includes(user.uId)) {
    throw HTTPError(403, 'User is not a member of the channel!');
  }
  const ownersId = channel.owners.map(owner => Number(owner));
  const membersId = channel.members.map(member => Number(member));
  const owners = await usersDetail(ownersId);
  const members = await usersDetail(membersId);
  const result = {
    name: channel.name,
    isPublic: channel.isPublic,
    ownerMembers: owners,
    allMembers: members,
  };
  return result;
}
export async function addOwnerV2(token: string, channelId: number, uId: number) {
  const channel = await getChannelById(channelId);
  const user = await getUserById(uId);
  const token1 = await Token.findOne({ where: { token: getHashOf(token) }, relations: ['user'] });
  if (!channel || !user) {
    throw HTTPError(400, 'Invalid Id!');
  } else if (!token1) {
    throw HTTPError(403, 'Invalid token!');
  }
  const channelOwners = channel.owners.map(owner => Number(owner));
  const channelMembers = channel.members.map(member => Number(member));

  if (!channelOwners.includes(token1.user.uId) && token1.user.role !== 'Global Owner') {
    throw HTTPError(403, 'Does not have correct permissions!');
  } else if (channelOwners.includes(uId)) {
    throw HTTPError(400, 'User is already an owner in the channel!');
  } else if (!channelMembers.includes(uId)) {
    throw HTTPError(400, "User isn't a member of this channel!");
  }
  channel.owners.push(uId);
  await channel.save();
  return {};
}

export async function removeOwnerV2(token: string, channelId: number, uId: number) {
  const channel = await getChannelById(channelId);
  const user = await getUserById(uId);
  const token1 = await Token.findOne({ where: { token: getHashOf(token) }, relations: ['user'] });
  if (!channel || !user) {
    throw HTTPError(400, 'Invalid Id!');
  } else if (!token1) {
    throw HTTPError(403, 'Invalid token!');
  }

  const channelOwners = channel.owners.map(owner => Number(owner));
  const channelMembers = channel.members.map(member => Number(member));
  if (!channelOwners.includes(token1.user.uId) && token1.user.role !== 'Global Owner') {
    throw HTTPError(403, 'Does not have correct permissions!');
  } else if (channelOwners.length === 1) {
    throw HTTPError(400, 'User is the only owner of the channel!');
  } else if (!channelMembers.includes(uId)) {
    throw HTTPError(400, "User removing owner isn't a member of this channel!");
  } else if (!channelOwners.includes(uId)) {
    throw HTTPError(400, 'uId is not an owner of the channel!');
  }
  channel.owners.splice(channel.owners.indexOf(uId), 1);
  await channel.save();
  return {};
}

export async function channelMessagesV3(token: string, channelId: number, start: number) {
  const user = await getUserByToken(token);
  const channel = await getChannelById(channelId);
  let end = -1;
  if (!user) {
    throw HTTPError(403, 'invalid token');
  } else if (!channel) {
    throw HTTPError(400, 'channelId does not refer to a valid channel');
  }
  const channelMembers = channel.members.map(member => Number(member));
  if (channel.messages.length < start) {
    throw HTTPError(400, 'start is greater than the total number of messages in the channel');
  } else if (!channelMembers.includes(user.uId) && user.role !== 'Global Owner') {
    throw HTTPError(403, 'channelId is valid and the authorised user is not a member of the channel');
  }
  const channelMessages = await Message.find({
    where: {
      type: In([MessageType.CHANNEL, MessageType.SYSTEM]),
      channelId: channelId,
      status: Status.VALID
    },
    order: { messageId: 'DESC' },
    relations: ['user']
  });
  if (channelMessages.length > start + 50) {
    end = start + 50;
  }
  return {
    messages: channelMessages.map(message => {
      return {
        messageId: message.messageId,
        uId: message.user.uId,
        message: message.message,
        timeSent: message.time,
      };
    }),
    start,
    end: end
  };
}
/**
  * the function can invite a user to be member of a channel
  * @param {string} token - The email the user inputs to access their account, stored at the time of registration
  * @param {number} channelId- The password the user inputs to access their account, stored at the time of registration
  * @param {number} uId- The password the user inputs to access their account, stored at the time of registration
  * ...
  *
  * @returns {{}} - the function worl sucessfully
  * @returns {error} - token is invalid or channelId is invalid
*/

export async function channelInviteV3(token: string, channelId: number, uId: number) {
  const channel = await getChannelById(channelId);
  const targetUser = await getUserById(uId);
  const user = await getUserByToken(token);
  if (!channel) {
    throw HTTPError(400, 'invalid user or channel');
  } else if (!targetUser) {
    throw HTTPError(400, 'does not refer to a valid user');
  }
  const channelMembers = channel.members.map(member => Number(member));

  if (!user) {
    throw HTTPError(403, 'invalid token');
  } else if (channelMembers.includes(targetUser.uId)) {
    throw HTTPError(400, 'uId refers to a user who is already a member of the channel');
  } else if (!channelMembers.includes(user.uId) && user.role !== 'Global Owner') {
    throw HTTPError(403, 'the authorised user is not a member of the channel');
  }
  channel.members.push(targetUser.uId);
  await channel.save();
  await updateUserTimeLine(targetUser, TimePointType.CHANNEL, Method.INCREASE);
  return {};
}
/**
  * @param {string} token - active token of user
  * @param {number} channelId - the id of channel
  * ...
  * @returns {} - empty object since user should have been removed from the channel they were in
* @returns {error} - A error message that occurs based on whether the channelID or token is invalid, and whether the channel includes the user.
*/
export async function channelLeaveV2(token: string, channelId: number) {
  const user = await getUserByToken(token);
  const channel = await getChannelById(channelId);
  if (!user) {
    throw HTTPError(403, 'token is invalid');
  } else if (!channel) {
    throw HTTPError(400, 'channelId is invalid');
  }
  const channelMembers = channel.members.map(member => Number(member));

  if (!channelMembers.includes(user.uId)) {
    throw HTTPError(403, 'User is not a member of the channel');
  }
  if (channel.isActive && channel.standupStarter === user.uId) {
    throw HTTPError(400, 'User is the starter of an active standup in the channel');
  }
  channel.members.splice(channelMembers.indexOf(user.uId), 1);
  await channel.save();
  await updateUserTimeLine(user, TimePointType.CHANNEL, Method.DECREASE);
  return {};
}
