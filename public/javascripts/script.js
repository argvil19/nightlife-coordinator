var degs = 0;
var w;
var timer;
var lastText;

function changeBackground() {
	var bgActive = checkActive();
	var bgValue = bgActive.getAttribute('value');
	var bgNext = parseInt(bgValue) + 1;

	if (bgNext === 3) {
		bgNext = 0;
	}

	$(bgActive).animate({
		opacity:0
	}, 1500).attr('active', '0');
	$(document.getElementsByClassName('bg')[bgNext]).animate({
		opacity:1
	}, 1500).attr('active', '1');

	return bgNext;
}

function checkActive() {
	var items = $('.bg');

	for (var i=0;i<items.length;i++) {
		if (items[i].getAttribute('active') === '1') {
			return items[i];
		}
	}
}

function loading() {
	var div = $('.loading');
	var icon = $('<i/>').addClass('glyphicon glyphicon-globe').attr('id', 'load');
	var p = $('<p/>').html('Wait while we do the nasty job.');

	div.append(icon).append(p);

	window.intervals = setInterval(rotateIcon, 40);
}

function rotateIcon() {
	var i = $('#load');
	i.css('transform','rotate('+degs+'deg)');
	degs += 5;
}

function search(e) {
	var searchString = $('#searchInput').val();

	$('.loading').empty();
	$('.row').empty();

	loading();

	$.get('/search?place=' + searchString, function(data) {
		var total = data.data.businesses.length;
		var count = 0;
		var row = $('<div/>').addClass('row');

		for (var i=0;i<total;i++) {
			
			var adiv = $('<a/>').attr('href', data.data.businesses[i].url).addClass('col-sm-12 col-xs-12  col-md-12 col-lg-12 item').html('<img src="'+ data.data.businesses[i].image_url + '" class="img-item img-responsive" /><p class="item-title"><strong><span>'+ data.data.businesses[i].name +'</span></strong></p><br/><img class="img-responsive rating" src="' + data.data.businesses[i].rating_img_url_large +'" />Rating: <strong>' + data.data.businesses[i].rating +'</strong><br/><strong>' + data.data.businesses[i].location.display_address[0] + ', ' + data.data.businesses[i].location.display_address[1] + '</strong>');
			
			if (data.user) {
				var adiv = $('<a/>').attr('href', data.data.businesses[i].url).addClass('col-sm-12 col-xs-12  col-md-12 col-lg-12 item').html('<img src="'+ data.data.businesses[i].image_url + '" class="img-item img-responsive" /><p class="item-title"><strong><span>'+ data.data.businesses[i].name +'</span></strong></p><br/><img class="img-responsive rating" src="' + data.data.businesses[i].rating_img_url_large +'" />Rating: <strong>' + data.data.businesses[i].rating +'</strong><br/><strong>' + data.data.businesses[i].location.display_address[0] + ', ' + data.data.businesses[i].location.display_address[1] + '</strong><br/><a class="btn btn-warning btnGoing" href="#">' + data.data.businesses[i].going + ' Going tonight</a>');
				if (data.data.businesses[i].markActive) {
					var adiv = $('<a/>').attr('href', data.data.businesses[i].url).addClass('col-sm-12 col-xs-12  col-md-12 col-lg-12 item').html('<img src="'+ data.data.businesses[i].image_url + '" class="img-item img-responsive" /><p class="item-title"><strong><span>'+ data.data.businesses[i].name +'</span></strong></p><br/><img class="img-responsive rating" src="' + data.data.businesses[i].rating_img_url_large +'" />Rating: <strong>' + data.data.businesses[i].rating +'</strong><br/><strong>' + data.data.businesses[i].location.display_address[0] + ', ' + data.data.businesses[i].location.display_address[1] + '</strong><br/><a class="btn btn-warning btnGoing notGoing" href="#">I\'m not going (' + data.data.businesses[i].going + ' currently going)</a>');
				}
			}
			row.append(adiv);
			count++;
			if (count === 3) {
				$('.rows').append(row);
				count = 0;
				row = $('<div/>').addClass('row');
			}
			if (count < 3 && i+1===total) {
				$('.rows').append(row);
			}
		}

		$('.loading').empty();
		clearInterval(window.intervals);
		$('.btnGoing').mouseenter(enterGoingBtn);
		$('.btnGoing').mouseleave(outGoingBtn);
		$('.btnGoing').click(sendVote);
		$('.notGoing').off('mouseenter');
		$('.notGoing').off('mouseleave');
	});
	return false;
}

function openPopUpTwitter(e) {
	e.preventDefault();
	w = window.open("/auth/twitter", "_blank", "scrollbars=1,resizable=1,height=300,width=450");

	timer = setInterval(function() {
		if (w.closed) {
			handleAuth();
			clearInterval(timer);
		}
	}, 500);
  		
}

function handleAuth() {
	$.get('/auth/twitter/info', function(res) {
		var h3 = $('<h3/>').html('Connected as:');
		h3.insertAfter($('#btnTwitter'));
		$('#btnTwitter').remove();
		var avatar = $('<img/>').addClass('img-responsive user').attr('src', res.photos[0].value);
		var username = $('<p/>').addClass('user user-text').html(res.username);
		$('.userdiv').append(avatar).append(username);
	});
}

function enterGoingBtn(e) {
	e.preventDefault();
	lastText = $(e.target).html();
	$(e.target).html("I'M GOING TONIGHT");
}

function outGoingBtn(e) {
	e.preventDefault();
	$(e.target).html(lastText);
}

function sendVote(e) {
	e.preventDefault();
	var name = e.target.parentElement.firstChild.nextSibling.firstChild.firstChild.innerHTML;
	if (e.target.innerHTML.indexOf('not') != -1) {
		$.post('/going', {name:name, notGoing:1}, function(res) {
			$(e.target).on('mouseenter', enterGoingBtn);
			$(e.target).on('mouseleave', outGoingBtn);
			e.target.innerHTML = res.total + " Going tonight";
		});
	} else {
		$.post('/going', {name:name}, function(res) {
			$(e.target).off('mouseenter');
			$(e.target).off('mouseleave');
			e.target.innerHTML = "I'm not going (" + res.total + " currently going)";
		});
	}
}

$(document).ready(function() {
	setInterval(changeBackground, 5000);
	$('#searchForm').submit(search);
	$('#btnTwitter').on('click', openPopUpTwitter);
});