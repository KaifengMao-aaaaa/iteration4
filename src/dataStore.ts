// YOU SHOULD MODIFY THIS OBJECT BELOW
import fs from 'fs';

export interface notification {
  channelId: number;
  dmId: number;
  message: string;
}
export interface timePoint {
  pointType: 'message'|'dm'|'channel',
  timeStamp: number,
  num: number
}
export interface user {
  uId: number,
  nameFirst: string,
  nameLast: string,
  email: string,
  password: string,
  handleStr: string,
  role: string,
  resetCode?: string,
  notifications: notification[],
  profileImage: string,
  timeLine: timePoint[],
  checkTable: {'channel': number, 'dm': number, 'message': number}
}

export interface react {
  reactId: number,
  uIds: number[],
  isThisUserReacted: boolean
}
export interface messages {
  messageId: number,
  uId: number,
  message: string,
  timeSent: number,
  reacts?: react[],
  isPinned: boolean
}

export interface standupMessage {
  message: string,
  uId: number
}
export interface channel {
  channelId: number,
  name: string,
  isPublic: boolean,
  owners: number[],
  allMembers: number[],
  messages: messages[],
  standupBuffer: standupMessage[],
  isActive: boolean
  timeFinish: null|number
  standupStarter: number|null,
  checkTable: {hangmanStart: boolean, hangmanToken: string|undefined, hangmanWord: string|undefined, wordsGuested: string[]|undefined, stage: number, leaveLetters: string[]|undefined}
}

export interface dm { // added
  dmId: number,
  name: string,
  owner: number,
  allMembers: number[],
  messages: messages[],
}

export interface token { // added
  token: string;
  uId: number;
}

export interface datas {
  users: user[];
  channels: channel[];
  dms: dm[];
  tokens: token[]; // added
  workSpace: timePoint[]

}

let data: datas = {
  users: [],
  channels: [],
  dms: [],
  tokens: [],
  workSpace: []
};

// let data = {
//   users: [
//     {
//       uId: 0,
//       nameFirst: 'Peter',
//       nameLast: 'Griffin',
//       email: 'PeterGriffin@gmail.com',
//       password: '1234567879',
//       handleStr: 'petergriffin',
//       role: 'Global Owner',
//     },
//   ],
//   channels: [
//       {
//         channelId: 0,
//         name: 'Channel2',
//         isPublic: true,
//         owners: [0],
//         allMembers: [0, 1, 2, 3],
//         messages: [
//           {
//             messageId: 0,
//             uId: 0,
//             message : 'hello',
//           }
//         ]
//       },
//   ],
//   // TODO: insert your data structure that contains
//   // users + channels here
// };

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/
// Use get() to access the data
function getData(): datas {
  return data;
}

// Use set(newData) to pass in the entire data object, with modifications made
// - Only needs to be used if you replace the data store entirely
// - Javascript uses pass-by-reference for objects... read more here: https://stackoverflow.com/questions/13104494/does-javascript-pass-by-reference
// Hint: this function might be useful to edit in iteration 2
function setData(newData: datas) {
  data = newData;
  fs.writeFileSync('data.json', JSON.stringify(newData), { flag: 'w' });
}

export { getData, setData };
