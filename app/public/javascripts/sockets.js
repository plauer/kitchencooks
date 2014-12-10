$( document ).ready(function() {

  var socket = io.connect('http://localhost');

  socket.on('news', function (data) {
    console.log(data);
    socket.emit('my other event', { my: 'data' });
  });


  var rtc = holla.connect();
  rtc.register("chris", function(worked) {
    holla.createFullStream(function(err, stream) {
      var call = rtc.call("tsahi");
      call.addStream(stream);
      holla.pipe(stream, $("#myVideo"));

      call.on("answered", function() {
        console.log("Remote user answered the call");
      });

      console.log("Calling ", call.user);
    });
  });

  var rtc = holla.connect();
  rtc.register("tsahi", function(worked) {
    rtc.on("call", function(call) {
      console.log("Inbound call from ", call.user);
      holla.createFullStream(function(err, stream) {
        call.addStream(stream);
        call.answer();
        holla.pipe(stream, $("#myVideo"));

        call.ready(function(stream) {
          holla.pipe(stream, $("#theirVideo"));
        });
      });
    });
  });
})

