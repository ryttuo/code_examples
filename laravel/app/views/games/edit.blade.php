@include('layouts.title', array('title' => 'Editar Partido'))

@include('layouts.errors')

<div class="row">
    <div class="col-md-offset-1 col-md-10">


    {{ Form::model($game, array('url' => 'games/add/'.$game->id, 'class'=>'form-horizontal')) }}
    
    	 @include('games.form-fields')
    
         <div class="form-group">
            <div class="col-md-offset-2 col-md-8">
                {{ Form::submit('Editar Partido', array('class'=>'btn btn-large btn-warning btn-block'))}}
            </div>
        </div>
    {{ Form::close() }}
    </div>
</div>

     <div class="form-group">
        <div class="col-md-offset-2 col-md-8">
        </div>
    </div>

    


   

