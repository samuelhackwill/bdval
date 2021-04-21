import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';
import { Session } from 'meteor/session';
import './main.html';
import '../lib/router.js';
import { FlowRouter } from 'meteor/ostrio:flow-router-extra';
import { Popularity } from '../imports/popularity.js'
import { Meteor } from 'meteor/meteor';

//NB : i still don't understand imports

stripe = ""
pageNmbr = 1

function loadJS(src){
	var ref = window.document.getElementsByTagName("script")[0];
	var script = window.document.createElement("script");
	script.src = src 
	script.async = true;
	ref.parentNode.insertBefore(script, ref);

}

function scrollTo(offset, callback) {
    const fixedOffset = offset.toFixed(),
        onScroll = function () {
            if (window.pageYOffset.toFixed() === fixedOffset) {
                window.removeEventListener('scroll', onScroll)
                callback()
            }
        }

    window.addEventListener('scroll', onScroll)
    onScroll()
    window.scrollTo({
        top: offset,
        behavior: 'smooth'
    })
}

function goToNextPage(next){
	if(next){
		pnumber = Number(FlowRouter.getParam("page"))
	  	pnumber = pnumber +1
	  	pageNmbr = pnumber
		FlowRouter.go('/reader/'+pnumber);  
	}else{
		pnumber = Number(FlowRouter.getParam("page"))
	  	pnumber = pnumber -1
	  	pageNmbr = pnumber
		FlowRouter.go('/reader/'+pnumber);  
	}
}


Template.reader.onCreated(function(){
	this.autorun(() => {
	  this.subscribe('popularity');
	});

	// Session.set("attachedERR", false)
})


Template.nav.onRendered(function(){
	document.getElementById("banierecontainer").style.opacity=1;
});

Template.nav_mobile.onRendered(function(){
	document.getElementById("banierecontainerM").style.opacity=1;
});


Template.reader.onRendered(function(){

	console.log("RENDERED")

	// if(Session.get("attachedERR")){		
	// 	//this looked like a tricky blaze error so i prefer just doing that.
	// 	locataion.reload()
	// }

	if (isMobile()) {
		document.getElementById("VContainer").style.opacity="1"
	}else{
		document.getElementById("HContainer").style.opacity="1"
	}

	pageNmbr = Number(FlowRouter.getParam("page"))

	// console.log("rendered!, querying the dom")

	var img = document.querySelector('img')
	// get the image

	img.addEventListener('load', loaded)
	img.addEventListener('error', function() {
	  console.log("something went wrong when loading the image!")
	})
});

Template.reader.helpers({
  page(){
  	// if flowrouter isn't ready if throws an ugly error
    return "/strips/"+FlowRouter.getParam("page")+".gif"
  },

  ifNotFirstPage(){
  	if (FlowRouter.getParam("page")==1) {
  		return "opacity:.2;pointer-events:none;"
  	}
  },

  ifNotLastPage(){
  	if (FlowRouter.getParam("page")==92) {
  		return "opacity:.2;pointer-events:none;"
  	}
  },

  popEmoji(){
 	
	if (!Template.instance().subscriptionsReady()) {
		return "?"
	}else{
 		whatpage = Number(FlowRouter.getParam("page"))
		whatPopularity = Popularity.findOne({"page":whatpage}).pop
	  	
	  	if(whatPopularity<20){
	  		return "💖"
	  	}else{
	  		if(whatPopularity<100){
		  		return "✍️"
		  	}else{
		  		if(whatPopularity<300){
		  			return "👷"
			  	}else{
			  		if(whatPopularity<1000){
			  			return "🍟"
			 		}else{
			 			return "🏆"
			 		}
		  	    }
		  	}
	  	}
    }

  },

  popCount(){

	whatpage = Number(FlowRouter.getParam("page"))

	if (!Template.instance().subscriptionsReady()) {
		return "?"
	}else{
	  	return Popularity.findOne({"page":whatpage}).pop
	}
  },

  popText(){

  	if (!Template.instance().subscriptionsReady()) {
		return "?"
	}else{
 		whatpage = Number(FlowRouter.getParam("page"))
		whatPopularity = Popularity.findOne({"page":whatpage}).pop
	  	
	  	if(whatPopularity<20){
	  		return "salut les twittos"
	  	}else{
	  		if(whatPopularity<100){
		  		return "éducation nationale"
		  	}else{
		  		if(whatPopularity<300){
		  			return "travailleur du clic"
			  	}else{
			  		if(whatPopularity<1000){
			  			return "friterie barrière"
			 		}else{
			 			return "maximum."
			 		}
		  	    }
		  	}
	  	}
    }

  }
});


Template.nav.helpers({
	activeLink(arg){
		currentRoute = FlowRouter.getRouteName()
		domelem = arg.hash.arg

		if(domelem == currentRoute){
			return "opacity:.2; pointer-events:none"
		}else{
			return
		}
	}
})

Template.nav_mobile.helpers({
	activeLink(arg){
		currentRoute = FlowRouter.getRouteName()
		domelem = arg.hash.arg

		if(domelem == currentRoute){
			return "opacity:.2; pointer-events:none"
		}else{
			return
		}
	}
})

Template.nav_mobile.events({
	"click .baniereBtnM"(event){
		if(event.target.innerHTML=="reader"){
			FlowRouter.go("/reader/"+pageNmbr)
		}else{
			FlowRouter.go("/"+event.target.innerHTML)
		}
	}
})


Template.nav.events({
	"click .baniereBtn"(event){
		// console.log("going to reader ",pageNmbr)
		if(event.target.innerHTML=="reader"){
			FlowRouter.go("/reader/"+pageNmbr)
		}else{
		FlowRouter.go("/"+event.target.innerHTML)
		}
	}
});


Template.reader.events({
	'click #like' (event){
		whatPopularity = Popularity.findOne({"page":whatpage}).pop
		
		if(whatPopularity<1000){
			Meteor.call("addPopularity", Number(FlowRouter.getParam("page")))
		}else{
			return
		}
	},


  'click #previous'(event) {
	pnumber = Number(FlowRouter.getParam("page"))
  	pnumber = pnumber -1
  	pageNmbr = pnumber

	FlowRouter.go('/reader/'+pnumber);  
	},  

	'click #next' (event) {
	pnumber = Number(FlowRouter.getParam("page"))
	pnumber = pnumber +1
	pageNmbr = pnumber
	FlowRouter.go('/reader/'+pnumber);  
	},

  'click #previousBot'(event) {
  	document.getElementById("illustration").style.opacity="0"
  	scrollTo(0,function(){goToNextPage(false)})
	},  

	'click #nextBot' (event) {
  	document.getElementById("illustration").style.opacity="0"
  	scrollTo(0,function(){goToNextPage(true)})
	},
});



Template.cart.helpers({
  // status() {
  //   return Session.get('StripeId').id
  // },

  price(arg){

		//to include shipping

	domArg = Number(arg.hash.arg)

	if(Session.get("shippingTo")=="fr"){
		return domArg
	}else{
		return domArg+6
	}

  },

});


Template.cart.events({
  'click button'(event, instance) {

	stripe = Stripe('pk_live_7yMO32WWI4vUqHXzTP5lwSJQ00djpFOOEl')

	_price = ""
	CountriesArray = []

	if(Session.get("shippingTo")=="fr"){
		// shippingto fr veut en fait dire "no shipping"
		CountriesArray = []
	}else{
		CountriesArray = ["FR", "BE","GB", "NL", "DE", "AT", "CH", "IT", "US", "CA", "TH"]
	}

  	// console.log("oooh going to checkout!", event.target.parentNode.id)

  	if(event.target.parentNode.id=="item1"){
  		if(Session.get("shippingTo")=="fr"){
  			// cahier poster main propre (19)
  			_price = "price_1Huem5LJgVBQ38sWYDyt9IP4"
  		}else{
  			// cahier poster + livraison internationale (25)
  			_price = "price_1HuemHLJgVBQ38sW0xuHhA3z"
  		}
  	}else{
  		if(Session.get("shippingTo")=="fr"){
  			// cahier poster + DEDICAC main propre (29)
  			_price = "price_1Hueh0LJgVBQ38sWhjxp7Nqz"
  		}else{
  			// cahier poster + DEDICAC + livraison internationale (35)
  			_price = "price_1HuehJLJgVBQ38sWmQkoHLa0"
  		}
  	}

	stripe.redirectToCheckout({
	  // Make the id field from the Checkout Session creation API response
	  // available to this file, so you can provide it as parameter here
	  // instead of the {{CHECKOUT_SESSION_ID}} placeholder.
	  // sessionId: Session.get('StripeId').id,
		lineItems:[{price:_price,quantity:1},],
		shippingAddressCollection:{
			allowedCountries:CountriesArray,
		},
		mode: 'payment',
		successUrl: 'https://bdval.shh.ovh/success',
		// successUrl: 'https://bdval.shh.ovh/success/{CHECKOUT_SESSION_ID}',
		cancelUrl: 'https://bdval.shh.ovh/cancel',

	}).then(function (result) {
	  // If `redirectToCheckout` fails due to a browser or network
	  // error, display the localized error message to your customer
	  // using `result.error.message`.
	});


  },

    'click input'(event, instance) {
		Session.set("shippingTo", event.target.id)
	}
});


Template.mainLayout.onCreated(async function cartOnCreated() {

	loadJS("https://js.stripe.com/v3/")

	Session.set("shippingTo", "")

	// console.log("async function firing");
	// Session.set('StripeId', 'Looking...');
	// Session.set('StripeId', await Meteor.callPromise('MakeCheckoutSession'));
});

// window.onerror = function(message, source, lineno, colno, error) { 

// message :
	//FF : Error: Must be attached
	//CHROME : Uncaught Error: Must be attached

	// console.log(/^.+Must be attached/.test(message))
	// console.log("message ", message)
	// console.log("error ", error)

	// if (/^.+Must be attached/.test(message)){
	// 	Session.set("attachedERR", true)
	// }else{
	// 	return
	// }
// };

function loaded() {
// when image is loaded, show the reader
  console.log("image loaded!")		
  document.getElementById("illustration").style.opacity="1"
}

