async function test() {
    const options = {
        method: 'GET',
        headers: {
          accept: 'application/json',
          Authorization: 'Bearer 3CADCF4BE190A2314CFB7F31430BA8D780A01050A827BDF45E534C59281BBB28CA024E98C5C9C6DC2C5FAC45BABC862A23EA338EF70CAAD686208895C8441897A17D7B2FA1B96CF95469F514B30135A2A49D3420B43C5F274B9ADBB0DC21340540F557AE63921B7FD45B5D9E284FF4B4F4ACC101475043AA595267DACE'
        }
      };
      
      fetch('https://streamlabs.com/api/v2.0/user', options)
        .then(res => res.json())
        .then(res => console.log(res))
        .catch(err => console.error(err));
}