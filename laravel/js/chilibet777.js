$(document).ready(function(){

	
	$('#datetimepicker').datetimepicker();

    $( document ).on( "click", ".show-scores", function() {
      
        if($(this).text() == 'Ver Marcadores'){
            $(this).text('Ocultar');
           
        }else{
            $(this).text('Ver Marcadores');
             var game_id = $(this).attr('data-target').split('-')[1];
            
             $('html,body').animate({
                    scrollTop: $("div#game-id-"+game_id).offset().top
                }, 700);
            
            
        }

    });

    $( document ).on( "click", ".inactive-scores", function() {
      
        if($(this).text() == 'Marcadores Anteriores'){
            $(this).text('Ocultar Marcadores Anteriores');
            $('tr.hide').removeClass('hide');
           
        }else{
            $(this).text('Marcadores Anteriores');
            $('tr.inactive').addClass('hide');
            
        }

    });

	
    $('#searchbox').selectize({
    	//theme: 'repositories',
        valueField: 'url',
        labelField: 'first_name',
        searchField: ['first_name', 'last_name', 'username'],
        maxOptions: 10,
        options: [],
        create: false,
        render: {
            option: function(item, escape) {
                
                //return '<a class="list-group-item" href="'+root+'/users/profile/' +escape(item.username)+'">'+escape(item.first_name)+ ' ('+ escape(item.username)+') ' +escape(item.last_name) +'</a>';
                return '<a class="list-group-item" href="'+escape(item.url)+'">'+escape(item.first_name)+ ' ('+ escape(item.username)+') ' +escape(item.last_name) +'</a>';
                		
            }
        },
        /*optgroups: [
            {value: 'first_name', label: 'Users'}
            //{value: 'category', label: 'Categories'}
        ],*/
        //optgroupField: 'class',
       	//optgroupOrder: ['first_name'],
        load: function(query, callback) {
            if (!query.length) return callback();
            $.ajax({
                url: root+'/api/search',
                type: 'GET',
                dataType: 'json',
                data: {
                    q: query
                },
                error: function() {
                    callback();
                },
                success: function(res) {
                    callback(res.data);
                }
            });
        },
        onChange: function(){
            window.location = this.items[0];
        }
    });



var $select = $('#select-tools').selectize({
	maxItems: null,
	valueField: 'first_name',
	labelField: 'first_name',
	searchField: 'first_name',
	/*options: [
		{id: 1, title: 'Spectrometer', url: 'http://en.wikipedia.org/wiki/Spectrometers'},
		{id: 2, title: 'Star Chart', url: 'http://en.wikipedia.org/wiki/Star_chart'},
		{id: 3, title: 'Electrical Tape', url: 'http://en.wikipedia.org/wiki/Electrical_tape'}
		],*/
	load: function(query, callback) {

		if (!query.length) return callback();

		$.ajax({

			url: root+'/api/search',
			type: 'GET',
			dataType: 'json',
			data: {
				q: query
			},
			error: function(error) {
				console.log(error);
				callback();
			},
			success: function(res) {
				console.log(res.data);
				callback(res.data);
			}
		});
	},
	create: false
});

$('.delete-modal').click(function(){

    var url = $(this).attr('href');
    
    $('#deleteForm').prop('action', url);

    $('#modal-confirmDelete').modal({
        show: true
    });

    return false;

});


$('.alert-modal').click(function(){

    var game_id = $(this).attr('game');
    var home_score = parseInt($('.select-home-score-'+game_id).val(), 10);
    var visit_score = parseInt($('.select-visit-score-'+game_id).val(), 10);

    if(isNaN(home_score) || isNaN(visit_score)) {

        $('#modal-alert').modal({
            show: true
        });

        return false;    

    }
    
    return true;
});


});

 function showConfirmModal() {

    var url = $('.alert-message-form').attr('action');
    
    $(".alert-message-form :input").each(function(){
        var input_data = $(this).clone();
        $('.alert-form-content').append(input_data);
    });
    
    $('#deleteForm').prop('action', url);
    //$('#deletePageName').text(name);
    $('#modal-confirmDelete').modal({
        show: true
    });
    return false;
}

