```javascript
let data = {
    users: {
        'lastId' : 1,
        'existing_handleStr' : {},
        '123@gmail.com' : {
            userId: 0,
            firstName: 'Peter',
            lastName: 'Griffin',
            email: 'PeterGriffin@gmail.com',
            password: '1234567879',
            handleStr: 'petergriffin',
            role: 'owner',
        }
    },

    channels: [
        {
            channelId: 0,
            name: 'Channel2',
            isPublic: true,
            users_in_channel: [1, 2, 3],
            messages = [{
                message : 'hello',
                data : Date()
            }]
        }
    ],
    // TODO: insert your data structure that contains 
    // users + channels here
}
```

[Optional] short description: Separated into three different objects, 
where messages link both the user and channels together
