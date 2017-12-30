//rip
const request       = require('request');
const chalk         = require('chalk');
const config        = require('./config.json');
const faker         = require('faker');
const cheerio       = require('cheerio');
const fs            = require('fs');
let proxyList       = [];

/* -- Thanks to @hunterbdm for this -- */
function formatProxy(proxy) {
    if (proxy && ['localhost', ''].indexOf(proxy) < 0) {
        proxy = proxy.replace(' ', '_');
        const proxySplit = proxy.split(':');
        if (proxySplit.length > 3)
            return "http://" + proxySplit[2] + ":" + proxySplit[3] + "@" + proxySplit[0] + ":" + proxySplit[1];
        else
            return "http://" + proxySplit[0] + ":" + proxySplit[1];
    }
    else
        return undefined;
}
/* -- Thanks to @hunterbdm for this -- */
function getRandomArbitrary(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
return Math.floor(Math.random() * (max - min)) + min;
}



function boot(){
  /* -- This too -- */
  const proxyInput = fs.readFileSync('proxies.txt').toString().split('\n');
      for (let p = 0; p < proxyInput.length; p++) {
        proxyInput[p] = proxyInput[p].replace('\r', '').replace('\n', '');
        if (proxyInput[p] != '')
            proxyList.push(proxyInput[p]);
    }
    console.log('Found ' + proxyList.length + ' proxies.');
    //flex
    console.log(chalk.green('Papa Johns Pizza Script ---- Twitter.com/allen56_'));
    console.log(chalk.green('------------------------------------------------------'))
    for (var i = 0; i < config.Codes; i++) {
      get()
    }
}

function get() {
    let session = request.jar()
    let opts    = {
        url     : config.Homepage,
        method  : 'get',
        gzip    : true,
        jar     : session,
        headers : {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/61.0.3163.100 Safari/537.36'
        },
        proxy   : formatProxy(proxyList[Math.floor(Math.random() * proxyList.length)])
    }


    request(opts, function(error, response, body) {
        if(error) {
            console.log(chalk.red('Errror' + error))
        } else if(response.statusCode == 200) {
            console.log('Connected to homepage, scraping form action.')
            let $ = cheerio.load(body);
            //There's def a better way to scrape this but I cba so lmao
            let action = ($('body > div > section.centered.banner.banner--dark.banner--passthepizza.paragraph-text.spacing-bottom-med > div > div > form').attr('action'));
            if (!action) {
              console.log('Page not available, try again later.')
              process.exit();
            } else if (action.length > 0) {
              return post(session,action)
            } else {
              console.log('Page not available, try again later.')
              process.exit();
            }

        } else {
            console.log(chalk.red('unexpected error'))
        }
    })
}
function getEmail() {
  //Need to add Gmail support
  const emailSplit = config.Email.split('@');
  var username = emailSplit[0];
  const usernameLength = emailSplit[0].length;
  var numPeriods = getRandomArbitrary(1,usernameLength);
  for (i = 0; i < numPeriods; i++) {
    var periodPosition = getRandomArbitrary(1,username);
    username = username.substring(0,periodPosition) + '.' + username.substring(periodPosition, username.Length);
  }
  return username + '@' + emailSplit[1];
}

function post(session,action) {
    let fname = getEmail();
    let payload = {
      'email': fname
    }
    console.log('Submitting with ' + fname);
    let opts = {
        url     : action,
        method  : 'post',
        gzip    : true,
        jar     : session,
        headers : {
          "Accept"          :"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
          "Accept-Encoding" :   "gzip, deflate",
          "Accept-Language" :   "en-US,en;q=0.9",
          "Cache-Control"   :   "no-cache",
          "Connection"      :   "keep-alive",
          "Content-Type"    :   "application/x-www-form-urlencoded"
        },
        proxy   : formatProxy(proxyList[Math.floor(Math.random() * proxyList.length)]),
        form    : payload
    };
    request(opts, function(error, response, body) {
        if (error) {
            console.log('Form submission failed: ' + error)
        } else if(response.statusCode == 200 && body.indexOf('Congrats on getting a free pizza!') > -1) {
          console.log(chalk.green('Pizza Passed! Check your email for the code.'))
        } else {
            console.log('Form submission failed: ' + response.stausCode)
        }
    })

}
boot()
