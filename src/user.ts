import { TimePoint, TimePointType } from './entity/TimePoint';
import HTTPError from 'http-errors';
import { getUserByToken, getUserById } from './other';
import { WorkSpacePoint } from './entity/WorkSpacePoint';
import { Channel } from './entity/Channel';
import { Dm } from './entity/Dm';
import * as EmailValidator from 'email-validator';
import { User } from './entity/User';
export async function userStatsV1(token: string) {
  const user = await getUserByToken(token);
  if (!user) {
    HTTPError(403, 'invalid token');
  }
  const userChannelTimePoint = await TimePoint.find({ where: { user: { uId: user.uId }, type: TimePointType.CHANNEL } });
  const userDmTimePoint = await TimePoint.find({ where: { user: { uId: user.uId }, type: TimePointType.DM } });
  const userMessageTimePoint = await TimePoint.find({ where: { user: { uId: user.uId }, type: TimePointType.MESSAGE } });
  const lastChannelPoint = await WorkSpacePoint.find({ where: { type: TimePointType.CHANNEL }, order: { pointId: 'DESC' }, take: 1 });
  const TotalChannel = lastChannelPoint[0].num;
  const lastDmPoint = await WorkSpacePoint.find({ where: { type: TimePointType.DM }, order: { pointId: 'DESC' }, take: 1 });
  const TotalDm = lastDmPoint[0].num;
  const lasMessagePoint = await WorkSpacePoint.find({ where: { type: TimePointType.MESSAGE }, order: { pointId: 'DESC' }, take: 1 });
  const TotalMessage = lasMessagePoint[0].num;
  const numAllJoinedOrSent = userChannelTimePoint[userChannelTimePoint.length - 1].num + userDmTimePoint[userDmTimePoint.length - 1].num + userMessageTimePoint.length - 1;
  const numExisted = TotalDm + TotalChannel + TotalMessage;
  return {
    userStats: {
      channelsJoined: userChannelTimePoint.map(point => { return { timeStamp: point.time, numChannelsJoined: point.num }; }),
      dmsJoined: userDmTimePoint.map(point => { return { timeStamp: point.time, numDmsJoined: point.num }; }),
      messagesSent: userMessageTimePoint.map(point => { return { timeStamp: point.time, numMessagesSent: point.num }; }),
      involvementRate: numAllJoinedOrSent / numExisted
    }
  };
}
export async function userProfileV3(token: string, uId: number) {
  const user = await getUserByToken(token);
  const target = await getUserById(uId);
  if (!target) {
    throw HTTPError(400, 'uld does not exist!');
  } else if (!user) {
    throw HTTPError(403, 'Invalid token!');
  }
  return {
    user: {
      uId: uId,
      email: target.email,
      nameFirst: target.nameFirst,
      nameLast: target.nameLast,
      handleStr: target.handleStr
    }
  };
}
export async function usersStatsV1(token: string) {
  const user = await getUserByToken(token);
  if (!user) {
    HTTPError(403, 'invalid token');
  }

  const totalChannel = await WorkSpacePoint.find({ where: { type: TimePointType.CHANNEL } });
  const totalDm = await WorkSpacePoint.find({ where: { type: TimePointType.DM } });
  const totalMessage = await WorkSpacePoint.find({ where: { type: TimePointType.MESSAGE } });
  const allUsers = await User.find();
  const allChannels = await Channel.find();
  const allDms = await Dm.find({ select: { dmId: true }, relations: ['user'] });
  let allChannelsUsersArray = [];
  let allDmsUserArray = [];
  if (allChannels.length !== 0) {
    allChannelsUsersArray = allChannels.reduce((totalArray, channel) => {
      const usersList = channel.members.map(member => Number(member));
      return totalArray.concat(usersList);
    }, []);
  }
  if (allDms.length !== 0) {
    allDmsUserArray = allDms.reduce((totalUsersList, dm) => {
      return totalUsersList.concat(dm.user.uId);
    }, []);
  }
  const usersInLeastOneChannelOrDm = Array.from(new Set(allDmsUserArray.concat(allChannelsUsersArray)));

  const utilsUser = usersInLeastOneChannelOrDm.length / allUsers.length;
  return {
    workspaceStats: {
      channelsExist: totalChannel.map(point => { return { numChannelsExist: point.num, timeStamp: point.time }; }),
      dmsExist: totalDm.map(point => { return { numDmsExist: point.num, timeStamp: point.time }; }),
      messagesExist: totalMessage.map(point => { return { numMessagesExist: point.num, timeStamp: point.time }; }),
      utilizationRate: utilsUser
    }
  };
}

/**
  * This function sets a new email.
  *
  * @param {string} token - the token of user
  * @param {string} email - the id of channel
  * ...
  * @returns {} - empty
  * @returns {error} - An error message that occurs based on whether the email or token is invalid.
*/
export async function setEmailV2(token: string, email: string) {
  const user = await getUserByToken(token);
  const userWithThisEmail = await User.findOne({ where: { email } });
  if (userWithThisEmail) {
    throw HTTPError(400, 'email already exists');
  } else if (EmailValidator.validate(email) === false) {
    throw HTTPError(400, 'Invalid Email');
  } else if (!user) {
    throw HTTPError(403, "Token doesn't exist!");
  }
  user.email = email;
  await user.save();
  return {};
}

/**
  * This function sets a new handle string for a certain user
  *
  * @param {string} token - A string unique to the individual, helping with verifying them as a user and their current session
  * @param {string} handleStr - A string unique to the individual, from when they register
  * ...
  *
  * @returns {} - empty object if correctly changed
  * @returns {error} - A error message that occurs based on the length or what is inside of the handleStr, if token is invalid or not
*/
export async function setHandleV2(token: string, handleStr: string) {
  const user = await getUserByToken(token);
  const userWithThisHandle = await User.findOne({ where: { handleStr } });

  if (!user) {
    throw HTTPError(403, 'Given token is invalid');
  }
  if (userWithThisHandle) {
    throw HTTPError(400, 'Handle is already used by another user');
  }
  if (!/^[a-zA-Z0-9]+$/.test(handleStr)) {
    throw HTTPError(400, 'Handle can only contain alphanumeric characters');
  }

  if (handleStr.length < 3 || handleStr.length > 20) {
    throw HTTPError(400, 'Handle must be between 3 and 20 characters long');
  }
  user.handleStr = handleStr;
  await user.save();
  return {};
}

/**
  * This function returns a list of all users and their details
  *
  * @param {string} token - A string unique to the individual, helping with verifying them as a user and their current session
  * ...
  *
  * @returns {
*   Array<{
  *     uId: number,
  *      email: string,
  *     nameFirst: string,
   *     nameLast: string,
   *     handleStr: string
  *   }>
  * } - Returns an array which includes the unique user Id, to verify the user and their details
 * @returns {error} - Returns an error if the token does not refer to an existing user.
*/
export async function usersAllV2(token: string) {
  const user = await getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Given token is invalid');
  }
  const users = [];
  const allUsers = await User.find();
  for (const user of allUsers) {
    users.push({
      uId: user.uId,
      email: user.email,
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      handleStr: user.handleStr
    });
  }
  return { users };
}

/**
  * <Changes the users name>
  * @param {string} token - The user token
  * @param {string} nameFirst - first name of the user
  * @param {string} nameLast - last name of the user
  * ...
  * @returns {} - this means that the user has successfully changed their name
  * @returns {error} - returns an error
*/

export async function userSetNameV2(token: string, nameFirst: string, nameLast: string) {
  const user = await getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'Given token is invalid');
  } else if (nameFirst.length > 50 || nameLast.length > 50) {
    throw HTTPError(400, 'Name Too long');
  } else if (nameFirst.length < 1 || nameLast.length < 1) {
    throw HTTPError(400, 'Name too Short');
  }
  user.nameFirst = nameFirst;
  user.nameLast = nameLast;
  await user.save();
  return {};
}
