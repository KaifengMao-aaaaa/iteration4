import { User } from './entity/User';
import { initUserTimeLine, updateWorkSpace, addToken, getHashOf, initWorkSpace } from './other';
import HTTPError from 'http-errors';
import * as EmailValidator from 'email-validator';
import { Method, TimePointType } from './entity/TimePoint';
import { Token } from './entity/Tokens';
/**

  *This function checks if the email and password that are given, are actual details of a user in the database, if true
  * then their authenticated unique user Id (authUserId) is returned, enabling them to access their channels, if false
  * then an error will occur.
  *
  * @param {string} email - The email the user inputs to access their account, stored at the time of registration
  * @param {string} password - The password the user inputs to access their account, stored at the time of registration
  * ...
  *
  * @returns {number} authUserId - An authenticated integer that is the user's unique Id
  * @returns {string} token - A token produced that is unique to each session (when they login or register)
  * @returns {error} error - An error message indicating wrong token when trying to logout.
**/

export async function authLoginV3(token: string, email: string, password: string) {
  if (!await Token.findOne({ where: { token: getHashOf(token) } })) {
    throw HTTPError(403, 'invalid token');
  }
  const user = await User.findOne({
    where: {
      email
    }
  });
  if (!user) {
    throw HTTPError(400, 'No users exist with this email');
  }
  if (user.password !== password) {
    throw HTTPError(400, 'Incorrect password');
  }
  const userToken = await addToken(user);
  return {
    token: userToken,
    authUserId: user.uId
  };
}
/**
  * This function registers a user onto the database. This data can then be called by other functions for more features.
  * These features include logging into their respective accounts, and creating channels with them being the global owner.
  *
  * @param {string} email - The users email for which they want to create the account
  * @param {string} Password - The users password for which they want to associate the account with
  * @param {string} nameFirst - The users first name
  * @param {string} nameLast - The users last name
  * ...
  *
  * @returns {number} - The users unique user ID in integer form.
  * @returns {error} - An error message for a number of reasons, including: a wrong parameter, incorrect email, name too long or short and password too short.
*/
interface registerUser {
    token: string,
    authUserId: number,
}
async function authRegisterV3(email: string, password: string, nameFirst: string, nameLast: string): Promise<registerUser> {
  const checkUser = await User.findOne({
    where: { email }
  });
  if (EmailValidator.validate(email) === false) {
    throw HTTPError(400, 'Invalid Email');
  } else
  if (nameFirst.length > 50 || nameLast.length > 50) {
    throw HTTPError(400, 'Name Too long');
  } else if (nameFirst.length < 1 || nameLast.length < 1) {
    throw HTTPError(400, 'Name too Short');
  } else if (password.length < 6) {
    throw HTTPError(400, 'Password too short');
  } else if (checkUser) {
    throw HTTPError(400, 'Email is already registered');
  }
  let fullName = nameFirst + nameLast;
  fullName = fullName.toLowerCase();
  fullName = fullName.replace(/[^a-zA-Z0-9 ]/g, '');
  fullName = fullName.replace(/\s+/g, '');
  let handleStr;
  if (fullName.length > 20) {
    handleStr = fullName.slice(0, 19);
  } else {
    handleStr = fullName;
  }
  let newHandle = handleStr;
  let users = await User.findOne({
    where: {
      handleStr: newHandle
    }
  });
  let time = 0;
  while (users) {
    users = await User.findOne({
      where: {
        handleStr: newHandle + String(time)
      }
    });
    time += 1;
  }
  if (time !== 0) {
    newHandle += String(time - 1);
  }
  const authUserId = Number(String(Math.floor(Math.random() * 100000)) + String(Math.floor(Math.random() * 10000)));
  const allusers = await User.find();
  let firstUser = false;
  if (allusers.length === 0) {
    firstUser = true;
    await initWorkSpace();
  }
  const user = User.create({
    uId: authUserId,
    nameFirst: nameFirst,
    nameLast: nameLast,
    email: email,
    password: password,
    handleStr: newHandle,
    role: firstUser ? 'Global Owner' : 'Global Member',
    profileImage: 'http:',
  });
  await user.save();
  await initUserTimeLine(user);
  await updateWorkSpace(TimePointType.USER, Method.INCREASE);
  const token = await addToken(user);
  return {
    token,
    authUserId
  };
}
export async function authLogoutV2(token: string) {
  const usertoken = await Token.findOne({ where: { token: getHashOf(token) } });
  if (!usertoken) {
    throw HTTPError(403, 'Given token is invalid');
  }
  await Token.delete({ token: getHashOf(token) });
  return {};
}

export { authRegisterV3 };
