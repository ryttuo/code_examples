$(document).ready(function() {

	//$("#table-stats-15").tablesorter();
	$.tablesorter.addParser({ 
	    // set a unique id 
	    id: 'salaries', 
	    is: function(s) { 
	        // return false so this parser is not auto detected 
	        return false; 
	    }, 
	    format: function(s) { 
	       
	        return s.replace(/\D+/, "").replace(')', '');
	    }, 
	    // set type, either numeric or text 
	    type: 'numeric' 
	}); 

	$.tablesorter.addParser({ 
	    // set a unique id 
	    id: 'fp', 
	    is: function(s) { 
	        // return false so this parser is not auto detected 
	        return false; 
	    }, 
	    format: function(s, table, cell) { 
	       
	        return $('input', cell).val();
	        
	    }, 
	    // set type, either numeric or text 
	    type: 'numeric' 
	}); 

	

	$("table[id*='table-stats-']").tablesorter({ 
            headers: { 
                0: { 
                    sorter:'salaries'
                },
                1: { 
                    sorter:false
                },
                2: { 
                    sorter:false
                },
                3: { 
                    sorter:false
                },
                4: { 
                    sorter:false
                },
                5: { 
                    sorter:false
                },
                6: { 
                    sorter:false
                },
                7: { 
                    sorter:false
                },
                8: { 
                    sorter:false
                },
                9: { 
                    sorter:false
                },
                10: { 
                    sorter:false
                },
                11: {
                	sorter:'fp'
                }
            } 
    });

	
	$('.fancy td[class*="projectedstat-"]').click(function() {

		if(isNumeric($.trim($(this).html()))){
			$(this).html($.trim($(this).html()));
		}

	});
	
	$('h6').click(function(){
		
	});
	
	
	$('#research-positions li a').click(function(){
		
		var position_id = $(this).attr('id').split('-')[1];
		var position_hashtag = $(this).find('span').attr('class').split(' ')[0];
		
		//set new position id and hashtag
		$('#position_id').val(position_id);
		$('#position_hashtag').val(position_hashtag);
		$('#research-positions li').removeClass();
		$(this).parent().addClass('active');
		$('#player-stats table:visible:not(#stats-table)').hide();
		$('#table-stats-'+position_id).show();
		
		/*var url = $('#user-projected-stat-form').attr('action');
		var array_url = url.split('/');
		array_url.pop();
		url = array_url.join('/');
		url += "/"+position_id;
		$('#user-projected-stat-form').attr('action', url);*/
		
		return false;
	
	});

	$('.dropdown-sites #group').change(function(){

		var site_id = $(this).val();
		clearAllData(site_id);
		totalStats(site_id);



	});	
	
	$('#select_sites').change(function(){
		
		var projected_stat_id = '';
		var sport_id = $('#league_id').val();
		var site_id = $(this).val();
		var site_fps = '';
		var site_fp = '';
		
		//var site_id = 'site_id_'+site_id;
		var formulas = $.parseJSON($('#player-stats .fancy:visible:first #formulas').val());
		//console.log(site_id);
		
		var formula = eval("formulas.site_id_"+site_id);
		console.log(formula);
		
		$('#player-stats .fancy tbody tr').each(function(){

				var salary = null;
				var site_fp = null;
				
				if($(this).find('#sites').length != 0){
					var site_fps =  $(this).find('#sites').val();
					var json_site_fps = $.parseJSON(site_fps);
					site_fp = eval("json_site_fps.site_id_"+site_id);
				}	

				
				if($(this).find('#salaries').length != 0){
					var salaries = $(this).find('#salaries').val();
					var json_salaries = $.parseJSON(salaries);
					salary = eval("json_salaries.site_id_"+site_id);	
					
				}
				var name = $(this).find('.player-name .name').html().split('(')[0];
				//console.log(name);

				
				if(isNumeric(salary)){
					salary = '$'+parseInt(salary, 10);	
					$(this).find('.player-name .name').html(name+'('+salary+')');
				}else{
					$(this).find('.player-name .name').html(name+'( -- )');
				}

				if(isNumeric(site_fp)){	
					$(this).find('.projectedstat-fp').html(parseFloat(site_fp, 10).toFixed(2));
				}else{
					$(this).find('.projectedstat-fp').html('--');
				}
			
		});
	});	
	
	
	
	$("#add-player-stats").bind("autocompleteselect", function(event, ui) {
		var player_id = ui.item.id;
		$('#add-player-id').val(player_id);
	});


	$("#optimal-table .player-autocomplete").bind("autocompleteselect", getPlayerData);

	
	$('#add-player-button').click(function(){
		
		
		var player_id = $('#add-player-id').val();
		var fp_val = $('#add-fp').val();
		
		
		if(player_id == "" || fp_val == ""){
			alert ('Please add player and fp value');
		}else{
			var user_id = $('#user_id').val();
			var league_id = $('#league_id').val();
			var position_hashtag = $('#position_hashtag').val();
			var position_id = $('#position_id').val();
			var column_name = 'status';
			var columns = Array();
			var row_data = "";

			
			$('.fancy:visible tbody td.projectedstat-fp').each(function(){
				
				//var this_fp = '';
					
				var this_fp = parseFloat($(this).html(), 10);
				
				if(this_fp < fp_val || $(this).parent().next().length == 0){
					
					this_row_id = $(this).parent().attr('id');
					
					columns = calculateStatFields(this_row_id, fp_val);
					row_data = $(this).parents('tr:first');
					
					return false;
					
				}
					
				
			
			});
			
			$.ajax({
				type: 'POST',
				url: "/user_projected_stats/update_stat",
				//cache: false,
				data: {
					'data[User][id]' : user_id,
					'data[UserProjectedStat][player_id]' : player_id,
					'data[Position][columns]' : columns,
					'data[League][id]' : league_id,
					'data[Position][hashtag]' : position_hashtag,
					'data[Position][id]' : position_id,
					'data[Column][name]' : column_name
				},
				beforeSend: function() {
					
					$('#projected-mask').fadeIn();
				},
				success: function(data){
					
					$('#projected-mask').fadeOut();
					location.reload();
					
				}
			});
		}
		
		return false;
	});



	$('.recalculate-optimal').live('click', function(){

		//$( "#progressbar" ).show();
		
		//$( "#progressbar" ).progressbar('value', value);
		$(this).data('optimal', false);
		if($('#salary-remaining val').css('color') == 'red'){
			$('#salary-remaining val').animate({opacity:0},200,'linear',function(){
				$(this).animate({opacity:1},200);
			});
		}else{
			startCalculation($(this));
		}

	});

	$('.pool-optimal').live('click', function(){

		if(validatePool()){
			$(this).data('optimal', true);
			if($('#salary-remaining val').css('color') == 'red'){
				$('#salary-remaining val').animate({opacity:0},200,'linear',function(){
					$(this).animate({opacity:1},200);
				});
			}else{
				startCalculation($(this));
			}
		}
	});

	$('.player-config div').live('click', function(){

		var class_button = $(this).find('span').attr('class');
		var table_name = $(this).parent().parent().parent().parent().parent().attr('id');
		var player_id = $(this).parent().parent().parent().attr('id');
		var site_id = $('#site_id').val();


		if(class_button == 'unlock'){
			$(this).parent().find('span').removeClass();
			$(this).find('span').addClass('lock');
			$(this).next().find('span').addClass('undelete');
			if(table_name == 'optimal-table'){
				$(this).parent().parent().parent().clone().prependTo('#locked-table tbody');
				var button = $('#locked-table').find('#'+player_id+' .undelete');
				$(button).removeClass();
				$(button).addClass('back');
				$(button).parent().parent().find('.lock').parent().remove();
				$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().parent().removeClass('selected-player').removeClass('excluded-player').addClass('locked-player');
				$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().find('.add-player').removeClass().addClass('notadd-player');
			}	

			/*else{
				
				var row = $(this).parent().parent().parent();
				var player_id = $(this).parent().parent().parent().attr('id');
				var position = $(this).parent().parent().parent().find('.salary-position').text();
				var salary = $(this).parent().parent().parent().find('.salary-position').attr('salary');
				var projected = $(this).parent().parent().parent().find('.salary-position').attr('projected');
				var name_sal_proj = $(this).parent().parent().parent().find('.fullname').text();
				
				if($('#optimal-table tbody tr#'+player_id).length != 0){
					alert ('This player is already on Optimal Lineup');
					return false;
				}
		
				var position_valid = false;
				$('#optimal-table tbody tr').each(function(){

					//console.log(validPositionOnArrayPos(position, $(this).find('.salary-position').attr('abs-position')));
					if($(this).find('#add-player-optimal').is(':visible') && validPositionOnArrayPos(position, $(this).find('.salary-position').attr('abs-position'))) {
							
							$(this).find('#add-player-optimal').hide();
							$(this).find('#add-player-optimal').val('');
							$(this).attr('id', player_id);
							$(this).find('.salary-position').text(position);
							$(this).find('.salary-position').attr('salary', salary);
							$(this).find('.salary-position').attr('projected', projected);
							$(this).find('.fullname').text(name_sal_proj);
						
							if($(this).find('.player-config').length == 0){
								var player_config = "<div class='player-config'><div><span class='lock'></span></div><div><span class='undelete'></span></div></div>";
								$(this).find('.player-name').append(player_config);
							}else{
								$(this).find('.player-config').children().children().attr('class', 'lock');
								$(this).find('.player-config').children().next().children().attr('class', 'undelete');	
							}
							//$(this).clone().prependTo('#locked-table tbody');
							position_valid = true;	
							return false;

					}		

				});

				if(!position_valid){
					alert ("Player can't add to Optimal lineup, there are no positions available");
					return false;
				}

				$(this).parent().parent().parent().prependTo('#locked-table tbody');
				//$(this).parent().parent().parent().remove();

			}*/

		}else if(class_button == 'lock'){
			$(this).find('span').removeClass().addClass('unlock');
			//$(this).find('span').addClass('unlock');
			//if(table_name == 'optimal-table'){
				//$(this).parent().parent().parent().remove();
				//$('#optimal-table #'+player_id).find('.lock').removeClass().addClass('unlock');
			$('#locked-table tbody').find('#'+player_id).remove();
			$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().parent().removeClass('locked-player');
			$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().find('.notadd-player').removeClass().addClass('add-player');	
			//}
			/*else{
				$('#locked-table tbody').find('#'+player_id).remove();
			}*/
		}else if(class_button == 'undelete'){
			$(this).parent().find('span').removeClass();
			$(this).find('span').addClass('back');
			//$(this).prev().find('span').addClass('unlock');
			$(this).prev().find('span').parent().remove();
			if(table_name == 'optimal-table'){
				$(this).parent().parent().parent().clone().prependTo('#exclude-table tbody');
				var player_id = $(this).parent().parent().parent().attr('id');
				$('#locked-table').find('#'+player_id).remove();
				$(this).parent().parent().parent().attr('id', '');
				var salary_position = $(this).parent().parent().parent().find('.salary-position');
				$(salary_position).html($(salary_position).attr('abs-position'));
				$(salary_position).attr('projected', '');
				$(salary_position).attr('salary', '');	

				$(this).parent().parent().parent().find('.fullname').text('');
				//var add_player_optimal = "<input type='text' placeholder='Add Player' class='player-autocomplete ui-autocomplete-input' id='add-player-optimal' value='' autocomplete='off' role='textbox' aria-autocomplete='list' aria-haspopup='true'>";
				//$(this).parent().parent().parent().find('.fullname').after(add_player_optimal);
				$(this).parent().parent().parent().find('#add-player-optimal').val('');
				$(this).parent().parent().parent().find('#add-player-optimal').show();
				$(this).parent().parent().parent().find('.player-config').remove();

				$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().parent().removeClass('locked-player').removeClass('selected-player').addClass('excluded-player');
				$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().find('.add-player').removeClass().addClass('notadd-player');


			}

			/*else{
				var player_id = $(this).parent().parent().parent().attr('id');
				var row = $('#optimal-table').find('#'+player_id);
				$(row).attr('id', '');
				$(row).find('.salary-position').attr('salary', '').attr('projected', '').text('');
				$(row).find('.fullname').text('');
				$(row).find('#add-player-optimal').show();
				$(row).find('.player-config').remove();
				$(this).parent().parent().parent().prependTo('#exclude-table tbody');
			}*/

		}else if(class_button == 'delete'){
			$(this).find('span').removeClass();
			$(this).find('span').addClass('undelete');
			if(table_name == 'exclude-table'){
				$(this).parent().parent().parent().remove();
				$('#optimal-table #'+player_id).find('.delete').removeClass().addClass('undelete');
			}
		}else if(class_button == 'back'){
			var row = $('#optimal-table').find('#'+player_id);
			$(row).attr('id', '');
			$(row).find('.salary-position').attr('salary', '').attr('projected', '').text('');
			$(row).find('.salary-position').html($(row).find('.salary-position').attr('abs-position'));
			$(row).find('.fullname').text('');
			$(row).find('#add-player-optimal').show();
			$(row).find('.player-config').remove();
			$(this).parent().parent().parent().remove();

			
			$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().parent().removeClass('excluded-player').removeClass('locked-player').removeClass('selected-player');
			//$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().parent().removeClass('locked-player');
			$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().find('.notadd-player').removeClass().addClass('add-player');	

		}

		totalStats(site_id);

	});

	
	var position_id = $('#position_id').val();
	showTableStat(position_id);

	
	selectStat();
	//selectSalary();
	selectFpStat();
	playerInputStatus();
	addPlayerOptimal();
	var site_id = $('#site_id').val();
	totalStats(site_id);
	selectPool();
	//sortValues();

});

function  tableRowColorizer() {
   var classes = ['odd', 'even'];
 
        $('#player-stats table > tbody > tr').each(function (i) {
                $(this).removeClass('odd even').addClass(classes[i % 2]);
        });
}

function sortFunction(column, a, b) {
    var keyA = $(a).find(column).text();
    var keyB = $(b).find(column).text();
    var order = true;
    
	//if (keyA.indexOf('$') != -1)
		//order = false;

    //keyA = keyA.replace("+", "").replace(/,/g, '').replace('$', '').replace('%', '');
    //keyB = keyB.replace("+", "").replace(/,/g, '').replace('$', '').replace('%', '');
    
    var is_salary = keyA.search("\\(");
    if(is_salary != -1){
    	//keyA = keyA.substring(is_salary+1, keyA.search("\\)"));
    	//keyB = keyB.substring(is_salary+1, keyB.search("\\)"));

		keyA = keyA.replace(/\D+/, "").replace(')', '');
		keyB = keyB.replace(/\D+/, "").replace(')', '');

		//keyA = $.trim(keyA.split('(')[0]);
		//keyB = $.trim(keyB.split('(')[0]);	

    	//keyA = (isNaN(keyA))?0:keyA;
    	//keyB = (isNaN(keyB))?0:keyB;
    }


    //console.log(keyA);
    //console.log(keyB);
    //return false;


    var keyC = keyA;
    if (!isNaN(parseFloat(keyA)) && isFinite(keyA)) {
        keyA = parseFloat(keyA);
    } else {
    	keyA = keyB;
    }
    if (!isNaN(parseFloat(keyB)) && isFinite(keyB)) {
        keyB = parseFloat(keyB);
    } else {
    	keyB = keyC;
    }
    if(order){
    	if (keyA < keyB) return 1;
    	if (keyA > keyB) return -1;
    }else{
    	if (keyA < keyB) return -1;
    	if (keyA > keyB) return 1;
    }
    return 0;
}
    
function sortData(column) {

	console.log('aqui');
	
	
	$('#player-stats table[id*="table-stats-"]').each(function(){
		
		var table = $(this);
		
		var rows = $(this).find('tbody > tr').get();
    	
    	//$(this).find('thead > tr > th:eq('+column+')').css('background-position', '99% -1097px');
    	
    	rows.sort(function (a, b) {
            return  sortFunction(column, a, b, false);
        });
    	
    	 $.each(rows, function (index, row) {
             var current = $(row).find(column).text();

             if (!isNaN(parseFloat(current)) && isFinite(current)) {
                  current = parseFloat(current);
             }
             console.log(current);

             table.children('tbody').append(row);
         });

         table.find('th').addClass('nonsort');
         //th.toggleClass('sorted nonsort');
         tableRowColorizer();
		
	});
	
		    	
}

function sortTableData(table, class_name){

	console.log('llego aqui');

	var table = $('#'+table);
    
    $(class_name)
        .wrapInner('<span title="sort this column"/>')
        .each(function(){
            
            var th = $(this),
                thIndex = th.index(),
                inverse = false;

            th.click(function(){
                
                //console.log(table.find('input'));

                table.find('td input').filter(function(){
                    
                    return $(this).index() === thIndex;
                    
                }).sortElements(function(a, b){
                    
                    return $.text([a]) > $.text([b]) ?
                        inverse ? -1 : 1
                        : inverse ? 1 : -1;
                    
                }, function(){
                    
                    // parentNode is the element we want to move
                    return this.parentNode; 
                    
                });
                
                inverse = !inverse;
                    
            });

         });
}


/*function sortValues(){


	$('a.sort-projected').live('click', function(){
		$('a.sort-projected').html('Sort by Salary');
		$('a.sort-projected').removeClass('sort-projected').addClass('sort-salary');
		//var sorting = [[11,0]]; 
        //$('#table-stats-15').trigger("sorton",[sorting]); 

		//sortData('.projectedstat-fp input');
		//sortTableData('table-stats-15', '.projectedstat-fp');

		return false;

	});

	$('a.sort-salary').live('click', function(){
		$('a.sort-salary').html('Sort by Projected');
		$('a.sort-salary').removeClass('sort-salary').addClass('sort-projected');
		//var sorting = [[0,0]]; 
        //$('#table-stats-15').trigger("sorton",[sorting]); 
		//sortData('.player-name');
		return false;
	});

}*/

function putSalaries(site_id){

	$('#player-stats .fancy tbody tr').each(function(){

				var salary = null;
				var site_fp = null;
				
				if($(this).find('#salaries').length != 0){
					var salaries = $(this).find('#salaries').val();
					var json_salaries = $.parseJSON(salaries);
					salary = eval("json_salaries.site_id_"+site_id);	
					
				}
				var name = $(this).find('.player-name .name').html();
				
				if(isNumeric(salary)){
					salary = '$'+parseInt(salary,10);	
					$(this).find('.player-name .name').html(name+' ('+salary+')');
				}else{
					$(this).find('.player-name .name').html(name+' ( -- )');
				}
			
		});


}

function clearAllData(site_id){

	$('.col-right table tbody tr').remove();
	$("table[id*='table-stats-'] tbody tr").removeClass('selected-player').removeClass('locked-player').removeClass('excluded-player');	
	$("table[id*='table-stats-'] tbody tr .notadd-player").removeClass('notadd-player').addClass('add-player');
	/*$('#optimal-table tbody tr').each(function(index, value){

		$(this).attr('id', '');
		$(this).find('.salary-position').attr('salary', '');
		$(this).find('.salary-position').attr('projected', '');
		$(this).find('.fullname').html('');
		$(this).find('#add-player-optimal').show();
		$(this).find('.player-config').remove();

	});*/
	
	
	var positions_data = getPositionsCap(site_id);
	var positions_by_site = positions_data.positions;
	var table_id = 'optimal-table';

	//console.log(positions_by_site);
	

	var main = "";
	for (i in positions_by_site){	

		var positions = ($.isArray(positions_by_site[i]))?positions_by_site[i].join(" | "):positions_by_site[i];
		var row = "<tr id=''>";
		row += "<td class='salary-position' salary='' projected='' abs-position='"+positions+"'>"+positions+"</td>";
		row += "<td class='player-name'><span class='fullname'></span>";
		//row += "</a><div class='player-config'><div><span class='unlock'></span></div><div><span class='undelete'></span></div></div></td>";
		row +=  "</tr>";

		//total_salary += parseFloat(players_optimal[i].salary, 10);
		//total_projections += parseFloat(players_optimal[i].projected, 10);

		main += row;

		//$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+players_optimal[i].id+"']").parent().parent().addClass('selected-player');
		//$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+players_optimal[i].id+"']").parent().find('.add-player').removeClass().addClass('notadd-player');

	}

	$('#'+table_id+' tbody').children().remove();
	$('#'+table_id+' tbody').append(main);

	var input_autocomplete = $("<input type='text' placeholder='Add Player' id='add-player-optimal' value='' autocomplete='off' role='textbox' aria-autocomplete='list' aria-haspopup='true' ></input>");
	$('#'+table_id+' tbody').find('.fullname').after(input_autocomplete);
	$('#'+table_id+' tbody').find('#add-player-optimal').addClass('player-autocomplete');
	

	$('#'+table_id+' tbody').find('#add-player-optimal').autocomplete({
        source: "/player_db/players/complete",
        minLength: 2
	});
	/*input_autocomplete.autocomplete({
        source: "/player_db/players/complete",
        minLength: 2
	});*/
	$('#'+table_id+' tbody').find('.player-autocomplete').bind("autocompleteselect", getPlayerData);			


}


function calculateOptimal(){

		
		$("table[id*='table-stats-'] tbody tr").removeClass('selected-player');

		var button = $('.recalculate-optimal');

		var table_id = $(button).parent().parent().find('table').attr('id');
		var site_id = $('#site_id').val();

		var remove_players = new Array();
		var lock_players = new Array();

		//excluded players
		$('#exclude-table tbody tr').each(function(index, value){
			
			//if($(this).find('.delete').length != 0){
				//remove_players = $('#cal-optimal').data('remove_players');
				remove_players.push($(this).attr('id'));
				//$('#cal-optimal').data('remove_players', remove_players);
			//}

		});

		//locked players
		$('#optimal-table tbody tr').each(function(index, value){
			if($(this).find('.lock').length != 0){
				player_lock = new Object();
				player_lock.id = $(this).attr('id');
				player_lock.pos = $.trim($(this).find('.salary-position').html());
				player_lock.index = index;
				player_lock.salary = $(this).find('.salary-position').attr('salary');
				remove_players.push($(this).attr('id'));
				lock_players.push(player_lock);
			}
		});


		if($('#'+table_id).parent().find('select', '.dropdown-sites').data('value') ==
		   $('#'+table_id).parent().find('select', '.dropdown-sites').val()){

			modified_players = new Object();
			modified_players.removed = remove_players;
			modified_players.locked = lock_players;

		}else{
			modified_players = null;
		}

		//console.log(modified_players);
		optimalLineup(1, site_id, modified_players, function(players_optimal){

			loadData(players_optimal, table_id, site_id);

		});

		$(button).html('Calculate Optimals');
		$( "#progressbar" ).hide();
}

var getPlayerData = function(event, ui){

	var player_id = ui.item.id;
		var sport_id = $('#league_id').val();
		var site_id = $('#site_id').val();
		var add_player_optimal = $(this);
		
		$.ajax({
			type: 'POST',
			url: "/user_projected_stats/player_stats",
			//cache: false,
			data: {
				'data[Player][id]' : player_id,
				'data[Player][sport_id]' : sport_id,
				'data[Player][site_id]' : site_id
				
			},
			beforeSend: function() {
				
				$(add_player_optimal).addClass('ui-autocomplete-loading');
			},
			success: function(data){
				$(add_player_optimal).removeClass('ui-autocomplete-loading');	
				//console.log(data);
				if(data == 'no-data'){
					alert ('This player has not fp value');
				}else{

					var site_id = $('#site_id').val();
					var json_data = $.parseJSON(data);
					var position = eval('json_data.Positions.site_id_'+site_id);
					var projected = eval('json_data.Sites.site_id_'+site_id);
					var salary = eval('json_data.Salaries.site_id_'+site_id);
					var first_name = eval('json_data.Player.first_name');
					var last_name = eval('json_data.Player.last_name');
					var name = first_name + " " + last_name;

					/*if(duplicatePlayerOptimal(player_id)){
						return false;
					}*/
					
					if($('#optimal-table tbody tr#'+player_id).length != 0){
						alert ('This player is already on Optimal Lineup');
						return false;
					}

					if($('#exclude-table tbody tr#'+player_id).length != 0){
						alert ('This player is already on Excluded Table');
						return false;
					}

					console.log(position);

					if(!validPositionOnArrayPos(position, $(add_player_optimal).parent().parent().find('.salary-position').attr('abs-position'))){
						alert ('This player does not have this position');
						return false;
					}
					
					$(add_player_optimal).parent().parent().attr('id', player_id);
					$(add_player_optimal).parent().parent().find('.salary-position').text(position);
					$(add_player_optimal).parent().parent().find('.salary-position').attr('salary', salary);
					$(add_player_optimal).parent().parent().find('.salary-position').attr('projected', projected);
					$(add_player_optimal).parent().find('.fullname').text(name+" ($"+parseInt(salary, 10)+ " / "+parseFloat(projected, 10).toFixed(2)+")");
					if($(add_player_optimal).parent().find('.player-config').length == 0){
						var player_config = "<div class='player-config'><div><span class='lock'></span></div><div><span class='undelete'></span></div></div>";
						$(add_player_optimal).parent().append(player_config);
					}else{
						$(add_player_optimal).parent().find('.player-config').children().children().attr('class', 'lock');
						$(add_player_optimal).parent().find('.player-config').children().next().children().attr('class', 'undelete');	
					}
					$(add_player_optimal).hide();
					$(add_player_optimal).val('');

					$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().parent().removeClass('selected-player').removeClass('excluded-player').addClass('locked-player');
					$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().find('.add-player').removeClass().addClass('notadd-player');


					$(add_player_optimal).parent().parent().clone().prependTo('#locked-table tbody');
					var button = $('#locked-table').find('#'+player_id+' .undelete');
					$(button).removeClass();
					$(button).addClass('back');
					$(button).parent().parent().find('.lock').parent().remove();


					totalStats(site_id);

				}
				
				//$('#projected-mask').fadeOut();
				//location.reload();
				//console.log(data);

				
			}
		});

}


function startCalculation(button) {
    $(button).html('Processing...');
    //$( "#progressbar" ).show();
    /*$( "#progressbar" ).progressbar({
				value: 100
	});*/
    setTimeout('calculateOptimal()', 1);
}

function duplicatePlayerOptimal(player_id){
	if($('#optimal-table tbody tr#'+player_id).length != 0){
		alert ('This player is already on Optimal Lineup');
		return true;
	}

	if($('#exclude-table tbody tr#'+player_id).length != 0){
		alert ('This player is already on Excluded Table');
		return true;
	}

	return false;
}

function validPositionOnArrayPos(position, string_positions){

	array_positions = string_positions.split(' | ');
	if($.inArray(position, array_positions) != -1){
		return true;
	}else{
		return false;
	}

}


function addPlayerOptimal(){

	$('table[id*="table-stats-"] .add-player').live('click', function(){

		
		var site_id = $('#site_id').val();
		var position = $.parseJSON($(this).parent().parent().find('#positions').val());
		position = eval('position.site_id_'+site_id);
		var name = $(this).parent().find('.name').text();
		var player_id = $(this).parent().find('#player-id').val();
		var projected = $.parseJSON($(this).parent().parent().find('#sites').val());
		projected = eval('projected.site_id_'+site_id);
		var salary = $.parseJSON($(this).parent().parent().find('#salaries').val());
		salary = eval('salary.site_id_'+site_id);

		/*if(duplicatePlayerOptimal(player_id)){
			return false;
		}*/

		if($('#optimal-table tbody tr#'+player_id).length != 0){
			alert ('This player is already on Optimal Lineup');
			return false;
		}

		if($('#exclude-table tbody tr#'+player_id).length != 0){
			alert ('This player is already on Excluded Table');
			return false;
		}

		var position_valid = false;
		$('#optimal-table tbody tr').each(function(){

			//console.log(validPositionOnArrayPos(position, $(this).find('.salary-position').attr('abs-position')));
			if($(this).find('#add-player-optimal').is(':visible') && validPositionOnArrayPos(position, $(this).find('.salary-position').attr('abs-position'))) {
					name = name.split('(')[0];				
					$(this).find('#add-player-optimal').hide();
					$(this).find('#add-player-optimal').val('');
					$(this).attr('id', player_id);
					$(this).find('.salary-position').text(position);
					$(this).find('.salary-position').attr('salary', salary);
					$(this).find('.salary-position').attr('projected', projected);
					//var tmp = $(this).find('.player-name').children();
					$(this).find('.fullname').text(name+" ($"+parseInt(salary, 10)+" / "+parseFloat(projected, 10).toFixed(2)+")");
					//$(this).find('.player-name').append($(tmp));
					if($(this).find('.player-config').length == 0){
						var player_config = "<div class='player-config'><div><span class='lock'></span></div><div><span class='undelete'></span></div></div>";
						$(this).find('.player-name').append(player_config);
					}else{
						$(this).find('.player-config').children().children().attr('class', 'lock');
						$(this).find('.player-config').children().next().children().attr('class', 'undelete');	
					}
					
					$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().parent().removeClass('selected-player').removeClass('excluded-player').addClass('locked-player');
					$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player_id+"']").parent().find('.add-player').removeClass().addClass('notadd-player');


					$(this).clone().prependTo('#locked-table tbody');

					
					var button = $('#locked-table').find('#'+player_id+' .undelete');
					$(button).removeClass();
					$(button).addClass('back');
					$(button).parent().parent().find('.lock').parent().remove();

					totalStats(site_id);

					position_valid = true;	
					return false;
			}
			//total_salary += parseFloat($(this).find('.salary-position').attr('salary'), 10);
			//total_projections += parseFloat($(this).find('.salary-position').attr('projected'), 10);

		});

		if(!position_valid){
			alert ("Player can't add to Optimal lineup, there are no positions available");
			return false;
		}


	});

}

function hashtagAndEdited(data){

	var position_hashtag = $('#position_hashtag').val();
	var position_id = $('#position_id').val();
	var id = $(data).attr('id');
	var player_id = $(data).find('#player-id').val();
	$(data).find('#hashtag-value').attr('name', "data[ProjectedStat]["+id+"][hashtag]");
	$(data).find('#hashtag-value').val(position_hashtag);
	$(data).find('#position-id-value').attr('name', "data[ProjectedStat]["+id+"][position_id]");
	$(data).find('#position-id-value').val(position_id);
	$(data).find('#player-id').attr('name', "data[ProjectedStat]["+id+"][player_id]");

	$('#'+id+' td[class!="projectedstat-status"][class!="projectedstat-fp last"][class*="projectedstat-"] input').each(function(){

		var id = $(this).parent().parent().attr('id');
		var stat = $(this).parent().attr('class').split(' ')[0];
		var name_stat = stat.split('-')[1];
		$(this).attr('name', "data[ProjectedStat]["+id+"]["+name_stat+"]");

	});


}


function selectStat(){


	$('#optimal-table').parent().find('select', '.dropdown-sites').data('value', 
	$('#optimal-table').parent().find('select', '.dropdown-sites').val());

	var previuos;

	$('.fancy td[class!="projectedstat-fp"][class*="projectedstat-"] input').focus(function(){

		previuos = $(this).val();

	}).change(function (object){
		
		if(isNumeric($(this).val())){
			/*var id = $(this).parent().parent().attr('id');
			var stat = $(this).parent().attr('class').split(' ')[0];
			var name_stat = stat.split('-')[1];
			$(this).attr('name', "data[ProjectedStat]["+id+"]["+name_stat+"]");*/
			hashtagAndEdited($(this).parent().parent());
			$(this).addClass('edited');
			$(this).parent().parent().find('.projectedstat-fp input').addClass('unable');
		}else{
			alert('Please add only numeric values');
			$(this).val(previuos);
			$(this).focus();
			return false;
		}
		


	});

}

function selectFpStat(){

	$('.fancy .projectedstat-fp input').focus(function(){

		previuos = $(this).val();

	}).change(function (object){
		
		if(isNumeric($(this).val())){
			if($(this).val() == ''){alert ('lolo');}
			var value = $(this).val();
			var site_id = $('#site_id').val();
			var new_value = '{"site_id_'+site_id+'":"'+value+'"}';
			//console.log(new_value);
			$(this).parent().parent().find('#sites').val(new_value);
			$(this).parent().parent().find('td[class!="projectedstat-fp"][class*="projectedstat-"] input').addClass('unable').attr('readonly','readonly');
			hashtagAndEdited($(this).parent().parent());
			var id = $(this).parent().parent().attr('id');
			var name_stat = 'overridden_fp';
			$(this).attr('name', "data[ProjectedStat]["+id+"]["+name_stat+"]");
			$(this).addClass('edited-fp');
		}else if($(this).val() == ''){
			var real_fp = $(this).attr('fp');
			var id = $(this).parent().parent().attr('id');
			hashtagAndEdited($(this).parent().parent());
			$(this).val(real_fp);
			$(this).parent().parent().find('td[class!="projectedstat-fp"][class*="projectedstat-"] input').removeClass('unable').removeAttr('readonly');
			$(this).removeClass('edited-fp');			
			$(this).parent().append("<input type='hidden' value='0' name='data[ProjectedStat]["+id+"][overridden_fp]'></input>");
		}else{
			alert('Please add only numeric values');
			$(this).val(previuos);
			$(this).focus();
			return false;
		}
	});

}

function selectPool(){
	
	$('.fancy .player-name .pool').click(function(){
		hashtagAndEdited($(this).parent().parent().parent());
		var id = $(this).parent().parent().parent().attr('id');
		var name_stat = 'pool';
		$(this).addClass('edited-fp');
		$(this).parent().find('input').attr('name', "data[ProjectedStat]["+id+"]["+name_stat+"]");
		/*if($(this).attr('checked')){
			$(this).attr('name', "data[ProjectedStat]["+id+"]["+name_stat+"]");
		}else{
			$(this).attr('name', "data[ProjectedStat]["+id+"]["+name_stat+"]");
		}*/
	});
}

function validatePool(){

	var site_id = $('#site_id').val();
	var positions_cap = getPositionsCap(site_id);
	var positions_by_site = positions_cap.positions;
	///console.log(positions_by_site);

	$('table[id*="table-stats-"] tbody tr').each(function(){

		if($(this).find('#sites').val().search("\"site_id_"+site_id+"\"") != -1 && $(this).find('.pool').attr('checked')) {

			var positions  = $.parseJSON($(this).find('#positions').val());
			var position = eval('positions.site_id_'+site_id);
			console.log(position);
			var pos = $.inArray(position, positions_by_site);
			if(pos != -1){
				positions_by_site.splice(pos, 1);
			}

		}

	});

	//console.log(positions_by_site);

	if(positions_by_site.length > 0){
		alert ("You must include "+positions_by_site[0]+" players in your pool using the checkboxes next to player names");
		return false;
	}

	return true;

}

function selectSalary(){

	var previuos;

	$('.fancy td[class*="salaries-site-id-"] #player-salary').focus(function(){

		previuos = $(this).val();

	}).change(function(object){
		
		var site_id = $('#site_id').val();
		var col_id = $(this).parent().parent().attr('id');
		var player_id = $(this).parent().parent().find('#player-id').val();
		var value = $(this).val();
		if(isNumeric(value)){
			if($(this).parent().find('#site_id_'+site_id).length == 0){
				var data = "<input id='site_id_"+site_id+"' name='data[ProjectedStat]["+col_id+"][Salaries]["+player_id+"<-->"+site_id+"]' type='hidden' value='"+value+"'>";
				$(this).after(data);
			}else{
				$(this).parent().find('#site_id_'+site_id).val(value);
			}	
			hashtagAndEdited($(this).parent().parent());
			$(this).addClass('edited');
		}else{
			alert('Please add only numeric values');	
			$(this).val(previuos);
			$(this).focus();
			return false;
		}
		

		});

}


function formatSalary(salary){

	if (salary > 1000000) {
		salary = (salary / 1000000).toFixed(1) + 'M';
	} else if (salary > 1000) {
		salary = (salary / 1000).toFixed(1) + 'K';
	}

	return salary; 

}

function removePlayers(players, players_removed){

	var i = 0;
	while(players_removed.length > 0){
		var key = $.inArray(players[i].id, players_removed);
		if(key != -1){
			players.splice(i, 1);
			players_removed.splice(key, 1);
			i--;
		}
		i++;
		if(i == players.length){break;}
	}

	return players;

}

function loadData(players_optimals, table_id, site_id){

	//console.log(table_id);
	//console.log(players_optimals);
	var positions_cap = getPositionsCap(site_id);
	var positions_by_site = positions_cap.positions;
	
	
	if(players_optimals == null || players_optimals.length == 0){
		$('#optimal-lineups').append("<div class='no-data'>No Data Available</div>");
		$('#recal-optimal').hide();
		return false;
	}

	/*if(table_id == null){
	
		var all_tables = "";

		for (i in players_optimals){
			 
			var num = parseInt(i, 10) + 1;
			var main = "<div class='column-"+num+"'>" 
			main += "<table cellspacing='0' class='fancy' id='optimal-table-"+num+"' width='50%'>"
			main += "<thead>";
			main += "<tr>";
			main += "<th class='salary-position'>Pos</th>";
			main += "<th class='player-first-name'>Player Name (Salary/Points)</th>";
			main += "</tr>";
			main += "</thead>";
			main += "<tbody>";

			var players_optimal = players_optimals[i];
			var total_salary = 0;
			var total_projections = 0;
			for (i in players_optimal){	
				
				var row = "<tr id='"+players_optimal[i].id+"'>";
				row += "<td class='salary-position' salary='"+players_optimal[i].salary+"' projected='"+players_optimal[i].projected+"'>"+players_optimal[i].position+"</td>";
				row += "<td class='player-name'>"+players_optimal[i].name+" ($"+formatSalary(players_optimal[i].salary)+" / "+players_optimal[i].projected.toFixed(2)+")";
				row += "</a><div class='player-config'><div><span class='unlock'></span></div><div><span class='undelete'></span></div></div></td>";
				row +=  "</tr>";

				total_salary += parseFloat(players_optimal[i].salary, 10);
				total_projections += parseFloat(players_optimal[i].projected, 10);

				main += row;

			}

			main += "</tbody>";
			main += "<tfoot>";
			main += "</tfoot>";
			main += "</table>";
			main += "<div class='total-values'>("+formatSalary(total_salary)+" / "+total_projections.toFixed(2)+")</div>";
			var dropdown = $('#select_sites').parent().html().toString();
			
			dropdown = dropdown.replace(/id=\"select_sites\"/, '');
			
			main += "<div class='dropdown-sites'>"+dropdown+"</div>";
			
			var recalculate_button = "<div class='center-button'>";
			recalculate_button += "<a class='button compact recalculate-optimal' class='recal-optimal'>Recalculate Optimals</a>";
			recalculate_button += "</div>";
			main += recalculate_button;
			

			main += "</div>";

			all_tables += main;	

			
		}

		$('#optimal-lineups').append(all_tables);
		$('.dropdown-sites select').val($('#select_sites').val());
		$('.dropdown-sites select').data('value', $('#select_sites').val());

		
	}else{*/

	
		var players_optimal = null;
		var total_salary = 0;
		var total_projections = 0;

		if($('#'+table_id).parent().find('select', '.dropdown-sites').data('value') !=
		   $('#'+table_id).parent().find('select', '.dropdown-sites').val()) {


			$('#'+table_id).parent().find('select', '.dropdown-sites').data('value', 
			$('#'+table_id).parent().find('select', '.dropdown-sites').val());	

			$('#exclude-table tbody tr').remove();
			$('#locked-table tbody tr').remove();
			$('#'+table_id).find('.player-config div span').attr('class', 'unlock');
			$('#'+table_id).find('.player-config div').next().find('span').attr('class', 'undelete');

		//}	

			players_optimal = players_optimals[0];
			
			var main = "";
			for (i in players_optimal){	

				var positions = ($.isArray(positions_by_site[i]))?positions_by_site[i].join(" | "):positions_by_site[i];
				var row = "<tr id='"+players_optimal[i].id+"'>";
				player_name = players_optimal[i].name.split('(')[0];
				row += "<td class='salary-position' salary='"+players_optimal[i].salary+"' projected='"+players_optimal[i].projected+"' abs-position='"+positions+"'>"+players_optimal[i].position+"</td>";
				row += "<td class='player-name'><span class='fullname'>"+player_name+" ($"+players_optimal[i].salary+" / "+players_optimal[i].projected.toFixed(2)+")</span>";
				row += "</a><div class='player-config'><div><span class='unlock'></span></div><div><span class='undelete'></span></div></div></td>";
				row +=  "</tr>";

				total_salary += parseFloat(players_optimal[i].salary, 10);
				total_projections += parseFloat(players_optimal[i].projected, 10);

				main += row;

				$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+players_optimal[i].id+"']").parent().parent().addClass('selected-player');
				$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+players_optimal[i].id+"']").parent().find('.add-player').removeClass().addClass('notadd-player');

			}


			

			$('#'+table_id+' tbody').children().remove();
			$('#'+table_id+' tbody').append(main);

			var input_autocomplete = $("<input type='text' placeholder='Add Player' id='add-player-optimal' value='' autocomplete='off' role='textbox' aria-autocomplete='list' aria-haspopup='true' style='display: none; '></input>");
			$('#'+table_id+' tbody').find('.fullname').after(input_autocomplete);
			$('#'+table_id+' tbody').find('#add-player-optimal').addClass('player-autocomplete');
			

			$('#'+table_id+' tbody').find('#add-player-optimal').autocomplete({
                source: "/player_db/players/complete",
                minLength: 2
        	});
			/*input_autocomplete.autocomplete({
                source: "/player_db/players/complete",
                minLength: 2
        	});*/
			$('#'+table_id+' tbody').find('.player-autocomplete').bind("autocompleteselect", getPlayerData);			

			//$("#optimal-table .player-autocomplete").bind("autocompleteselect", getPlayerData);

		}else{

			players_optimal = players_optimals[0];
			//console.log(players_optimals);
			var i = 0;
			$('#'+table_id+' tbody tr').each(function(){

				if($(this).children().children().children().children().attr('class') != 'lock'){

					try{
						player = players_optimal[i];
						$(this).attr('id', player.id);

						/*var row = "<tr id='"+players_optimal[i].id+"'>";
						row += "<td class='salary-position' salary='"+players_optimal[i].salary+"' projected='"+players_optimal[i].projected+"'>"+players_optimal[i].position+"</td>";
						row += "<td class='player-name'>"+players_optimal[i].name+" ($"+formatSalary(players_optimal[i].salary)+" / "+players_optimal[i].projected.toFixed(2)+")";
						row += "</a>*/
						
						//row +=  "</tr>";
						player_name = player.name.split('(')[0];
						$(this).find('#add-player-optimal').hide();
						$(this).find('#add-player-optimal').val('');
						$(this).find('.salary-position').text(player.position);
						$(this).find('.salary-position').attr('salary', player.salary);
						$(this).find('.salary-position').attr('projected', player.projected);
						//var tmp = $(this).find('.player-name').children();
						$(this).find('.fullname').text(player_name+" ($"+player.salary+" / "+parseFloat(player.projected, 10).toFixed(2)+")");
						//$(this).find('.player-name').append($(tmp));
						if($(this).find('.player-config').length == 0){
							var player_config = "<div class='player-config'><div><span class='unlock'></span></div><div><span class='undelete'></span></div></div>";
							$(this).find('.player-name').append(player_config);
						}else{
							$(this).find('.player-config').children().children().attr('class', 'unlock');
							$(this).find('.player-config').children().next().children().attr('class', 'undelete');	
						}

						$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player.id+"']").parent().parent().addClass('selected-player');
						$("table[id*='table-stats-'] tbody tr td.player-name #player-id[value='"+player.id+"']").parent().find('.add-player').removeClass().addClass('notadd-player');
						
					}catch(err){
						console.log(players_optimal[i]);
					}

					i++;

				}
				

				total_salary += parseFloat($(this).find('.salary-position').attr('salary'), 10);
				total_projections += parseFloat($(this).find('.salary-position').attr('projected'), 10);

			});
		}



		//console.log(players_optimal);

		//$('#'+table_id).parent().find('.total-values').html("("+formatSalary(total_salary)+" / "+total_projections.toFixed(2)+")");

		//$('#'+table_id).parent().find('.total-values #total-salary val').html('$'+formatSalary(total_salary));


		//$('#'+table_id).parent().find('.total-values #total-fp val').html(total_projections.toFixed(2));

		totalStats(site_id);

	//}
	
}

function totalStats(site_id){


	var positions_cap = getPositionsCap(site_id);
	var cap = parseInt(positions_cap.cap, 10);
	var i = $('#optimal-table tbody tr').length;
	var total_salary = 0;
	var total_fp = 0;
	var avg_player = cap / i;
	var remaining = cap;
	
	


	$('#optimal-table tbody tr').each(function(){

		if($(this).find('#add-player-optimal').is(':hidden') ) {

			i--;
			total_salary += parseInt($(this).find('.salary-position').attr('salary'), 10);
			total_fp += parseFloat($(this).find('.salary-position').attr('projected'), 10);
			remaining = cap - total_salary;
			//console.log(remaining);
			//console.log(i);
			avg_player = (i != 0)?remaining / i:0; 
			

		}

	});

	if(remaining < 0){

		$('.total-values').find('#salary-remaining span').html('Salary Over');
		$('.total-values').find('#salary-remaining val').css('color', 'red');
		remaining = remaining * -1;

	}else{
		$('.total-values').find('#salary-remaining span').html('Salary Remaining');
		$('.total-values').find('#salary-remaining val').css('color', 'green');
	}

	$('.total-values').find('#total-salary val').html("$"+formatSalary(total_salary));
	$('.total-values').find('#salary-remaining val').html("$"+formatSalary(remaining));
	$('.total-values').find('#avg-player val').html("$"+avg_player.toFixed(2));
	$('.total-values').find('#total-fp val').html(total_fp.toFixed(2));
	
	/*$('table[id*="table-stats-"] tbody tr').each(function(){		

		var name_salary = $(this).find('.name').text();
		console.log(name_salary);
		var salary = name_salary.replace(/\D+/, "").replace(')', '');
		console.log(salary);
		if(salary > remaining){
			$(name_salary).css('color', '#E63710');
		}

	});*/

	//formatSalary(total_salary)
	//total_projections.toFixed(2)

	//console.log(total_salary);
	//console.log(remaining);
	//console.log(avg_player);
	//console.log(total_fp);
	
	

}


function  getPositionsCap(site_id){

	var positions_by_sport = $.parseJSON($('#positions_by_sport').val());
	var positions_by_site = new Array()
	var cap = 0;

	for(var i in positions_by_sport){
				
		if(positions_by_sport[i].id == site_id){
			positions_by_site = positions_by_sport[i].positions;
			cap = positions_by_sport[i].cap;
		}

	}

	var objectPosCap = new Object();
	objectPosCap.cap = cap;
	objectPosCap.positions = positions_by_site;

	return objectPosCap;

}

function optimalLineup(counts, site_id, modified_players, callback){


			var positions_cap = getPositionsCap(site_id);
			var positions_by_site = positions_cap.positions;
			var cap = positions_cap.cap;
			var pool = $('.pool-optimal').data('optimal');

			var projections = new Array();
			$('table[id*="table-stats-"] tbody tr').each(function(){				

				if($(this).find('#sites').val().search("\"site_id_"+site_id+"\"") != -1){

					if(pool) {

						if($(this).find('.pool').attr('checked')){

							var player = new Object();
							player.name = $.trim($(this).find('.player-name .name').html());
							var val = $(this).find('#player_id').val();
							player.id = val;
							val  = $.parseJSON($(this).find('#sites').val());
							val = eval('val.site_id_'+site_id); //projected_value;
							player.projected = parseFloat(val, 10);
							val  = $.parseJSON($(this).find('#formulas').val());
							val = eval('val.site_id_'+site_id);
							player.formula = val;
							val  = $.parseJSON($(this).find('#salaries').val());
							val = eval('val.site_id_'+site_id);
							player.salary = parseInt(val, 10);
							val  = $.parseJSON($(this).find('#positions').val());
							val = eval('val.site_id_'+site_id);
							player.position = val;
							val  = $.parseJSON($(this).find('#opp').val());
							player.hashtag = val.hashtag;
							projections.push(player);

						}

					}else {

						var player = new Object();
						player.name = $.trim($(this).find('.player-name .name').html());
						var val = $(this).find('#player_id').val();
						player.id = val;
						val  = $.parseJSON($(this).find('#sites').val());
						val = eval('val.site_id_'+site_id); //projected_value;
						player.projected = parseFloat(val, 10);
						val  = $.parseJSON($(this).find('#formulas').val());
						val = eval('val.site_id_'+site_id);
						player.formula = val;
						val  = $.parseJSON($(this).find('#salaries').val());
						val = eval('val.site_id_'+site_id);
						player.salary = parseInt(val, 10);
						val  = $.parseJSON($(this).find('#positions').val());
						val = eval('val.site_id_'+site_id);
						player.position = val;
						val  = $.parseJSON($(this).find('#opp').val());
						player.hashtag = val.hashtag;
						projections.push(player);

					}

				}

			});

			
			
			if(modified_players != null){

				//console.log(modified_players);
				
				if(modified_players.removed.length != 0){

					projections = removePlayers(projections, modified_players.removed);
				}

				if(modified_players.locked.length != 0){
					var j = 0;
					for (i in modified_players.locked){
						positions_by_site.splice(modified_players.locked[i].index-j, 1);
						var player_salary = parseFloat(modified_players.locked[i].salary, 10);
						cap = cap - player_salary;
						j++;
					}
				}


			}

			/*for (i in projections){
				console.log(projections[i].id);
			}*/

			//sort desc by fp (projected)
			projections.sort(function(a, b){
				if(b.projected > a.projected){
					return 1;
				}else{
					return -1;
				}
			});

			//console.log(positions_by_site);

			var lineups = new Array;
			
				
			for(var i = 0; i < 10000; i++){
				value = ((i / 10000) * 100);
				//value += "%";
				//if(value == 25 || value == 50 || value == 75 || value == 99){

					//update_progress_bar(value);
					//$( "#progressbar" ).progressbar('value', value);
					///window.setTimeout(function() {
					
						//$( "#progressbar" ).progressbar('value', value);
						//alert ('data');
						//window.setTimeout(function() {}, 10000);
						//pauseProc(5000);
						//sleep(2000);
					//}, 1000);
				//}

				for(var j = 0; j < counts; j++){

					var newLineup = fillLineup(projections.slice(0), cap, positions_by_site, false);

					if(lineups[j] == null){

						lineups[j] = newLineup;

					}else{

						lineups[j] = sumData(newLineup, 'projected') > sumData(lineups[j], 'projected') ?
							newLineup : lineups[j];
					}

				}
			}
			
			//console.log(lineups);

		//return lineups;
		var pool = $('.pool-optimal').data('optimal', false);
		callback(lineups);

}

function sleep(milliseconds) {
  var start = new Date().getTime();
  for (var i = 0; i < 1e7; i++) {
    if ((new Date().getTime() - start) > milliseconds){
      break;
    }
  }
}

function pauseProc(millis) 
{
	var date = new Date();
	var curDate = null;

	do { curDate = new Date(); } 
	while(curDate-date < millis);
} 

function fillLineup(players, cap, positions_sites, last_salary){

	var lineup = new Array();

	while(lineup.length < positions_sites.length){
		
		var j;
		for(j = 0; j < players.length; j++){
			var player = players[j];

			var i = lineup.length;
			
			if($.inArray(player.position, $.isArray(positions_sites[i])?positions_sites[i]:new Array(positions_sites[i])) != -1){
				lineup[i] = player;
				players.splice(j, 1);
				break;
			}
		}

		if(j == players.length){
			return lineup;
		}	

	}

	return checkLineup(players.slice(0), lineup, cap, positions_sites, last_salary);
	
}

function checkLineup(players, lineup, cap, positions_sites, last_salary){

	if(sumData(lineup, 'salary') <= cap){
		return lineup;
	} 

	var i = Math.ceil(Math.random() * positions_sites.length);

	//var i = Math.floor(Math.random() * positions_sites.length);

	for(var j = 0; j < players.length; j++){
		var player = players[j];

		if($.inArray(player.position, $.isArray(positions_sites[i])?positions_sites[i]:new Array(positions_sites[i])) != -1){

			if(player.salary < lineup[i].salary){
				lineup[i] = player;
				players.splice(j, 1);
				return checkLineup(players.slice(0), lineup, cap, positions_sites, last_salary);
			}
		}
	}

	return Array();

}

function sumData(array_data,  variable){


	sum_data = 0;
	for(i in array_data){
		var data = eval('array_data[i].'+variable);
		sum_data += parseFloat(data, 10);
	}
	return sum_data;

}

function playerInputStatus(){
	
	$(".player-input-status").bind("autocompleteselect", function(event, ui) {
		
		
		var label = ui.item.label;
		var player_id = ui.item.id;
		var col_id = $(this).parent().parent().attr('id');
		$(this).parent().find('#player-status').val(player_id);
		var submit_data = "data[ProjectedStat]["+col_id+"][status][player-status]";
		$(this).parent().find('#player-status').attr('name', submit_data);
		hashtagAndEdited($(this).parent().parent());

		/*var label = ui.item.label;
		var player_id = ui.item.id;
		val_status = player_id;
		var projected_stat_id = $(this).parent().parent().attr('id');
		var column = Array();
		var data = new Object();
		data.name = 'status';
		data.val = val_status;
		column.push(data);
		var user_id = $('#user_id').val();
		var league_id = $('#league_id').val();
		var position_hashtag = $('#position_hashtag').val();
		var position_id = $('#position_id').val();
		var column_name = 'status';
		var dropdown = $(this).parent().find('.select_status');
		var input_player = $(this);
		
		//console.log(user_id);
		
		$.ajax({
			type: 'POST',
			url: "/user_projected_stats/update_stat/",
			//cache: false,
			data: {
				'data[User][id]' : user_id,  
				'data[UserProjectedStat][id]' : projected_stat_id,
				'data[Position][columns]' : column,
				'data[League][id]' : league_id,
				'data[Position][hashtag]' : position_hashtag,
				'data[Position][id]' : position_id,
				'data[Column][name]' : column_name
			},
			beforeSend: function() {
				$(dropdown).parent().parent().append('<span>Saving...</span>');
				$(dropdown).parent().hide();
				$(input_player).hide();
			},
			success: function(){
				
				$(dropdown).parent().parent().find('span').remove();
				$(dropdown).parent().show();
				$(dropdown).parent().parent().append('<span>'+label+'</span>');
				
			}
		});*/
		
	});
	
}

function selectStatus(){
	
	$('.select_status').change(function(){
		
		var projected_stat_id = $(this).parent().parent().parent().attr('id');
		var val_status = $(this).val();
		
		if(val_status == '6'){
			
			$(this).parent().parent().find('.player-input-status').val('');
			$(this).parent().parent().find('.player-input-status').show();
			
		}else{
		
		var column = Array();
		var data = new Object();
		data.name = 'status';
		data.val = val_status;
		column.push(data);
		var league_id = $('#league_id').val();
		var position_hashtag = $('#position_hashtag').val();
		var position_id = $('#position_id').val();
		var column_name = 'status';
		var dropdown = $(this);
		
		
		//console.log(projected_stat_id+ " " + league_id + " " + position_hashtag + " " + position_id + " " + column_name);
		//console.log(column);
		
		$.ajax({
				type: 'POST',
				url: "/user_projected_stats/update_stat/",
				//cache: false,
				data: {
					'data[UserProjectedStat][id]' : projected_stat_id,
					'data[Position][columns]' : column,
					'data[League][id]' : league_id,
					'data[Position][hashtag]' : position_hashtag,
					'data[Position][id]' : position_id,
					'data[Column][name]' : column_name
				},
				beforeSend: function() {
					$(dropdown).parent().parent().find('span').remove();
					$(dropdown).parent().parent().append('<span>Saving...</span>');
					$(dropdown).parent().hide();
					$('.player-input-status').hide();
					
				},
				success: function(){
					
					$(dropdown).parent().parent().find('span').remove();
					$(dropdown).parent().show();
					
				}
		});
		
		}
	});
	
}

function colorTable(table){
	
	var cont = 0;
	//$('.fancy:visible .last').each(function(){
	$(table).find('tbody tr').each(function(){	
	
		$(this).attr('class', (cont % 2 != 0)?'even':'odd');
		cont++;
		
	});
	
}


function isNumeric(value) {
	if (value == null || !value.toString().match(/^[-]?\d*\.?\d*$/) || value == '')
		return false;
	return true;
}

function showTableStat(position_id){
	
	$("#player-stats table[id!=\"table-stats-"+position_id+"\"]:not(#stats-table)").hide();

}

function createJSONstring(json_data){

	var json_site_fps = $.parseJSON(json_data);
	
	var site_id_0 = json_site_fps.Sites.site_id_0;
	var site_id_1 = json_site_fps.Sites.site_id_1;
	var site_id_2 = json_site_fps.Sites.site_id_2;
	var site_id_6 = json_site_fps.Sites.site_id_6;
	var site_id_9 = json_site_fps.Sites.site_id_9;
	var site_id_12 = json_site_fps.Sites.site_id_12;
	var site_id_16 = json_site_fps.Sites.site_id_16;
	
	var data = "{\"site_id_0\":\""+site_id_0+"\",";
	
	if(site_id_1 != undefined)
		data += "\"site_id_1\":\""+site_id_1+"\",";
	if(site_id_2 != undefined)
		data += "\"site_id_2\":\""+site_id_2+"\",";	
	if(site_id_6 != undefined)
		data += "\"site_id_6\":\""+site_id_6+"\",";
	if(site_id_9 != undefined)
		data += "\"site_id_9\":\""+site_id_9+"\",";
	if(site_id_12 != undefined)
		data += "\"site_id_12\":\""+site_id_12+"\",";
	if(site_id_16 != undefined)	
		data += "\"site_id_16\":\""+site_id_16+"\",";
	
	data = data.substring(0, data.length-1);
	
	data += "}";
	
	return data;
	
	//{"site_id_6":"25.52000000","site_id_9":"21.11000000","site_id_12":"20.26000000","site_id_2":"20.93000000","site_id_1":"20.26000000","site_id_16":"26.26500000","site_id_0":20.93}
}

function calculateStatFields(row_id, new_fp){
	
	new_fp = parseFloat(new_fp, 10);
	var formulas = $('#'+row_id).find('#formulas').val();
	var formulasJson = $.parseJSON(formulas);
	var site_id = $('#site_id').val();
	var column = '';
	var formula = eval ('formulasJson.site_id_'+site_id);
	formula = formula.toString();
	formula = clean_formula(formula);

	var no_taken_stats = Array('_3b', 'hr', 'w', 'l', 'sv', 'qs', 'cg', 'ip');
	
	//get ramdom column only columnd with vals != 0
	var col_vars = "";
    var valid_columns = new Array();
	$('#'+row_id+' td[class!="projectedstat-fp last"][class!="projectedstat-weight"][class!="projectedstat-status"][class*="projectedstat-"] input').each(function(){
		
		column = $(this).parent().attr('class').split('-')[1];
		column = (invalid_var(column))?"_"+column:column;
		var data = new Object();
		data.name = column;
		data.val = $.trim($(this).val());
		valid_columns.push(data);
		col_vars += "var " + data.name + " = " + data.val + "; ";
		
	});
	//console.log(col_vars);
	//console.log(formula);
	//return false;

	eval(col_vars);
	var old_fp = eval(formula);
	old_fp  = parseFloat(old_fp, 10);
	//console.log("formula "+ formula);
	//console.log("old fp " + old_fp);
	
	
	var val = 0;
	var new_tmp_fp = 0;
	var min_val = 0;
	var max_val = 0;
	var increment = true;
	
	(new_fp > old_fp)?increment = true:increment = false;
		
	var flag_data = true;
	while(flag_data){
		var i = 0;
		$('#'+row_id+' td[class!="projectedstat-fp last"][class!="projectedstat-weight"][class!="projectedstat-status"][class*="projectedstat-"]').each(function(){
			column = $(this).attr('class').split('-')[1];
			column = (invalid_var(column))?"_"+column:column;
			
			if(parseFloat($(this).find('input').val(), 10) > 0 && formula.search("\\["+column+"\\]") != -1){
			
				if($.inArray(column, no_taken_stats) != -1){
					val = valid_columns[i].val;
				}else{
					val = computeval(valid_columns[i].val, formula, column, increment);
					val = (val <= 0)?0:val;
				}

				eval(valid_columns[i].name+" = " + val + ";");
				valid_columns[i].val = val;
				new_tmp_fp = eval(formula);
				new_tmp_fp = new_tmp_fp.toFixed(2);
				
				if(increment){
					if(new_tmp_fp >= new_fp){
						flag_data = false;
						return false;
					}	
				}else{
					if(new_tmp_fp <= new_fp){
						flag_data = false;
						return false;
					}	
				}
				//console.log("new tmp fp "+ new_tmp_fp + " col " + column);
			}
			i++;
		});
		
		
	}
	
	valid_columns = clean_vars(valid_columns);
	
	//console.log(valid_columns);
	//console.log(new_tmp_fp);
	
	return valid_columns;
	
}

function clean_vars(valid_columns){
	for(i in valid_columns){
		
		if (valid_columns[i].name.search("_") != -1){
			valid_columns[i].name = valid_columns[i].name.replace("_", "");
		}
	}
	
	return valid_columns;
}

function calWeightStats(row_id, weight_val, old_weight_val){
	
	
	weight_val = parseFloat(weight_val, 10);
	old_weight_val = parseFloat(old_weight_val, 10);
	//var operator = (weight_val >= old_weight_val)?"*":"/";
	var column = '';
	var value = '';
	valid_columns = new Array();
	
	var weight = new Object();
	weight.name = 'weight';
	weight.val = weight_val;
	valid_columns.push(weight);
	
	$('#'+row_id+' td[class!="projectedstat-fp last"][class!="projectedstat-weight"][class*="projectedstat-"]').each(function(){
		
		column = $(this).attr('class').split('-')[1];
		value = parseFloat($.trim($(this).html()), 10);
		
		value = value * weight_val;
		value = value.toFixed(2);
		var data = new Object();
		data.name = column;
		data.val = value;
		valid_columns.push(data);
		
	});
	
	return valid_columns;
	
}

function columnInArray(value, column_stats){
	for(var i = 0; i < column_stats.length; i++){
		if(column_stats[i].search(value) != -1){
			return i;
			break;
		}
	}
	return -1;
}

function computeval(col_val, formula, col_name, increment){
	
	var range = 0.05;
	
	if(col_name == 'payd'){
			
		col_val = parseInt(col_val, 10);
		(increment == true)?col_val = col_val + 1:col_val = col_val - 1;
		
	}else{
		
		var patt = "\\(-*[0-9]*\\.*[0-9]*\\s*[\\+|-|\\*|\\/]\\s*\\["+col_name+"\\]\\)";
		//console.log(col_name);
		var slot_data = formula.match(patt).toString();
		var constant = slot_data.split("(")[1];
		constant = constant.split(" ")[0];
		constant = parseFloat(constant, 10);
		col_val = parseFloat(col_val);
		if(constant >= 0){
			(increment == true)?col_val = (col_val + range).toFixed(2):col_val = (col_val - range).toFixed(2);
		}else{
			(increment == true)?col_val = (col_val - range).toFixed(2):col_val = (col_val + range).toFixed(2);
		}
	}
	
	return col_val;
}

function invalid_var(var_data){
	
	var patt = "[0-9]+[a-zA-Z]+";
	
	if(var_data.match(patt) != null){
		return true;
	}else{
		return false;
	}
	
}

function clean_formula(formula){
	
	var patt = "\\[[0-9]+[a-zA-Z]+\\]";
	while (formula.match(patt) != null){
		
		var invalid_var = formula.match(patt).toString();
		invalid_var = invalid_var.substr(1);
		formula = formula.replace(invalid_var, "_"+invalid_var);

	}

	return formula;
	
}