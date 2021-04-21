import { Meteor } from 'meteor/meteor';
import { Stripe }  from 'stripe';
import { Promise } from 'meteor/promise';
import { WebApp } from 'meteor/webapp';
import '../imports/popularity.js'
import { Popularity } from '../imports/popularity.js'

// this was removed for security reasons prior to pushing to github.
const stripe = require('stripe')('get_a_new_secret_key_in_the_stripe_dashboard');

// SEO BELOW
// making routes and building headers for crawlers & bots.

Meteor.publish('popularity', function popularity() {
  return Popularity.find({});
});


const serverRendering = (req, res, next) => 
{

	// can get the useragent this way
	rootUrl = "https://bdval.shh.ovh"
	timestamp = new Date()
	// page = req.url
	// console.log("serverRendering launching ", req.headers['user-agent'])
	console.log(timestamp.getHours() + ":" + timestamp.getMinutes() + ":" + timestamp.getSeconds())
	// console.log("full REQ ", req)
	console.log("REQ url ", req.url)
	
	// console.log("which page svp? ", page)
	// i guess i can get the URL this way?
    try 
    {
	    const ua = req.headers['user-agent'];

	    if (/bot|whatsapp|facebook|twitter|pinterest|google|baidu|bing|msn|duckduckgo|teoma|slurp|yandex/i.test(ua)) 
	    {

			if(req.url!=="/"){
				console.log("not accessing root")
				zob = req.url
				console.log("page number", zob.substring(8))
				page = zob.substring(8)
			}else{
				// show page 1 preview for root
				console.log("accessing root! page 1")
				page = "1"
			}

			console.log("THATS A BOT, user agent : ", ua)
	      // Send any non matches forward
	      // if (!pathName.includes('/')) 
	      // {
	      // 	console.log("don't know what should be happening here")
	      //   next();
	      // }

	    //   if(/facebook/i.test(ua)){
	    //   	//facebook motherfuckers
		   //    const html = `
		   //      <!html>
		   //      <head>
		   //        <title>la bd de samuel</title>
		   //        <meta property="og:image" content="${rootUrl}/preview/32.jpg"/>
		   //        <meta property="og:image:url" content="${rootUrl}/preview/32.jpg"/>
		   //        <meta property="og:image:secure_url" content="${rootUrl}/preview/32.jpg"/>
		   //        <meta property="og:image:type" content="image/jpeg"/>
		   //        <meta property="og:image:width" content="643" />
					// <meta property="og:image:height" content="643" />
		   //        <meta property="og:url" content=${rootUrl}/>
		   //        <meta property="og:type" content="website"/>
		   //        <meta property="og:description" content="J'ai fait une bd qui 
		   //        parle des six mois que j'ai passés à Valenciennes, 
		   //        dans le nord de la France."/>
		   //        <meta property="og:title" content="la bd de samuel"/>
		   //    `;


		   //    res.statusCode = 200;
		   //    res.setHeader('Content-Type', 'text/html');
		   //    res.end(html);

	    //   }else{
		      const html = `
		        <!html>
		        <head>
		          <title>la bd de samuel, page ${page}</title>
		          <meta property="og:image" content="${rootUrl}/preview/${page}.jpg"/>
		          <meta property="og:image:url" content="${rootUrl}/preview/${page}.jpg"/>
		          <meta property="og:image:secure_url" content="${rootUrl}/preview/${page}.jpg"/>
		          <meta property="og:image:type" content="image/jpeg"/>
		          <meta property="og:image:width" content="643" />
					<meta property="og:image:height" content="643" />
		          <meta property="og:url" content=${rootUrl}/>
		          <meta property="og:type" content="website"/>
		          <meta property="og:description" content="J'ai fait une bd qui parle des six mois que j'ai passés à Valenciennes, dans le nord de la France."/>
		          <meta property="og:title" content="la bd de samuel, page ${page}"/>
		      `;


		      res.statusCode = 200;
		      res.setHeader('Content-Type', 'text/html');
		      res.end(html);
	  	  // }
	    } else {
	      console.log("not a bot, carry on")
	      next();
	    }
	} catch (err) {
    console.log(err);
  }
}

// attach the handler to webapp
WebApp.connectHandlers.use(serverRendering);

// ________________________________________________________
// ________________________________________________________
// ________________________________________________________

Meteor.startup(() => {
	// fixtures here

	if(Popularity.findOne()==undefined){
		for (var i = 90 ; i >= 0; i--) {
			Popularity.insert({page:i, pop:0})
		}
	}
});

Meteor.methods({

	addPopularityObject(index){
		Popularity.insert({page:index, pop:0})	
	},

	salutatoijeuneentrepreneur(){
		Popularity.remove({})
	},

	addPopularity(_page){
		__id = Popularity.findOne({"page":_page})._id
		newpop = Popularity.findOne(__id).pop+1
		Popularity.update(__id, {$set:{"pop":newpop},})

	},

// STRIPE Below (for $$$)

	async MakeCheckoutSession() {
	    try {
	      return await stripe.checkout.sessions.create({
	      	  billing_address_collection:'required',
			  payment_method_types: ['card'],
			  line_items: [{
			    price: 'price_1GpxhRLJgVBQ38sWdB9Y7UUe',
			    // 10EUR
			    quantity: 1,
			  }],
			  mode: 'payment',
			  success_url: 'http://192.168.0.251:3000/success/{CHECKOUT_SESSION_ID}',
			  cancel_url: 'http://192.168.0.251:3000/cancel',
			});
	    }
	    catch (e) {
	      console.log('Promise failed', e);
	      throw new Meteor.Error(500, 'There was an error processing your request');
	    }
	  },
});
// ________________________________________________________
// ________________________________________________________
// ________________________________________________________

Meteor.onConnection(() => {

});

