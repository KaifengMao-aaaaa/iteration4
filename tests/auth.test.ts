import { userDetails, userType, requestClear, requestAuthLoginV3, requestAuthRegisterV3, requestUserProfileV3, requestAuthLogoutV2 } from '../tests/testHelpers';

beforeEach(() => {
  requestClear();
});

describe('AuthLogin', () => {
  test('First true case', () => {
    const user = requestAuthRegisterV3('abcd@gmail.com', '1234cd2', 'John', 'Smith');
    expect(requestAuthLoginV3(user.token, 'abcd@gmail.com', '1234cd2')).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });

  test('Second true case', () => {
    const user = requestAuthRegisterV3('abcd@gmail.com', '1234cd2', 'John', 'Smith');
    expect(requestAuthLoginV3(user.token, 'abcd@gmail.com', '1234cd2')).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });

  test('Wrong email', () => {
    const user = requestAuthRegisterV3('abcd@gmail.com', '1234cd2', 'John', 'Smith');
    expect(requestAuthLoginV3(user.token, 'validmail@gmail.com', '123abc!@#')).toEqual(400);
  });

  test('Wrong password', () => {
    const user = requestAuthRegisterV3('validemail@gmail.com', '123abc!@#', 'John', 'Smith');
    expect(requestAuthLoginV3(user.token, 'validemail@gmail.com', '123bac!@#')).toEqual(400);
  });

  test('Wrong email and password', () => {
    const user = requestAuthRegisterV3('validemail@gmail.com', '123abc!@#', 'Jake', 'Renzella');
    expect(requestAuthLoginV3(user.token, 'validmail@gmail.com', '123bac!@#')).toEqual(400);
  });
});

describe('tests for authRegisterV1', () => {
  let user1: userType, user2: userType, user3: userType;
  let user1Profile: userDetails, user2Profile: userDetails, user3Profile: userDetails;
  test.each([
    { email: '123@gmail.com', password: '1234567', firstName: 'Aarya', lastName: 'Dave' },
    { email: 'aarya123@gmail.com', password: 'Aarya123$', firstName: 'Aerqiruqerqakdfja', lastName: 'Daafajavkewj' },
    { email: 'a123@gmail.com', password: 'Aarya123', firstName: 'Aarya', lastName: 'Dave' },
  ])('Edgecases of authRegisterV1 that should pass', ({ email, password, firstName, lastName }) => {
    // pass cases
    user1 = requestAuthRegisterV3(email, password, firstName, lastName);
    expect(user1).toStrictEqual({
      token: expect.any(String),
      authUserId: expect.any(Number)
    });
  });
  test.each([
    { email: 'c123@gmail.com', password: '123', firstName: 'Aarya', lastName: 'Dave' },
    { email: 'd123gmail.com', password: '1234567', firstName: 'Aaryafsljhkfshgjsfjkgjshgsjgkshgsjghslhgsjhgsflgjsljk', lastName: 'Dave' },
    { email: '123@gmail.com', password: '1234', firstName: 'Aarya', lastName: 'Aaryafsljhkfshgjsfjkgjshgsjgkshgsjghslhgsjhgsflgjsljk' },
    { email: '123@gmail.com', password: '1234', firstName: 'Aarya', lastName: '' },
  ])('Cases that of authRegisterV1 that should fail', ({ email, password, firstName, lastName }) => {
    // fail cases
    user1 = requestAuthRegisterV3(email, password, firstName, lastName);
    expect(user1).toStrictEqual(400);
  });
  test('repeated email', () => {
    requestAuthRegisterV3('123@gmail.com', '12345678', 'zack', 'aad');
    expect(requestAuthRegisterV3('123@gmail.com', '123456ewd', 'zacasd', 'andrew')).toStrictEqual(400);
  });
  test('multiple users with the same name handleStr', () => {
    user1 = requestAuthRegisterV3('123231@gmail.com', '12345678', 'people', 'people');
    user2 = requestAuthRegisterV3('ewfifide@gmail.com', 'bibfieinjewi', 'people', 'people');
    user3 = requestAuthRegisterV3('eadsaifide@gmail.com', 'bibfieinjewi', 'people', 'people');
    user1Profile = requestUserProfileV3(user1.token, user1.authUserId).user;
    user2Profile = requestUserProfileV3(user2.token, user2.authUserId).user;
    user3Profile = requestUserProfileV3(user3.token, user3.authUserId).user;
    expect(user1Profile.handleStr).toEqual('peoplepeople');
    expect(user2Profile.handleStr).toEqual('peoplepeople0');
    expect(user3Profile.handleStr).toEqual('peoplepeople1');
  });
});

describe('AuthLogout', () => {
  let user1: userType, user2: userType;
  beforeEach(() => {
    requestClear();
    user1 = requestAuthRegisterV3('abcd@gmail.com', '1234cd2', 'John', 'Smith');
    user2 = requestAuthLoginV3(user1.token, 'abcd@gmail.com', '1234cd2');
  });

  test('invalid token general', () => {
    const invalidToken = 'invalidtoken';
    const result = requestAuthLogoutV2(invalidToken);
    expect(result).toEqual(403);
  });

  test('invalid token', () => {
    let invalidToken = ' ';
    let result = requestAuthLogoutV2(invalidToken);
    expect(result).toEqual(403);
    invalidToken = '1';
    result = requestAuthLogoutV2(invalidToken);
    expect(result).toEqual(403);
  });

  test('success case where checking two different tokens from register and login', () => {
    expect(requestAuthLogoutV2(user2.token)).toEqual({});
    expect(requestUserProfileV3(user2.token, user1.authUserId)).toEqual(403);
    expect(requestUserProfileV3(user1.token, user1.authUserId)).toEqual({
      user: {
        uId: expect.any(Number),
        nameFirst: 'John',
        nameLast: 'Smith',
        email: 'abcd@gmail.com',
        handleStr: 'johnsmith'
      },
    });
  });

  test('success case using authlogin', () => {
    expect(requestAuthLogoutV2(user2.token)).toEqual({});
    expect(requestAuthLogoutV2(user2.token)).toEqual(403);
    expect(requestAuthLogoutV2(user2.token)).toEqual(403);
  });
});
