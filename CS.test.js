require('dotenv').config()
const cloudstack = require('./lib/cloudstack.js');

client = new cloudstack({
  apiUri: process.env.CLOUDSTACK_API_URI,
  apiKey: process.env.CLOUDSTACK_API_KEY,
  apiSecret: process.env.CLOUDSTACK_API_SECRET,
});

describe('Zone functions', () => {
  test('listZones', done => {
    client.exec('listZones', {}, (result) => {
      expect(result.zone).toBeDefined()
      done();
    })
  })
})

describe('List functions', () => {
  test('listVirtualMachines', done => {
    client.exec('listVirtualMachines', {}, (result => {
      expect(result.virtualmachine).toBeDefined();
      done();
    }))
  })
})

describe('List functions (fetch_list)', () => {
  test('listVirtualMachines', done => {
    client.exec('listVirtualMachines', {fetch_list: true}, (result => {
      expect(result.virtualmachine.length).toEqual(result.count);
      done();
    }))
  })
})