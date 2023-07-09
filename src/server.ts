import express, { json, Request, Response } from 'express';
import HTTPError from 'http-errors';
import config from './config.json';
import cors from 'cors';
// Our functions
import { authLoginV3, authRegisterV3, authLogoutV2 } from './auth';
import { channelsListAllV3, channelsListV3 } from './channels';
import { AppDataSource } from './data-source';
import { User } from './entity/User';
import { In } from 'typeorm';
import { messageRemoveV2, messageSendV2, messageEditV2, messageSenddmV2, messageShareV1, messageSendlaterV1, messageSendlaterdmV1 } from './message';
import { WorkSpacePoint } from './entity/WorkSpacePoint';
import { channelsCreateV3 } from './channels';
import { channelInviteV3, channelDetailsV3, channelJoinV3, addOwnerV2, removeOwnerV2, channelMessagesV3, channelLeaveV2 } from './channel';
import { Channel } from './entity/Channel';
import { dmCreateV2, dmListV2, dmRemoveV2, dmLeaveV2, dmMessagesV2, dmDetailsV2 } from './dm';
import { standupActiveV1, standupSendV1, standupStartV1 } from './standup';
import { userProfileV3, userStatsV1, usersStatsV1, userSetNameV2, usersAllV2, setEmailV2, setHandleV2 } from './user';
import { endGame, hangmanStart, sendMessage } from './hangmanlib';
import { Token } from './entity/Tokens';
import { getHashOf } from './other';
const app = express();

AppDataSource.initialize().then(async () => {
  console.log('connection sucesseful');
  // Set up web app
  // Use middleware that allows us to access the JSON body of requests
  app.use(json());
  // Use middleware that allows for access from other domains
  app.use(cors());

  const PORT: number = parseInt(process.env.PORT || config.port);
  const HOST: string = process.env.IP || 'localhost';
  // Example get request
  // app.get('/echo', (req: Request, res: Response, next) => {
  //   const data = req.query.echo as string;
  //   return res.json(echo(data));
  // });
  app.post('/auth/register/v3', async (req: Request, res: Response) => {
    try {
      const { email, password, nameFirst, nameLast } = req.body;
      return res.json(await authRegisterV3(email, password, nameFirst, nameLast));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.mesage);
    }
  });
  app.delete('/clear/v1', async (req, res) => {
    try {
      const allPoints = await WorkSpacePoint.find({
        select: { pointId: true },
      });
      await WorkSpacePoint.delete({ pointId: In(allPoints.map((point) => point.pointId)) });
      const allusers = await User.find({
        select: { uId: true }
      });

      await User.delete({ uId: In(allusers.map((user) => user.uId)) });
      const allchannels = await Channel.find({
        select: { channelId: true }
      });
      await Channel.delete({ channelId: In(allchannels.map((channel) => channel.channelId)) });
      res.json({});
    } catch (e) {
      res.status(e.statusCode || 500).send(e.mesage);
    }
  });
  app.delete('/dm/remove/v2', async (req, res) => {
    try {
      const token = req.header('token');
      const dmId = req.query.dmId;
      res.json(await dmRemoveV2(String(token), Number(dmId)));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.mesage);
    }
  });
  app.post('/hangman/start/v1', async (req, res) => {
    try {
      const token = req.header('token');
      const channelId = req.body.channelId;
      res.json(await hangmanStart(token, channelId));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/hangman/end/v1', async (req, res) => {
    try {
      const token = req.header('token');
      const userToken = await Token.findOne({ where: { token: getHashOf(token) } });
      if (!userToken) {
        throw HTTPError(403, 'invalid token');
      }
      const channelId = req.body.channelId;
      const hangman = await User.findOne({ where: { role: 'Hangman' } });
      const channel = await Channel.findOne({ where: { channelId } });
      if (!channel) {
        throw HTTPError(400, 'incorrect channelId');
      } else if (!channel.checkTable.hangmanStart) {
        throw HTTPError(400, 'no start');
      }
      const result = await endGame(hangman, channel);
      await sendMessage(hangman, channel, 'You Give Up');
      res.json(result);
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/auth/login/v3', async (req, res, next) => {
    try {
      const token = req.header('token');
      const data = req.body;
      const result = await authLoginV3(token, data.email, data.password);
      res.json(result);
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/dm/create/v2', async (req, res) => {
    try {
      const token = req.header('token');
      const uIds = req.body.uIds;
      res.json(await dmCreateV2(token, uIds));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.delete('/message/remove/v2', async (req, res) => {
    try {
      const token = req.header('token');
      const messageId = Number(req.query.messageId);
      res.json(await messageRemoveV2(token, messageId));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });

  app.post('/channels/create/v3', async (req, res) => {
    try {
      const token = req.header('token');
      const { name, isPublic } = req.body;
      return res.json(await channelsCreateV3(token, name, isPublic));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });

  app.post('/channel/join/v3', async (req, res) => {
    try {
      const channelId = req.body.channelId;
      const token = req.header('token');
      res.json(await channelJoinV3(token, channelId));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });

  app.post('/channel/addowner/v2', async (req, res) => {
    const token = req.header('token');
    try {
      const { channelId, uId } = req.body;
      res.json(await addOwnerV2(token, channelId, uId));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/channel/removeowner/v2', async (req, res) => {
    try {
      const token = req.header('token');
      const { channelId, uId } = req.body;
      res.json(await removeOwnerV2(token, channelId, uId));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/message/send/v2', async (req, res) => {
    try {
      const token = req.header('token');
      const { channelId, message } = req.body;
      res.json(await messageSendV2(token, channelId, message));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/channel/invite/v3', async (req, res) => {
    try {
      const token = req.header('token');
      const { channelId, uId } = req.body;
      res.json(await channelInviteV3(token, channelId, uId));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });

  app.post('/dm/leave/v2', async (req, res) => {
    try {
      const token = req.header('token');
      const dmId = req.body.dmId;
      res.json(await dmLeaveV2(token, dmId));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/message/senddm/v2', async (req, res) => {
    try {
      const token = req.header('token');
      const { dmId, message } = req.body;
      res.json(await messageSenddmV2(token, dmId, message));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/standup/start/v1', async (req, res) => {
    try {
      const token = req.header('token');
      const { channelId, length } = req.body;
      res.json(await standupStartV1(token, channelId, length));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/standup/send/v1', async(req, res) => {
    try {
      const token = req.header('token');
      const { channelId, message } = req.body;
      res.json(await standupSendV1(token, channelId, message));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/channel/leave/v2', async(req, res) => {
    try {
      const token = req.header('token');
      const channelId = req.body.channelId;
      res.json(await channelLeaveV2(token, channelId));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/message/share/v1', async (req, res) => {
    try {
      const token = req.header('token');
      const { ogMessageId, message, channelId, dmId } = req.body;
      res.json(await messageShareV1(token, ogMessageId, message, channelId, dmId));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/message/sendlater/v1', async(req, res) => {
    try {
      const token = req.header('token');
      const { channelId, message, timeSent } = req.body;
      res.json(await messageSendlaterV1(token, channelId, message, timeSent));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.post('/message/sendlaterdm/v1', async (req, res) => {
    try {
      const token = req.header('token');
      const { dmId, message, timeSent } = req.body;
      res.json(await messageSendlaterdmV1(token, dmId, message, timeSent));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });

  app.get('/channel/details/v3', async (req, res) => {
    try {
      const token = req.header('token');
      const channelId = Number(req.query.channelId);
      res.json(await channelDetailsV3(token, channelId));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });

  app.get('/channels/listall/v3', async (req, res) => {
    try {
      const token = req.header('token');
      res.json(await channelsListAllV3(token));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.get('/channels/list/v3', async (req, res) => {
    try {
      const token = req.header('token');
      res.json(await channelsListV3(token));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.get('/channel/messages/v3', async (req, res) => {
    try {
      const token = req.header('token');
      const { channelId, start } = req.query;
      res.json(await channelMessagesV3(String(token), Number(channelId), Number(start)));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.get('/dm/list/v2', async (req, res) => {
    try {
      const token = req.header('token');
      res.json(await dmListV2(token));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.get('/user/profile/v3', async (req, res) => {
    try {
      const token = req.header('token');
      const uId = req.query.uId;
      res.json(await userProfileV3(String(token), Number(uId)));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.get('/user/stats/v1', async(req: Request, res: Response) => {
    try {
      const token = req.header('token');
      res.json(await userStatsV1(token));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.get('/users/stats/v1', async (req: Request, res: Response) => {
    try {
      const token = req.header('token');
      res.json(await usersStatsV1(token));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });

  app.get('/dm/details/v2', async (req, res) => {
    try {
      // throw HTTPError(400,'invalid')
      const token = req.header('token');
      const dmId = req.query.dmId;
      res.json(await dmDetailsV2(String(token), Number(dmId)));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });

  app.get('/dm/messages/v2', async (req, res) => {
    try {
      const token = req.header('token');
      const { dmId, start } = req.query;
      res.json(await dmMessagesV2(String(token), Number(dmId), Number(start)));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.get('/standup/active/v1', async(req, res) => {
    try {
      const token = req.header('token');
      const channelId = req.query.channelId;
      res.json(await standupActiveV1(token, Number(channelId)));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.get('/users/all/v2', async (req, res) => {
    try {
      const token = req.header('token');
      res.json(await usersAllV2(token));
    } catch (e) {
      res.status(e.statusCode).send(e.message);
    }
  });
  app.post('/auth/logout/v2', async (req, res) => {
    try {
      const token = req.header('token');
      res.json(await authLogoutV2(token));
    } catch (e) {
      res.status(e.statusCode).send(e.message);
    }
  });
  app.put('/message/edit/v2', async (req, res) => {
    try {
      const token = req.header('token');
      const { messageId, message } = req.body;
      res.json(await messageEditV2(token, messageId, message));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });

  app.put('/user/profile/sethandle/v2', async (req, res) => {
    try {
      const token = req.header('token');
      const handleStr = req.body.handleStr;
      res.json(await setHandleV2(token, handleStr));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });

  app.put('/user/profile/setname/v2', async (req, res) => {
    try {
      const token = req.header('token');
      const { nameFirst, nameLast } = req.body;
      res.json(await userSetNameV2(token, nameFirst, nameLast));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });
  app.put('/user/profile/setemail/v2', async(req, res) => {
    try {
      const token = req.header('token');
      const email = req.body.email;
      res.json(await setEmailV2(token, email));
    } catch (e) {
      res.status(e.statusCode || 500).send(e.message);
    }
  });

  const server = app.listen(PORT, HOST, () => {
    // DO NOT CHANGE THIS LINE
    console.log(`⚡️ Server started on port ${PORT} at ${HOST}`);
  });

  // For coverage, handle Ctrl+C gracefully
  process.on('SIGINT', () => {
    server.close(() => console.log('Shutting down server gracefully.'));
  });
}).catch(error => { console.log(error); });
