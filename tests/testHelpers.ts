import request, { HttpVerb } from 'sync-request';
import { port, url } from '../src/config.json';
const SERVER_URL = `${url}:${port}`;

// From tut05 solutions (Thanks Tam!)
function requestHelper(method: HttpVerb, path: string, payload: object, token : string|undefined = undefined) {
  let qs = {};
  let json = {};
  let headers = {};
  if (token !== undefined) {
    headers = { token };
  }
  if (['GET', 'DELETE'].includes(method)) {
    qs = payload;
  } else {
    json = payload;
  }
  const res = request(method, SERVER_URL + path, { qs, json, headers });
  if (res.statusCode !== 200) {
    return res.statusCode;
  }
  return JSON.parse(res.getBody() as string);
}

export function requestClear() {
  return requestHelper('DELETE', '/clear/v1', {});
}
export function requestUserStatsV1(token: string) {
  return requestHelper('GET', '/user/stats/v1', {}, token);
}
export function requestUsersStatsV1(token: string) {
  return requestHelper('GET', '/users/stats/v1', {}, token);
}
export function requestAuthLoginV3(token: string, email: string, password: string) {
  return requestHelper('POST', '/auth/login/v3', { email, password }, token);
}

export function requestAuthRegisterV3(email: string, password: string, nameFirst: string, nameLast: string) {
  return requestHelper('POST', '/auth/register/v3', { email, password, nameFirst, nameLast });
}

export function requestAuthLogoutV2(token: string) {
  return requestHelper('POST', '/auth/logout/v2', {}, token);
}

export function requestChannelsCreateV3(token: string, name: string, isPublic: boolean) {
  return requestHelper('POST', '/channels/create/v3', { name, isPublic }, token);
}

export function requestChannelsListV3(token: string) {
  return requestHelper('GET', '/channels/list/v3', {}, token);
}

export function requestChannelJoinV3(token: string, channelId: number) {
  return requestHelper('POST', '/channel/join/v3', { channelId }, token);
}

export function requestaddOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/addowner/v2', { channelId, uId }, token);
}

export function requestremoveOwner(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/removeowner/v2', { channelId, uId }, token);
}

export function requestChannelDetailsV3(token: string, channelId: number) {
  return requestHelper('GET', '/channel/details/v3', { channelId }, token);
}

export function requestChannelLeaveV2(token: string, channelId: number) {
  return requestHelper('POST', '/channel/leave/v2', { channelId }, token);
}

export function requestMessageRemoveV2(token: string, messageId: number) {
  return requestHelper('DELETE', '/message/remove/v2', { messageId }, token);
}

export function requestMessageEditV2(token: string, messageId: number, message: string) {
  return requestHelper('PUT', '/message/edit/v2', { messageId, message }, token);
}

export function requestMessageSendV2(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/message/send/v2', { channelId, message }, token);
}

export function requestChannelInviteV3(token: string, channelId: number, uId: number) {
  return requestHelper('POST', '/channel/invite/v3', { channelId, uId }, token);
}

export function requestChannelListallV3(token: string) {
  return requestHelper('GET', '/channels/listall/v3', {}, token);
}

export function requestChannelMessagesV3(token: string, channelId: number, start: number) {
  return requestHelper('GET', '/channel/messages/v3', { channelId, start }, token);
}

export function requestUserProfileV3(token: string, uId: number) {
  return requestHelper('GET', '/user/profile/v3', { uId }, token);
}

export function requestNotifications(token: string) {
  return requestHelper('GET', '/notifications/get/v1', {}, token);
}

export function requestUploadPhoto(token: string, imgUrl: string, xStart: number, yStart: number, xEnd: number, yEnd: number) {
  return requestHelper('POST', '/user/profile/uploadphoto/v1', { imgUrl, xStart, yStart, xEnd, yEnd }, token);
}

export function requestDmCreateV2(token: string, uIds: number[]) {
  return requestHelper('POST', '/dm/create/v2', { uIds }, token);
}

export function requestDmListV2(token: string) {
  return requestHelper('GET', '/dm/list/v2', {}, token);
}

export function requestDmRemoveV2(token: string, dmId: number) {
  return requestHelper('DELETE', '/dm/remove/v2', { dmId }, token);
}

export function requestDmDetailsV2(token: string, dmId: number) {
  return requestHelper('GET', '/dm/details/v2', { dmId }, token);
}

export function requestDmLeaveV2(token: string, dmId: number) {
  return requestHelper('POST', '/dm/leave/v2', { dmId }, token);
}

export function requestDmMessagesV2(token: string, dmId: number, start: number) {
  return requestHelper('GET', '/dm/messages/v2', { dmId, start }, token);
}

export function requestMessageSenddmV2(token: string, dmId: number, message: string) {
  return requestHelper('POST', '/message/senddm/v2', { dmId, message }, token);
}

export function requestUsersAllV2(token: string) {
  return requestHelper('GET', '/users/all/v2', {}, token);
}

export function requestUserSetEmail(token: string, email: string) {
  return requestHelper('PUT', '/user/profile/setemail/v2', { email }, token);
}

export function requestUserSetHandle(token: string, handleStr: string) {
  return requestHelper('PUT', '/user/profile/sethandle/v2', { handleStr }, token);
}

export function requestUserSetName(token: string, nameFirst: string, nameLast: string) {
  return requestHelper('PUT', '/user/profile/setname/v2', { nameFirst, nameLast }, token);
}

export function requestPinV1(token: string, messageId: number) {
  return requestHelper('POST', '/message/pin/v1', { messageId }, token);
}

export function requestUnpinV1(token: string, messageId: number) {
  return requestHelper('POST', '/message/unpin/v1', { messageId }, token);
}

export function requestPasswordResetRequestV1(email: string) {
  return requestHelper('POST', '/auth/passwordreset/request/v1', { email });
}

export function requestPasswordResetV1(resetCode: string, newPassword: string) {
  return requestHelper('POST', '/auth/passwordreset/reset/v1', { resetCode, newPassword });
}

export function requestMessageShareV1(token: string, ogMessageId: number, message: string, channelId: number, dmId: number) {
  return requestHelper('POST', '/message/share/v1', { ogMessageId, message, channelId, dmId }, token);
}

export function requestMessageSendlaterV1(token: string, channelId: number, message: string, timeSent: number) {
  return requestHelper('POST', '/message/sendlater/v1', { channelId, message, timeSent }, token);
}

export function requestMessageSendlaterdmV1(token: string, dmId: number, message: string, timeSent: number) {
  return requestHelper('POST', '/message/sendlaterdm/v1', { dmId, message, timeSent }, token);
}

export function requestStandupActiveV1(token: string, channelId: number) {
  return requestHelper('GET', '/standup/active/v1', { channelId }, token);
}

export function requestStandupSendV1(token: string, channelId: number, message: string) {
  return requestHelper('POST', '/standup/send/v1', { message, channelId }, token);
}

export function requestStandupStartV1(token: string, channelId: number, length: number) {
  return requestHelper('POST', '/standup/start/v1', { channelId, length }, token);
}

export function requestUserRemoveV1(token: string, uId: number) {
  return requestHelper('DELETE', '/admin/user/remove/v1', { uId }, token);
}

export function requestPermissionChangeV1(token: string, uId: number, permissionId: number) {
  return requestHelper('POST', '/admin/userpermission/change/v1', { uId, permissionId }, token);
}

export function requestMessageReactV1(token: string, messageId: number, reactId: number) {
  return requestHelper('POST', '/message/react/v1', { messageId, reactId }, token);
}

export function requestMessageUnReactV1(token: string, messageId: number, reactId: number) {
  return requestHelper('POST', '/message/unreact/v1', { messageId, reactId }, token);
}

export function requestSearchV1(token: string, queryStr: string) {
  return requestHelper('GET', '/search/v1', { queryStr }, token);
}

export type userType = {
    token: string;
    authUserId: number;
}

export type token = {
    token: string,
    uId: number,
}

export type dm = {
    dmId: number
}

export type message = {
    messageId: number
}

export type userDetails = {
    uId: number,
    email: string,
    nameFirst: string,
    nameLast: string,
    handleStr: string
}

export type dmType = { // added
    dmId: number,
    name: string,
    owner: number,
    allMembers: number[],
    uIds: number[],
    messages: []
}
