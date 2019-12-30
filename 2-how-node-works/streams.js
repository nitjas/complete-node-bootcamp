// read a large text file from fs and send to client
const fs = require('fs');
// Trick alert! create server on the created http object in one go
const server = require('http').createServer();

server.on('request', (req, res) => {
  // Solution 1: Read file into a variable and send it to client
  // node will have to load the entire file in memory and only then send the data
  // node process will run out of resources
  // not good for production ready code
  //   fs.readFile(`${__dirname}/starter/test-file.txt`, (err, data) => {
  //     if (err) console.log(err);
  //     res.end(data);
  //   });
  // Solution 2: Streams
  // we don't need to read the data from a file into a variable (data) and having to store that into memory
  // create a readable stream, then as you receive each chunk of data we send it to the client as a response which is a writable stream
  const readable = fs.createReadStream(`${__dirname}/starter/test-file.txt`);
  //   readable.on('data', chunk => {
  //     res.write(chunk); // response is a writable stream, send every single peice of data into that stream with the write method
  //     // Effectively streaming the content from the file right to the client
  //   });
  //   readable.on('end', () => {
  //     res.end(); // calling end on response stream
  //     // end() method signals that no more data will be written to this writable stream
  //     // not passing anything into this end() as we already sent everything chunk by chunk
  //     // when the readable stream is finished reading, we only need to signal we are ready using end()
  //     // always use the data and end event one after another as here otherwise the response will never be sent to the client
  //   });
  //   readable.on('error', err => {
  //     console.log(err);
  //     res.statusCode = 500; // usually set to 200 OK
  //     res.end('File not found!');
  //   });
  // Works, but there is still a problem
  // readable stream to read file from disk is much faster than sending the result with the response writable stream over the network
  // will overwhelm the response stream which cannot handle all this incoming data so fast
  // this problem is called back pressure
  // response cannot send the data nearly as fast as it is receiving it from the file
  // Solution 3
  // The secret is to use the pipe() operator
  // pipe() operator is available for all readable streams and it allows us to pipe the output of a readable stream right into the input of a writable stream- fixes the problem of back pressure
  // automatically the speed of the data coming in and the data going out
  readable.pipe(res);
  // readableSource.pipe(writableDestination) - writableDestination can be duplex or transform stream as well
  // pipe operator automatically solves the problem of back pressure, it is an elegant and straightforward solution
  // pipe is easiest way of consuming and writing streams unless we need more customisation
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening..');
});
