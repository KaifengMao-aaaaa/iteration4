import { In } from 'typeorm';
import { Dm } from './entity/Dm';
import { User } from './entity/User';
import { convertToTimeStamp, getUserById, getUserByToken, updateUserTimeLine, updateWorkSpace } from './other';
import HTTPError from 'http-errors';
import { Method, TimePointType } from './entity/TimePoint';
import { getDMById } from './other';
import { Message, MessageType, Status } from './entity/Message';

/**
  * <This function registers a datatype of dm into the datastore>
  * @param {string} token - The user token
  * @param {number[]} uIds - this is an array of uIds which are a number
  * ...
  * @returns { dmId: number } - this is the id of the dm, which is its own unique identifier
  * @returns {error} - returns an error
*/

export async function dmCreateV2(token: string, uIds: number[]) {
  const creator = await getUserByToken(token);
  if (!creator) {
    throw HTTPError(403, 'Invalid token');
  } else if (uIds.includes(creator.uId)) {
    throw HTTPError(400, 'Duplicate userIds');
  }
  const dmUserDetails = [];
  for (const id of uIds) {
    const dmUser = await User.findOne({ where: { uId: id } });
    if (!dmUser) {
      throw HTTPError(400, 'invalid users');
    }
    dmUserDetails.push(dmUser);
  }
  const newArray = [...uIds];
  newArray.push(creator.uId);
  const usersdetails = await User.find({ where: { uId: In(newArray) } });
  const newUIds = [];
  for (const userDetail of usersdetails) {
    newUIds.push(userDetail.handleStr);
  }
  newUIds.sort();
  const dmName = newUIds.join(', ');
  const dm = Dm.create({
    name: dmName,
    user: creator,
    allMembers: newArray,
    time: convertToTimeStamp(new Date())
  });
  await dm.save();
  await updateUserTimeLine(creator, TimePointType.DM, Method.INCREASE);
  for (const userDetail of dmUserDetails) {
    await updateUserTimeLine(userDetail, TimePointType.DM, Method.INCREASE);
  }
  await updateWorkSpace(TimePointType.DM, Method.INCREASE);
  const result = await Dm.find({ order: { dmId: 'DESC' }, take: 1 });
  return { dmId: result[0].dmId };
}
/**
  * <dmListV2 return list of dms with their dmId and name>
  *
  * @param {string} token - token of user
  * ...
  *
  * @returns {dms: { dmId: number, name: string }[]} - return a array object with dmId and name
  * @returns {error} - returns an error if token is invalid
*/

export async function dmListV2(token: string) {
  const user = await getUserByToken(token);
  const dms = [];
  if (!user) {
    throw HTTPError(403, 'Invalid token!');
  }
  const allDms = await Dm.find();
  for (const dm of allDms) {
    const dmMembers = dm.allMembers.map(member => Number(member));
    if (dmMembers.includes(user.uId)) {
      dms.push({
        dmId: dm.dmId,
        name: dm.name
      });
    }
  }
  return { dms };
}
/**
  * <dmRemoveV2 require dmId and let the original DM creator delete the dm>
  *
  * @param {string} token - token of user
  * @param {number} dmId - id of dm
  * ...
  *
  * @returns {} - return null
  * @returns {error} - returns an error if:
  *  token is invalid
  *  dmId does not refer to a valid DM
  *  the authorised user is not the original DM creator
  *  the authorised user is no longer in the DM
*/

export async function dmRemoveV2(token: string, dmId: number) {
  const user = await getUserByToken(token);
  const dm = await getDMById(dmId);
  if (!dm) {
    throw HTTPError(400, 'dmId does not refer to a valid DM!');
  }
  const dmMembers = dm.allMembers.map(member => Number(member));
  if (!user) {
    throw HTTPError(403, 'Invalid token!');
  } else if (!(dm.user.uId === user.uId)) {
    throw HTTPError(403, 'The authorised user is not the original DM creator!');
  } else if (!dmMembers.includes(user.uId)) {
    throw HTTPError(403, 'The authorised user is no longer in the DM!');
  } else {
    for (const id of dmMembers) {
      const updateUser = await User.findOne({ where: { uId: id } });
      await updateUserTimeLine(updateUser, TimePointType.DM, Method.DECREASE);
    }
    await updateWorkSpace(TimePointType.DM, Method.DECREASE);
    await Dm.delete({ dmId });
  }
  return {};
}
/**
  * <This function makes the user leave the associated dm>
  * @param {string} token - The user token
  * @param {number} dmId - this is the id of the dm that the user is attempting to leave
  * ...
  * @returns {} - This means that the user has successfully left the associated dm
  * @returns {error} - returns an error
*/
export async function dmLeaveV2(token: string, dmId: number) {
  const user = await getUserByToken(token);
  const dm = await getDMById(dmId);
  if (!user) {
    throw HTTPError(403, 'invalid token');
  }
  if (!dm) {
    throw HTTPError(400, 'Input is invalid!');
  }
  const dmMembers = dm.allMembers.map(member => Number(member));
  if (dmMembers.includes(user.uId)) {
    dm.allMembers.splice(dmMembers.indexOf(user.uId), 1);
    await dm.save();
    await updateUserTimeLine(user, TimePointType.DM, Method.DECREASE);
  } else {
    throw HTTPError(403, 'User is Not a member of DM');
  }
  return {};
}
/**
  @returns {messages: messages[], start: number, end: number} - return:
  *  messages: object array with up to 50 messages with their details in the dm from start index
  *  start: start index which the user wants to see messages from
  *  end: end index which is start index + 50 or -1 if there are no more than 50 messages in the dm
  * @returns {error} - returns an error if:
  *  token is invalid
  *  dmId does not refer to a valid DM
  *  start is greater than the total number of messages in the channel or no messages in the channel
  *  the authorised user is not a member of the DM
**/

export async function dmMessagesV2(token: string, dmId: number, start: number) {
  const user = await getUserByToken(token);
  const dm = await getDMById(dmId);
  if (!dm) {
    throw HTTPError(400, 'dmId does not refer to a valid DM!');
  } else if (!user) {
    throw HTTPError(403, 'Invalid token!');
  }
  const dmMembers = dm.allMembers.map(member => Number(member));
  const allMessages = await Message.find({ where: { type: MessageType.DM, dmId, status: Status.VALID }, relations: ['user'] });
  if (start > allMessages.length) {
    throw HTTPError(400, 'start is greater than the total number of messages in the dm!');
  } else if (!dmMembers.includes(user.uId)) {
    throw HTTPError(403, 'The authorised user is not a member of the DM!');
  } else if (allMessages.length > (start + 50)) {
    return {
      messages: allMessages.map(message => {
        return {
          messageId: message.messageId,
          timeSent: message.time,
          uId: message.user.uId,
          message: message.message
        };
      }),
      start: start,
      end: start + 50,
    };
  } else {
    return {
      messages: allMessages.map(message => {
        return {
          messageId: message.messageId,
          timeSent: message.time,
          uId: message.user.uId,
          message: message.message
        };
      }),
      start: start,
      end: -1,
    };
  }
}
/**
  * <dmDetailsV2 require dmId and let the user check the dm name and the members' details in the dm>
  *
  * @param {string} token - token of user
  * @param {number} dmId - id of dm
  * ...
  *
  * @returns {name: string, members: userDetails[]} - return name of dm and the array of objects includes members' details
  * @returns {error} - returns an error if:
  *  token is invalid
  *  dmId does not refer to a valid DM
  *  the authorised user is not a member of the DM
*/

export async function dmDetailsV2(token: string, dmId: number) {
  const user = await getUserByToken(token);
  if (!user) {
    throw HTTPError(403, 'dmId does not refer to a valid DM!');
  }
  const dm = await getDMById(dmId);
  const members = [];
  if (!dm) {
    throw HTTPError(400, 'dmId does not refer to a valid DM!');
  }

  const dmMembers = dm.allMembers.map(member => Number(member));
  if (!dmMembers.includes(user.uId)) {
    throw HTTPError(403, 'The authorised user is not a member of the DM!');
  } else {
    for (const id of dm.allMembers) {
      const member = await getUserById(id);
      members.push({
        uId: member.uId,
        email: user.email,
        nameFirst: user.nameFirst,
        nameLast: user.nameLast,
        handleStr: user.handleStr,
      });
    }
  }
  return {
    name: dm.name,
    members: members,
  };
}
