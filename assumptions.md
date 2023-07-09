1. For function channelMessagesV1, the start must be greater than or equal to 0, if not an error message is returned.
2. For function channelsListV1, the order of channels array should be arranged by the order of input.
3. The channels are identified by their channelId so it possible to have multiple channels with the same name (as the Id is unique).
4. The channels array returned by the function channelsListAllV1 is sorted by the channel creation time.
5. The person who creates a channel becomes the owner of it.
6. There isn't a maximum number of users allowed in a channel.