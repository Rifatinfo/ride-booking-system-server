import { createClient } from 'redis';

const client = createClient({
    username: 'default',
    password: 't90Vn1aJe3sNp1uqiRoz3zWRmf7m6xQ4',
    socket: {
        host: 'redis-18437.c98.us-east-1-4.ec2.redns.redis-cloud.com',
        port: 18437
    }
});

client.on('error', err => console.log('Redis Client Error', err));

//  await client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar
 
