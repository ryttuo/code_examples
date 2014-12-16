<?php

class Game extends Eloquent {

	//default is the same game but if you want to use another table name you can change this:
	protected $table = 'games';

	//form validations and type validation
	public static $rules = array(
		'date' => 'required|date',
	    'home_score' => 'required|numeric',
	    'visit_score' => 'required|numeric'
    );

	//custom message validations
    public static $messages = array(
	    'date.required' => 'La fecha y hora es requerida',
	    'date.date' => 'El formato de la fecha no es valido',
	    'home_score.required' => 'El marcador de casa es requerido',
	    'home_score.numeric' => 'El marcador de casa debe ser un número',
	    'visit_score.required' => 'El marcador de visita es requerido',
	    'visit_score.numeric' => 'El marcador de visita debe ser un número'
	);

	//game has a home team foreing key on team table
	public function homeTeam(){
		
		return $this->belongsTo('Team', 'home_team_id');

	}

	//game has a visit team foreing key on team table
	public function visitTeam(){
		
		return $this->belongsTo('Team', 'visit_team_id');

	}

	//Team has many scores (scores are selections by users for the game)
	public function scores() {

		return $this->hasMany('Score');

	}

	//premium scores are only score with payment field is 1
	public function premiumScores() {

		return $this->scores()
						->where('payment', '1');
	}

	//Game belongs to Sport Event like Championship World Cup
	public function sportEvent() {

		return $this->belongsTo('SportEvent');

	}

	//relation between sport_events table and game with active sport event
	public function activeEvents(){

		return $this->sportEvent()
						->where('active', '=' ,'0');

	}

	//get scores for a game with home and visit score same value that game home and visit values
	public function winnerScores() {

		return $this->scores()
						->where('home_score', $this->home_score)
						->where('visit_score', $this->visit_score)
						->orderBy('payment', 'desc');

	}

	//get results by positive (when home score > visit score), or equal or negative
	public function result() {

		if($this->positiveResult()){
			
			return $this->scores()
						->where('home_score', '>', DB::raw('visit_score'))
						->orderBy('payment', 'desc');


		}else if($this->equalResult()){

			return $this->scores()
						->where('home_score', '=', DB::raw('visit_score'))
						->orderBy('payment', 'desc');

		}else{

			return $this->scores()
						->where('home_score', '<', DB::raw('visit_score'))
						->orderBy('payment', 'desc');
		}

	}


	//get positive score for a game
	public function positiveResult() {

		return $this->home_score > $this->visit_score;

	}

	//get equal game score
	public function equalResult(){


		return $this->home_score == $this->visit_score;

	}

	//get negative game score
	public function negativeResult() {

		return $this->home_score < $this->visit_score;

	}

	//get user scores for a game when home > visit score
	public function positiveScores() {

		return $this->scores()
						->where('home_score', '>', DB::raw('visit_score'));
	}

	//get user scores for a game when home = visit score
	public function equalScores() {

		return $this->scores()
						->where('home_score', '=', DB::raw('visit_score'));

	}

	//when user win a score (user score and game score are the same) he should have a win some money
	public function price($score) {


		if($score->payment) {

			$premiums = $this->scores()
							->where('payment', 1)
							->count();


			$same_results = $this->scores()
							->where('payment', 1)
							->where('home_score', $score->home_score)
							->where('visit_score', $score->visit_score)
							->count();

			
			$price = ((($premiums * $this->credits) * 1000) + $this->accumulated) / $same_results;
			$price = number_format($price, 2);
			$price = '(₡'.$price.')';
			

		} else {

			$price = '';

		}	

		return $price;

	}


}