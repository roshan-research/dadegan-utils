$(document).ready(function() {
	$('#results-area .verb-valency-analysis .valency span')
	.hover(function(e){ //Enters
		var cl = $(this).attr('class');
		var pr = $(this).parent().parent();
		var spans = pr.find('div.example span.' + cl);
		spans.css('background-color', 'rgba(30,0,100, 0.5)');
		addcolor(e);
	}
	, function(e){ //Exits
		var cl = $(this).attr('class');
		var pr = $(this).parent().parent();
		var spans = pr.find('div.example span.' + cl);
		spans.css('background-color', '');
		substractcolor(e);
	});
});

var addcolor = function(color){
	alert('enter');
}

var substractcolor = function(color) {
	alert('exit');
}