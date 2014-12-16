@include('layouts.title', array('title' => $title))

@foreach($games as $game)

<div id="game-id-{{ $game->id }}" class="game-section">	

	@include('games.match-games', $game)

	@if($game->comment)
		
			<div class="alert alert-success alert-dismissable col-md-offset-2 col-xs-12 col-lg-8 col-sm-8"> {{ $game->comment }}
			</div>
		
	@endif
	<div class="row col-md-offset-2 col-xs-12 col-lg-8 col-sm-8">
	<ul class="nav nav-pills">
      @if(Auth::check() && Auth::user()->isAdmin())

		<li>{{ HTML::link('games/edit/'.$game->id, 'Editar Partido') }}</li>
			
	  @endif


    </ul>
    </div>

    

	@include('scores.scores-table')


	<div class="row">

	<div class="btn-toolbar options-btn" style="margin: 0;">

				@include('scores.add')
			
		</div>
	</div>

</div>

@endforeach


{{ $games->links() }}


<?php $dialog = 'Algún campo no es numeral'?>

@include('layouts.alert-modal', array('question' => 'Por favor seleccione solo números', 'dialog' => $dialog))