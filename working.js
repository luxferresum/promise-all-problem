const dns = require('dns');
const ping = require('net-ping');

var traceRoute = (host, ttl, interval, duration) => {

    var session = ping.createSession({
        ttl:ttl,
        timeout: 5000
    });

    var times = new Array(ttl);
    for (var i=0; i<ttl; i++){
        times[i] = {'ttl': null, 'ipv4': null, 'hostnames': [], 'times': []}
    };

    var feedCb = (error, target, ttl, sent, rcvd) => {
        var ms = rcvd - sent;
        if (error) {
            if (error instanceof ping.TimeExceededError) {
                times[ttl-1].ttl = ttl;
                times[ttl-1].ipv4 = error.source;
                times[ttl-1].times.push(ms)
            } else {
                console.log(target + ": " +
                error.toString () +
                " (ttl=" + ttl + " ms=" + ms +")");
            }
        } else {
            console.log(target + ": " +
            target + " (ttl=" + ttl + " ms=" + ms +")");
        }
    }

    var proms = new Array();
    var complete = 0

    while(complete < duration){
        proms.push(
            new Promise((res, rej) => {
                setTimeout(function(){
                    session.traceRoute(
                        host,
                        { maxHopTimeouts: 5 },
                        feedCb,
                        function(e,t){
                            console.log('traceroute done: resolving promise')
                            res();  // resolve inner promise
                        }
                    );
                }, complete);
            })
        )
        complete += interval;
    }

    return Promise.all(proms)
    .then(() => {
        console.log('resolving traceroute');
        return times.filter((t)=> t.ttl != null);
    });
}


traceRoute('195.146.144.8', 20, 500, 5000)
.then( (times) => console.log(times) )