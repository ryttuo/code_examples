<!-- Laravel by default use a blade templating engine with template inheritance and sections
so is great to get code more clean-->

@include('layouts.title', array('title' => 'Agregar partido'));


@include('layouts.errors')

<div class="row">
    <div class="col-md-offset-1 col-md-10">


    {{ Form::open(array('url' => 'games/add', 'class'=>'form-horizontal')) }}
    
            <!--I add include other fields to the form that can use on antoher views -->
    	 @include('games.form-fields')

    	<div class="form-group">
	        <div class="col-md-offset-2 col-md-8">
	            {{ Form::submit('Agregar Partido', array('class'=>'btn btn-large btn-warning btn-block'))}}
	        </div>
    	</div>
    {{ Form::close() }}

    </div>
</div>

