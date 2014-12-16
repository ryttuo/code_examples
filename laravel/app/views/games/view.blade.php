@section('title', 'partido '.$game->homeTeam->name.' - '.$game->visitTeam->name)

@include('games.match-games', $game)



@if($game->comment)
        <div class="row">
            <div class="alert alert-success"> {{ $game->comment }}</div>
        </div>
@endif

<div class="show-game"><a href="{{ url(URL::previous()) }}"><i class="fa fa-arrow-left"></i> Volver</a></div>

@if(Auth::check() && Auth::user()->isAdmin())
 {{ HTML::link('/games/edit/'.$game->id, 'Editar Partido') }}
@endif

@include('scores.scores-table', array('view' => true))

