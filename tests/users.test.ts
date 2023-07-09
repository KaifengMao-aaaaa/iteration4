import { requestUserSetEmail, userType, requestClear, requestAuthRegisterV3, requestUploadPhoto, requestUserProfileV3, requestUserSetHandle, requestUsersAllV2, requestUserSetName } from '../tests/testHelpers';
import config from '../src/config.json';

describe('tests for userProfileV3', () => {
  let user1: userType;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('123@gmail.com', '122342432453', 'Kaifeng', 'mao');
  });
  test('uId does not refer to a valid user', () => {
    expect(requestUserProfileV3(user1.token, user1.authUserId + 100)).toStrictEqual(400);
  });
  test('token is invalid', () => {
    expect(requestUserProfileV3(user1.token.concat('1'), user1.authUserId)).toStrictEqual(403);
  });
  test('normal situation', () => {
    expect(requestUserProfileV3(user1.token, user1.authUserId)).toStrictEqual({
      user: {
        uId: user1.authUserId,
        email: '123@gmail.com',
        nameFirst: 'Kaifeng',
        nameLast: 'mao',
        handleStr: 'kaifengmao'
      }
    });
  });
});

describe('Set Email', () => {
  let registered: userType; // registered1: userType;
  beforeEach(() => {
    requestClear();
    registered = requestAuthRegisterV3('Suji124@gmail.com', '1236556454', 'Sujanthan', 'Manoharan');
    // registered1 =
    requestAuthRegisterV3('SujMan@gmail.com', '6565465465', 'Suji', 'Mano');
  });
  test('Invalid token', () => {
    expect(requestUserSetEmail('failcase', 'email@gmail.com')).toStrictEqual(403);
  });
  describe('Set Email specific error cases', () => {
    test('Invalid email', () => {
      expect(requestUserSetEmail(registered.token, 'failcase')).toStrictEqual(400);
    });
    test('Email used by another user', () => {
      expect(requestUserSetEmail(registered.token, 'SujMan@gmail.com')).toStrictEqual(400);
    });
    test('All changes', () => {
      expect(requestUserSetEmail(registered.token, 'suii@gmail.com')).toStrictEqual({});
      expect(requestUserProfileV3(registered.token, registered.authUserId)).toStrictEqual({
        user: {
          uId: registered.authUserId,
          email: 'suii@gmail.com',
          nameFirst: 'Sujanthan',
          nameLast: 'Manoharan',
          handleStr: 'sujanthanmanoharan'
        }
      });
    });
  });
});

describe('Testing Handle String', () => {
  let registered: userType;
  beforeEach(() => {
    requestClear();
    registered = requestAuthRegisterV3('validmail@gmail.com', 'password', 'Ben', 'Ten');
  });
  test('Invalid token', () => {
    const notAToken = registered.token + 'extra characters';
    expect(requestUserSetHandle(notAToken, 'email@gmail.com')).toStrictEqual(403);
  });
  describe('fail cases', () => {
    test('Handle too short/long or non-alphanumeric', () => {
      expect(requestUserSetHandle(registered.token, 'i')).toStrictEqual(400);
      expect(requestUserSetHandle(registered.token, 'qwertyuiopasdfghjklzxcvbnm')).toStrictEqual(400);
      expect(requestUserSetHandle(registered.token, 'qwerty_qwerty!')).toStrictEqual(400);
    });
    test('Duplicate handle', () => {
      requestAuthRegisterV3('useddupe@gmail.com', 'password', 'Harry', 'Potter');
      expect(requestUserSetHandle(registered.token, 'already-used@gmail.com')).toStrictEqual(400);
    });
  });

  test('Success case', () => {
    expect(requestUserSetHandle(registered.token, 'validhandlestring')).toStrictEqual({});
  });
});

describe('testing for usersAllV1', () => {
  let user1: userType; // user2: userType;
  // let channel, channel2;
  // let user1Profile: userDetails, user2Profile: userDetails;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('123valid@gmail.com', '19482b3a', 'John', 'Cena');
    // user2 =
    requestAuthRegisterV3('valid123valid@gmail.com', '194093a', 'John', 'Smith');
    // user1Profile = getUserDetails(user1.authUserId);
    // user2Profile = getUserDetails(user2.authUserId);
  });

  test('invalid token', () => {
    expect(requestUsersAllV2(user1.token + 'invalid')).toStrictEqual(403);
  });

  test('listing all users', () => {
    const userToken = user1.token;
    const result = requestUsersAllV2(userToken);
    expect(result).toEqual({
      users: [
        {
          uId: expect.any(Number),
          nameFirst: expect.any(String),
          nameLast: expect.any(String),
          email: expect.any(String),
          handleStr: expect.any(String),
        },
        {
          uId: expect.any(Number),
          nameFirst: expect.any(String),
          nameLast: expect.any(String),
          email: expect.any(String),
          handleStr: expect.any(String),
        },
      ],
    });
  });
});

describe('Testing Set name', () => {
  let registered: userType;
  beforeEach(() => {
    requestClear();
    registered = requestAuthRegisterV3('validmail@gmail.com', 'password', 'Ben', 'Ten');
  });
  test('Invalid token', () => {
    const notAToken = registered.token + 'extra characters';
    expect(requestUserSetName(notAToken, 'emailgmail.com', 'adfjkafklja')).toStrictEqual(403);
  });
  describe('fail cases', () => {
    test('Name is too short/long', () => {
      expect(requestUserSetName(registered.token, 'i', '')).toStrictEqual(400);
      expect(requestUserSetName(registered.token, 'qwertyuiopasdfghjklzxcvbnmasdfadfadfadfasfaewqeerda', 'afjkhdajfhjeqhd')).toStrictEqual(400);
    });
  });
  test('Pass Case', () => {
    expect(requestUserSetName(registered.token, 'validhandles', 'asfdaswe')).toStrictEqual({});
  });
});

describe.skip('upload photo', () => {
  let user: userType;
  beforeEach(() => {
    requestClear();
    user = requestAuthRegisterV3('testemail@gmail.com', 'TestPassword', 'Test', 'User');
  });
  test('Invalid token', () => {
    expect(requestUploadPhoto('Invalid token', 'https://tinypng.com/images/social/website.jpg', 1, 1, 2, 2)).toStrictEqual(403);
  });
  test('Invalid bounds', () => {
    expect(requestUploadPhoto(user.token, 'https://tinypng.com/images/social/website.jpg', -1, 1, 2, 2)).toStrictEqual(400);
  });
  test('Invalid bounds', () => {
    expect(requestUploadPhoto(user.token, 'https://tinypng.com/images/social/website.jpg', 1, -1, 2, 2)).toStrictEqual(400);
  });
  test('Invalid bounds', () => {
    expect(requestUploadPhoto(user.token, 'https://tinypng.com/images/social/website.jpg', 5, 1, 1, 2)).toStrictEqual(400);
  });
  test('Invalid bounds', () => {
    expect(requestUploadPhoto(user.token, 'https://tinypng.com/images/social/website.jpg', 500, 500, 620, 349)).toStrictEqual(400);
  });
  test('Invalid URL', () => {
    expect(requestUploadPhoto(user.token, 'http://www.randomaddress.com/any.jpg', -1, 1, 2, 2)).toStrictEqual(400);
  });
  test('Correct', () => {
    const PORT: number = parseInt(process.env.PORT || config.port);
    const HOST: string = process.env.IP || 'localhost';
    const user2 = requestAuthRegisterV3('testemail2@gmail.com', 'TestPassword', 'Test', 'User2');
    expect(requestUploadPhoto(user2.token, 'https://tinypng.com/images/social/website.jpg', 100, 100, 320, 240)).toStrictEqual({});
    expect(requestUploadPhoto(user2.token, `http://${HOST}:${PORT}/Images/default.jpg`, 100, 100, 320, 240)).toStrictEqual({});
  });
});
