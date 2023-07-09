import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { User } from './entity/User';
import { TimePoint, Method, TimePointType } from './entity/TimePoint';
import { WorkSpacePoint } from './entity/WorkSpacePoint';
import { Token } from './entity/Tokens';
import { Channel } from './entity/Channel';
import { Message } from './entity/Message';
import { Dm } from './entity/Dm';

export async function getUserById(authUserId: number) {
  return await User.findOne({
    where: {
      uId: authUserId
    }
  });
}
export async function usersDetail(ids: number[]) {
  const returnUsers = [];
  for (const id of ids) {
    const user = await User.findOne({ where: { uId: id } });
    returnUsers.push({
      nameFirst: user.nameFirst,
      nameLast: user.nameLast,
      uId: user.uId,
      email: user.email,
      handleStr: user.handleStr
    });
  }
  return returnUsers;
}
export async function getChannelById(channelId: number) {
  return await Channel.findOne({ where: { channelId } });
}
export async function getUserByToken(token:string) {
  const usertoken = await Token.findOne({
    relations: ['user'], where: { token: getHashOf(token) }
  });
  if (!usertoken) {
    return undefined;
  }
  const target = usertoken.user;
  return target;
}

export async function getDMById(dmId: number) {
  return await Dm.findOne({ where: { dmId }, relations: ['user'] });
}

export async function getMessageById(messageId: number): Promise<Message> {
  const message = await Message.findOne({ where: { messageId }, relations: ['user'] });
  return message;
}

export function getHashOf(plaintext: string) {
  return crypto.createHash('sha256').update(plaintext).digest('hex');
}

export function wait(waitTime: number) {
  const time = new Date();
  time.setSeconds(time.getSeconds() + waitTime);
  let curTime = new Date();
  while (time > curTime) {
    curTime = new Date();
  }
}

export async function initWorkSpace() {
  const channelFirstPoint = WorkSpacePoint.create({
    num: 0,
    time: convertToTimeStamp(new Date()),
    type: TimePointType.CHANNEL,
    method: Method.INIT,
  });
  await channelFirstPoint.save();
  const dmFirstPoint = WorkSpacePoint.create({
    num: 0,
    type: TimePointType.DM,
    time: convertToTimeStamp(new Date()),
    method: Method.INIT,
  });
  await dmFirstPoint.save();
  const messageFirstPoint = WorkSpacePoint.create({
    num: 0,
    type: TimePointType.MESSAGE,
    method: Method.INIT,
    time: convertToTimeStamp(new Date())
  });
  messageFirstPoint.save();
  const UserFirstPoint = WorkSpacePoint.create({
    num: 0,
    type: TimePointType.USER,
    time: convertToTimeStamp(new Date()),
    method: Method.INIT,
  });
  await UserFirstPoint.save();
}

export async function addToken(user: User): Promise<string> {
  const newtoken = uuidv4();
  const newToken = Token.create({
    token: getHashOf(newtoken),
    user
  });
  await newToken.save();
  return newtoken;
}

export async function initUserTimeLine(user: User) {
  const channelFirstPoint = TimePoint.create({
    num: 0,
    type: TimePointType.CHANNEL,
    method: Method.INIT,
    time: convertToTimeStamp(new Date()),
    user
  });
  await channelFirstPoint.save();
  const dmFirstPoint = TimePoint.create({
    num: 0,
    type: TimePointType.DM,
    method: Method.INIT,
    user,
    time: convertToTimeStamp(new Date())
  });
  await dmFirstPoint.save();
  const messageFirstPoint = TimePoint.create({
    num: 0,
    type: TimePointType.MESSAGE,
    time: convertToTimeStamp(new Date()),
    method: Method.INIT,
    user
  });
  await messageFirstPoint.save();
}

export async function updateUserTimeLine(user: User, type: TimePointType, method: Method) {
  const lastPoint = await TimePoint.find({
    order: {
      pointId: 'DESC'
    },
    take: 1,
    where: { user: { uId: user.uId }, type }
  });
  let num = lastPoint[0].num;
  if (method === Method.DECREASE) {
    num -= 1;
  } else if (method === Method.INCREASE) {
    num += 1;
  }
  const updatePoint = TimePoint.create({
    type, method, num, user, time: convertToTimeStamp(new Date())
  });
  await updatePoint.save();
}
export async function updateWorkSpace(type: TimePointType, method: Method) {
  const lastPoint = await WorkSpacePoint.findOne({
    order: {
      pointId: 'DESC'
    },
    where: {
      type: type
    }
  });
  let num;
  if (!lastPoint) {
    num = 0;
  } else {
    num = lastPoint.num;
  }
  if (method === Method.DECREASE) {
    num -= 1;
  } else if (method === Method.INCREASE) {
    num += 1;
  }
  const updatePoint = WorkSpacePoint.create({
    type, method, num, time: convertToTimeStamp(new Date())
  });
  await updatePoint.save();
}
export function convertToTimeStamp(date: Date) {
  return Math.floor(date.getTime() / 1000);
}
