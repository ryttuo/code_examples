grinders.lineups = {};
grinders.lineups.research = function() {
	var container = $('#lineups-research-container');
	var anchors = $('#lineups-research-nav a');
	var sites = $('#lineups-research-sites');
	var sports = $('#lineups-research-sports');
	var mask = $('#lineups-research-mask');
	var filters = $('#filter-lineups');

	var deactivate = function(anchor) {
		if($(anchor).hasClass('active')) {
			return;
		}
		$(anchor).closest('ul').find('li.active').removeClass('active').find('a').removeClass('active');
	};

	var activate = function(anchor) {
		if($(anchor).hasClass('active')) {
			return;
		}
		$(anchor).addClass('active').closest('li').addClass('active');
	};

	var activeSiteId = function() {
		var activeSiteAnchor = $('li.active a', sites);
		return activeSiteAnchor.attr('data-name');
	};
	
	var activeSportId = function() {
		var activeSportAnchor = $('a.active', sports);
		return activeSportAnchor.attr('data-name');
	};

	var updatePageTitle = function() {
		var active_sport = activeSportId();
		switch (active_sport) {
			case '1':
				document.title = 'NFL Lineups';
				break;
			case '2':
				document.title = 'MLB Lineups - Daily Starting Lineups';
			break;
		}
	};

	$('a', sites).click(function() {
		if($(this).hasClass('active') || container.hasClass('working')) {
			return;
		}
			
		deactivate(this);
		activate(this);
		
		updateLineups(this);
		return false;
	});

	$('a', sports).click(function() {
		if($(this).hasClass('active') || container.hasClass('working')) {
			return;
		}
			
		deactivate(this);
		activate(this);		
		updateLineups(this);
		
		return false;
	});

	$('.filter-cont a.position', filters).live('click', function() {

		if($(this).hasClass('selected-pos')) {
			$(this).removeClass('selected-pos');

		}else{
			$(this).addClass('selected-pos');
		}

		$(".lineup-list").find('.selected').removeClass('selected');
		var pos = new Array();

		$('.filter-cont a.position').each(function(){


			if($(this).hasClass('selected-pos')){

				var act_pos = $(this).attr('pos');
				pos.push(act_pos);
			}

		});

		var input_val = false;

		if($('.salary-slider ul li input').val().search('\\$') != -1) {

			var min_val = $('.salary-slider ul li input').val().split(' - ')[0];
			min_val = min_val.split('$')[1];
			min_val = parseFloat(min_val.split('K')[0], 10);

			var max_val = $('.salary-slider ul li input').val().split(' - ')[1];
			max_val = max_val.split('$')[1];
			max_val = parseFloat(max_val.split('K')[0], 10);

		} else {

			var min_val = parseFloat($('.salary-slider ul li input').val(), 10);
			var max_val = min_val;
			input_val = true;
		}

		
		$('.lineup-list li').each(function(){

				var current_pos = $(this).find('.position').text();
				//current_pos = current_pos.replace(/[0-9]/g, '');
				var price = $(this).find('.lineup-salary').text();


				if(price.search('\\$') != -1) {
					price = price.split('$')[1];
					price = parseFloat(price.split('K')[0], 10);

					if(pos.length > 0){

						if(min_val == 0 && max_val == 0) {
							if($.inArray(current_pos, pos) != -1) {
								$(this).addClass('selected');	
							}
						}else if(min_val != 0 || max_val != 0) {

							if(!input_val && price >= min_val && price <= max_val && $.inArray(current_pos, pos) != -1) {
								$(this).addClass('selected');
							}else if(price <= max_val && $.inArray(current_pos, pos) != -1) {
								$(this).addClass('selected');
							}
						}

					}else {

						if(!input_val && min_val != 0 && max_val != 0 && price >= min_val && price <= max_val) {
							$(this).addClass('selected');
						}else if(min_val != 0 && price <= max_val){
							$(this).addClass('selected');
						}

					}
				}
		});

		return false;

	});

	$('.filter-cont .salary-slider input', filters).live('focus', function(){

		$(this).val('');

	});


	$('.filter-cont .salary-slider input', filters).live('keyup', function(){
		
		var val = $(this).val();
		val = (val != '')?parseFloat(val, 10):val;
		
  		var values = getMinMaxValue();
		var min_value = parseFloat(values.min, 10);
		//var max_value = parseFloat(values.max, 10);

		var $slider = $("#salary-range");
		$slider.slider("values", 0, min_value);
  		$slider.slider("values", 1, val);

  		selectSalariesRange(min_value, val);

		
	});

	$('.clear-values', filters).live('click', function(){

			resetSlider();
			$(".lineup-list").find('.selected').removeClass('selected');
			//$('.filter-cont .salary input').val('');
			$('.filter-cont a.position').removeClass('selected-pos');


			return false;
	});
	
	var updateLineups = function() {
		var url = '/lineups/index/' + activeSportId() + '/' + activeSiteId();
		
		var anchor = $('a.active', sports);
		container.addClass('working');

		mask.fadeIn();	

		$(grinders).trigger('modal-close');
		
		$.ajax({
			method: 'get',
			url: url,
			dataType: 'html',

			success: function(data) {
				if (typeof _gaq != 'undefined') {
					_gaq.push(['_trackPageview', url]);
				}

				container.html(data);
				//console.log(data);
				
				deactivate(anchor);
				container.removeClass('working');
				mask.fadeOut();	
				activate(anchor);

				grinders.lineups.popups();
				grinders.lineups.initSlider();
				updatePageTitle();
				grinders.lineups.research();
				
			}
		});
	};

	anchors.click(function(event) {
		event.preventDefault();
	});


	var getMinMaxValue = function(){


	var min = 10000000;
	var max = 0;
	$('.lineup-list li').each(function(){

		var price = $(this).find('.lineup-salary').text();

			if(price.search('\\$') != -1) {
				price = price.split('$')[1];
				price = parseFloat(price.split('K')[0], 10);

				if(price > max) {
					max = price;
				}
				if(price < min) {
					min = price;
				}
			}

	});

	if(min == 10000000 && max == 0){
		min = 0;
		max = 0;
	}

	var data = {
		min : min,
		max : max
	};

	return data;


};


var selectSalariesRange = function(min, max) {

	//var val = $(this).val();
	
	var val_min = min;
	val_min = (val_min != '')?parseFloat(val_min, 10):val_min;

	var val_max = max;
	val_max = (val_max != '')?parseFloat(val_max, 10):val_max;

	var pos = $('.filter-cont a.selected-pos').attr('pos');		
	pos = (pos == undefined)?pos = false:pos;

	$(".lineup-list").find('.selected').removeClass('selected');

		$('.lineup-list li').each(function(){

			var current_pos = $(this).find('.position').text();
			var price = $(this).find('.lineup-salary').text();

			if(price.search('\\$') != -1) {
				price = price.split('$')[1];
				price = parseFloat(price.split('K')[0], 10);

				if(val_max == '') {
					if(pos == current_pos) {
						$(this).addClass('selected');	
					}
				}else if(pos) {
					if(price >= val_min && price <= val_max && pos == current_pos) {
						$(this).addClass('selected');
					}
				}
				else{
					if(price >= val_min && price <= val_max) {
						$(this).addClass('selected');	
					}	
				}

				
			}
		});

	};


	var resetSlider = function() {

		var values = getMinMaxValue();
		var min_value = parseFloat(values.min, 10);
		var max_value = parseFloat(values.max, 10);

  		var $slider = $("#salary-range");
  		$slider.slider("values", 0, min_value);
  		$slider.slider("values", 1, max_value);
  		 $( "#amount" ).val( "$" + $( "#salary-range" ).slider( "values", 0 )+"K" +
      " - $" + $( "#salary-range" ).slider( "values", 1 )+"K" );
	};
	

	var values = getMinMaxValue();
	var min_value = parseFloat(values.min, 10);
	var max_value = parseFloat(values.max, 10);

	 $( "#salary-range" ).slider({
      range: true,
      min: min_value,
      max: max_value,
      values: [ min_value, max_value ],
      step: 0.1,
      slide: function( event, ui ) {
        $( "#amount" ).val( "$" + ui.values[ 0 ]+"K" + " - $" + ui.values[ 1 ] +"K" );
        selectSalariesRange(ui.values[0], ui.values[1]);
      }
    });

    $( "#amount" ).val( "$" + $( "#salary-range" ).slider( "values", 0 )+"K" +
      " - $" + $( "#salary-range" ).slider( "values", 1 )+"K" );


    $('.display-content').live('click', function(){


    	var content = $(this).closest('li').find('.grid-3-3');
    	if($(content).is(':hidden')){
    		$(content).show();
    		$(this).text('-');
    	}else{
    		$(content).hide();
    		$(this).text('+');
    	}

    	return false;

    });


};

grinders.lineups.popups = function() {
	if(!$('body').hasClass('has-incentives')) {
		$('a[href^=/fantasyplayers]').statspopup();
	} else {
		$('a.projected-points').statspopup({icon:false});
	}
};


$(document).ready(function(){
	grinders.lineups.research();
	grinders.lineups.popups();
	grinders.lineups.initSlider();


	$('a.lineup-edit').fancybox({
		'transitionIn'	:	'elastic',
		'transitionOut'	:	'elastic',
		'speedIn'		:	300, 
		'speedOut'		:	200,
		'modal'			:	true,
		'scrolling'		:	'no',
		'autoDimensions':	true
	});

	$('a.splits').fancybox({
		'transitionIn'	:	'elastic',
		'transitionOut'	:	'elastic',
		'speedIn'		:	300, 
		'speedOut'		:	200,
		'modal'			:	true,
		'scrolling'		:	'no',
		'autoDimensions':	true
	});

	$('.lineup-edit-cancel').click(function(){
		$.fancybox.close();
	});

	


});

