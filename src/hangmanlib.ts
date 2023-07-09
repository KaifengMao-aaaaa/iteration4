import { Channel } from './entity/Channel';
import { WorkSpacePoint } from './entity/WorkSpacePoint';
import { MessageType, Status } from './entity/Message';
import { Method, TimePointType } from './entity/TimePoint';
import { User } from './entity/User';
import { addToken, convertToTimeStamp, getHashOf } from './other';
import { Message } from './entity/Message';
import HTTPError from 'http-errors';
import { Token } from './entity/Tokens';
const randomWords = require('random-words');
export const setting = {
  WordLength: 7,
  EndGraph: `
     +---+
   |   |
   |   X
   |  /|\\
   |  / \\
   |
=============
  `,
  ProcessingGraph: [
  `
  ________
  |      |
  |
  |
  |
  |_________
  `,
  `
  ________
  |      |
  |      O
  |
  |
  |_________
  `,
  `
  ________
  |      |
  |      O
  |     /
  |
  |_________
  `,
  `
  ________
  |      |
  |      O
  |     /|
  |
  |_________
  `,
  `
  ________
  |      |
  |      O
  |     /|\\
  |
  |_________
  `,
  `
  ________
  |      |
  |      O
  |     /|\\
  |     /
  |_________
  `,
  `
  ________
  |      |
  |      O
  |     /|\\
  |     / \\
  |_________
  `
  ]
};
export async function checkWin(hangman: User, channel: Channel) {
  if (!channel.checkTable.word.find(word => word === '_')) {
    await sendMessage(hangman, channel, 'Well down' + `\n answer was ** ${channel.checkTable.hangmanWord} **`);
    await endGame(hangman, channel);
    return true;
  }
  return false;
}
export async function checkLoss(hangman: User, channel: Channel) {
  if (channel.checkTable.stage === 7) {
    await sendMessage(hangman, channel, 'Failed' + `\nanswer was ** ${channel.checkTable.hangmanWord} **` + `\n ${setting.EndGraph}`);
    await endGame(hangman, channel);
    return true;
  }
  return false;
}
/**
  * endGame will end the hangman game of this channle<
  *
  * @param {string} token - token of user
  * @param {Channel} channel - id of channel
  * @returns {{}} - if the function start hangman game sucessfully
*/
export async function endGame(hangman: User, channel: Channel) :Promise<Record<string, never>> {
  channel.checkTable = { hangmanStart: false, stage: -1, word: [], hangmanWord: undefined, leaveLetters: undefined };
  const channelMembers = channel.members.map(member => Number(member));
  channel.members.splice(channelMembers.indexOf(hangman.uId), 1);
  await channel.save();
  return {};
}
export async function initHangman(hangman: User, channel: Channel) {
  channel.checkTable = {
    hangmanStart: true,
    hangmanWord: ((): string => {
      let hangmanword;
      do {
        hangmanword = randomWords({ exactly: 1 })[0];
      } while (hangmanword.length < setting.WordLength);
      return hangmanword;
    })(),
    word: [],
    stage: 0,
    leaveLetters: Array.from({ length: 26 }, (_, i) => String.fromCharCode('a'.charCodeAt(0) + i))
  };
  channel.checkTable.word = new Array(channel.checkTable.hangmanWord.length).fill('_');
  await channel.save();
  await sendMessage(hangman, channel, 'Game Start' + `${channel.checkTable.word.join(' ')}`);
}

// the function for hangman to send message
export async function sendMessage(hangman: User, channel: Channel, message: string) {
  const sendMessage = Message.create({
    type: MessageType.SYSTEM,
    status: Status.VALID,
    message,
    time: convertToTimeStamp(new Date()),
    channelId: channel.channelId,
    user: hangman
  });
  await sendMessage.save();
}
export async function checkHangman(message: string, channel: Channel) {
  if (channel.checkTable.hangmanStart) {
    if (/^[/]guess [a-zA-Z]{1}$/.test(message)) {
      await hangmanSend(channel, message[message.length - 1]);
    }
  }
}
/**
  * <channelsListAllV1 allows a user to see all channels list>
  *
  * @param {string} token - token of user
  * @param {number} channelId - id of channel
  * @returns {Array<{
  *     channelId: number,
  *       name: string,
  *   }>} - returns all possible channel arrays containing channelId and name
  * @returns {{}} - if the function start hangman game sucessfully
*/

export async function hangmanStart(token:string, channelId: number): Promise<Error|Record<string, never>> {
  const userToken = await Token.findOne({ where: { token: getHashOf(token) } });
  if (!userToken) {
    throw HTTPError(403, 'invalid token');
  }
  const channel = await Channel.findOne({ where: { channelId } });
  if (channel.checkTable.hangmanStart) {
    throw HTTPError(400, 'existing hangman game');
  }
  const hangmanPoint = await WorkSpacePoint.findOne({ where: { type: TimePointType.HANGMAN } });
  if (!hangmanPoint) {
    const hman = User.create({
      role: 'Hangman',
      uId: Math.floor(Math.random() * 10000000),
      nameFirst: 'H',
      nameLast: 'Man',
      handleStr: 'horrible hangman'
    });
    await hman.save();
    const point = WorkSpacePoint.create({
      num: 1,
      time: convertToTimeStamp(new Date()),
      type: TimePointType.HANGMAN,
      method: Method.INIT
    });
    await point.save();
    await addToken(hman);
  }
  const hangman = await User.findOne({ where: { role: 'Hangman' }, relations: ['tokens'] });
  channel.members.push(hangman.uId);
  await channel.save();
  await initHangman(hangman, channel);
  return {};
}
// check user input
export async function hangmanSend(channel: Channel, Guess: string) {
  if (!channel.checkTable.hangmanStart) {
    return { error: 'no reaction' };
  }
  const hangman = await User.findOne({ where: { role: 'Hangman' } });
  const guess = Guess.toLocaleLowerCase();
  if (channel.checkTable.hangmanWord.includes(guess)) {
    const indexGuestWord = Array.from(channel.checkTable.hangmanWord).map((word, index) => { return word === guess ? index : -1; }).filter(index => index !== -1);
    channel.checkTable.word = channel.checkTable.word.map((word, index) => indexGuestWord.includes(index) ? guess : word);
  } else {
    channel.checkTable.stage += 1;
  }
  channel.checkTable.leaveLetters[channel.checkTable.leaveLetters.indexOf(guess)] = '_';
  await channel.save();
  if (!await checkLoss(hangman, channel) && !await checkWin(hangman, channel)) {
    await sendMessage(hangman, channel, setting.ProcessingGraph[channel.checkTable.stage] + `\n  ${channel.checkTable.word.join(' ')}` + `\n ${channel.checkTable.leaveLetters.join(' ')}`);
  }
}
