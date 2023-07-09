import HTTPError from 'http-errors';
import { Token } from './entity/Tokens';
import { Channel } from './entity/Channel';
import { updateWorkSpace, updateUserTimeLine, getHashOf, convertToTimeStamp } from './other';
import { TimePointType, Method } from './entity/TimePoint';

/**
  * The channelsCreateV1 function creates a new channel. This will create a template of the channel and hence output raw data about the channel.
  *
  * @param {number} authUserId - The unique userId of the user creating the channel
  * @param {string} name - Name of the channel
  * @param {boolean} isPublic - Boolean variable describing whether the desired channel will be public or not
  *
  * @returns {number} - Returns the unique channelId for that channel.
  * @returns {error} - Returns an error if there is an error.}
*/
export async function channelsCreateV3(token: string, name: string, isPublic: boolean) {
  const userToken = await Token.findOne({ relations: ['user'], where: { token: getHashOf(token) } });
  if (!userToken) {
    throw HTTPError(403, 'token does not exist');
  } else if (typeof name !== 'string') {
    throw HTTPError(400, 'wrong type of name');
  } else if (name.length >= 20) {
    throw HTTPError(400, 'Name is too long');
  } else if (name.length < 1) {
    throw HTTPError(400, 'Name is too short');
  } else if (isPublic !== true && isPublic !== false) {
    throw HTTPError(400, 'isPublic is not defined as true or false');
  }
  const channelId = Number(String(Math.floor(Math.random() * 1000)) + String(Math.floor(Math.random() * 10000)));
  const channel = Channel.create({
    channelId,
    name,
    isPublic,
    owners: [userToken.user.uId],
    members: [userToken.user.uId],
    messages: [],
    standupBuffer: [],
    time: convertToTimeStamp(new Date()),
    checkTable: { hangmanStart: false, hangmanWord: undefined, word: undefined, stage: -1, leaveLetters: undefined }
  });
  await channel.save();
  await updateWorkSpace(TimePointType.CHANNEL, Method.INCREASE);
  await updateUserTimeLine(userToken.user, TimePointType.CHANNEL, Method.INCREASE);
  return { channelId };
}

/**
  * This function lists the channels a user is authorised to be a part of, returning the channelId and name
  *
  * @param {string} token - A string unique to the individual, helping with verifying them as a user and their current session
  * ...
  *
  * @returns {
*   Array<{
  *     channelId: number,
  *     name: string,
  *   }>
  * } - Returns an array which includes the unique channel Id, to verify the channel itself and its name
  * @returns {error} - Returns an error if the token does not refer to an existing user.
*/

// type channel = {
//   channelId: number,
//   name: string
// };

// type channels = {
//   channels?: Array<channel>
// };
export async function channelsListV3(token: string) {
  const usertoken = await Token.findOne({
    relations: ['user'], where: { token: getHashOf(token) }
  });
  if (!usertoken) {
    throw HTTPError(403, 'Given token is invalid');
  }
  const returnChannel = [];
  const channels = await Channel.find();
  for (const channel of channels) {
    const members = channel.members.map((member) => Number(member));
    if (members.includes(usertoken.user.uId)) {
      returnChannel.push({
        channelId: channel.channelId,
        name: channel.name
      });
    }
  }

  return { channels: returnChannel };
}

/**
  * <channelsListAllV1 allows a user to see all channels list>
  *
  * @param {Number} authUserId - the id of a user who wants to see all channels list
  * @param {Array} channels - an array of all channels, including private channels (and their associated details)
  * @returns {Array<{
  *     channelId: number,
  *       name: string,
  *   }>} - returns all possible channel arrays containing channelId and name
  * @returns {error} - returns an error if the authUserId does not refer to an existing user.
*/
// type channel = {
//   channelId: number,
//   name: string
// }
export async function channelsListAllV3(token: string) {
  const usertoken = await Token.findOne({
    relations: ['user'], where: { token: getHashOf(token) }
  });
  if (!usertoken) {
    throw HTTPError(403, 'Given token is invalid');
  }
  const channels = await Channel.find();
  const result = channels.map(channel => { return { channelId: channel.channelId, name: channel.name }; });
  return { channels: result };
}
