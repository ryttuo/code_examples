<div class="row">
	<div class="col-md-offset-2">
	<div class="col-xs-6 col-md-3">
		<div class="team-flag thumbnail ">
			<div class="team-type">
				<h4 >{{ HTML::link('teams/view/'.$game->homeTeam->id, $game->homeTeam->name) }} </h4>
			</div>
			<div class="hashtag">({{ $game->homeTeam->hashtag }})</div>
			<?php $picture = Str::lower($game->homeTeam->hashtag); ?>
			{{ HTML::image(Config::get('params.s3_url')."/img/teams/".$picture.".png", $game->homeTeam->name, array('id' => '', 'class' => 'img-rounded img-responsive', 'width' => '70', 'height' => '70')) }}
		</div>
		<div class="caption">
			<div class="main-score">{{ $game->home_score }}</div>
		</div>
	</div>
	<div class="col-md-3"></div>
	<div class="col-xs-6 col-md-3">
		<div class="team-flag thumbnail ">
			<div class="team-type">
				<h4 >{{ HTML::link('teams/view/'.$game->visitTeam->id, $game->visitTeam->name) }} </h4>
			</div>
			<div class="hashtag">({{ $game->visitTeam->hashtag }})</div>
			
			<?php $picture = Str::lower($game->visitTeam->hashtag); ?>
			{{ HTML::image(Config::get('params.s3_url')."/img/teams/".$picture.".png", $game->visitTeam->name, array('id' => '', 'class' => 'img-rounded img-responsive', 'width' => '70', 'height' => '70')) }}
		</div>
		<div class="caption">
			<div class="main-score">{{ $game->visit_score }}</div>
		</div>
	</div>
		
	</div>	
		
</div>


@if($game->scores->count() >= 3)

	<div class="row">
		<div class="col-md-offset-3 col-md-6 col-offset-predition">

			<div class="progress">

				<?php
					$wins = $game->positiveScores->count();
					$equal = $game->equalScores->count();
					$lost = $game->scores->count() - ($game->positiveScores->count() + $game->equalScores->count());
					$total = $game->scores->count();

				?>
				@if($wins > $lost)
					<div class="progress-bar progress-bar-success" style="width: {{ $wins / $total * 100 }}%"> {{ number_format($wins / $total * 100, 2) }}%</div>
					<div class="progress-bar progress-bar-warning" style="width: {{ $equal / $total * 100 }}%">{{ number_format($equal / $total * 100, 2) }}%</div>
					<div class="progress-bar progress-bar-danger" style="width: {{ $lost / $total * 100 }}%">{{ number_format($lost / $total * 100, 2) }}%</div>
				@else	
					<div class="progress-bar progress-bar-danger" style="width: {{ $wins / $total * 100 }}%">{{ number_format($wins / $total * 100, 2) }}%</div>				
					<div class="progress-bar progress-bar-warning" style="width: {{ $equal / $total * 100 }}%">{{ number_format($equal / $total * 100, 2) }}%</div>
					<div class="progress-bar progress-bar-success" style="width: {{ $lost / $total * 100 }}%">{{ number_format($lost / $total * 100, 2) }}%</div>
				@endif

			</div>
		</div>
	</div>

@endif

<div class="row col-md-offset-2 col-xs-12 col-lg-12 col-sm-12">
<strong class="color-header">{{ (new Helper)->formatDate($game->date, false) }}</strong>
@if($game->finished)
	<strong class="finished-game color-header"><i class="fa fa-clock-o"></i>
  	Partido Finalizado</strong>
@endif
</div>