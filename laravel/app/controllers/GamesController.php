<?php

class GamesController extends BaseController {
	
	//filter to get route access (check it out filters.php)
	public function __construct() {
	    $this->beforeFilter('csrf', array('on'=>'post'));
	    $this->beforeFilter('auth', array('only'=>array('getAdd', 'getEdit', 'delete')));
	    $this->beforeFilter('admin', array('only'=>array('getEdit', 'getAdd', 'delete')));
	}

	/**
	 * Return format like we use
	 */
	private function _dateFormat($date) {

		$date = new DateTime($date);
		
		return $date->format('Y-m-d H:i:s');

	}
	
	//create a game by POST 
	public function postAdd($id = null) {

		//validate form 
		$validator = Validator::make(Input::all(), Game::$rules, Game::$messages);

		$route = (isset($id))?'games/edit/'.$id:'games/add';

		if ($validator->passes()) {

			$starred = (Input::has('starred'))?1:0;
			$active = (Input::has('active'))?1:0;
			$finished = (Input::has('finished'))?1:0;

			//saving on games table
			if(isset($id)){
				$game = Game::find($id);
				$message = 'El partido ha sido actualizado!';

				//remove from winners cache
				if(!$game->finished && $finished){
					if(Cache::has('user_points_premium_event_'.$game->sportEvent->id)) {
						//get last one rankings values
						Cache::forever('old_user_points_premium_event_'.$game->sportEvent->id, Cache::get('user_points_premium_event_'.$game->sportEvent->id));
						Cache::forever('old_user_points_free_event_'.$game->sportEvent->id, Cache::get('user_points_free_event_'.$game->sportEvent->id));
					}
					//remove rankings
					Cache::forget('finished_games_event_'.$game->sportEvent->id);
					Cache::forget('user_points_premium_event_'.$game->sportEvent->id);
					Cache::forget('user_points_free_event_'.$game->sportEvent->id);
				}

				Cache::forget('games_sport_event_'.$game->sportEvent->id);
				Cache::forget('winner_scores_game_'.$game->id);
				Cache::forget('not_winner_scores_game_'.$game->id);
			
				if(Input::has('reset_premium')){

					$scores_payment = $game->scores()->where('scores.payment', '1')->get();
					$game_credits = $game->credits;	
					$game_id = $game->id;
					$comment = 'Se acaban de enviar correos para restaurar marcadores premium: de '.$game->credits.' créditos ';
					foreach($scores_payment as $score){

						
						$score_data = Score::find($score->id);
						$score_data->payment = 0;
						$score_data->save();

						$user = User::find($score->user->id);
						$user->incrementCredits($game_credits);

						Mail::queue('mail.reset-premium', 
							array(
								'name' => $user->first_name.' '.$user->last_name,
								'home_team' => $score->game->homeTeam->name,
								'visit_team' => $score->game->visitTeam->name,
								'game_id' => $game_id
								), function($message) use ($user) {
							$message->to($user->email, $user->first_name.' '.$user->last_name)
									->subject("Tu marcador premium ha sido restaurado en Chilibet777.com");
						});
						$comment .= $user->username.' | ';
					}

					Mail::send('static.feedback', array('name' => 'admin', 'email' => 'admin@chilibet777', 'comment' => $comment), function($message) use ($game) {
							$message->to('admin@chilibet777.com', 'Chilibet777.com')
							->subject('restauracion de marcadores premium para el partido game-id-'.$game->id);
						});


				}
				
			}else{
				$game = new Game;
				$message = 'El partido ha sido agregado!';
				
			}

			$game->date = $this->_dateFormat(Input::get('date'));
			$game->starred = $starred;
			$game->sport_event_id = Input::get('sport_event');
			$game->home_team_id = Input::get('home_team');
			$game->home_score = Input::get('home_score');
			$game->visit_team_id = Input::get('visit_team');
			$game->visit_score = Input::get('visit_score');
			$game->credits = Input::get('credits');
			$game->accumulated = Input::get('accumulated');
			$game->active = $active;
			$game->finished = $finished;
			$game->comment = Input::get('comment');
			$game->save();
			if($game->finished && Input::get('send_emails')){

				$winners = $game->scores()
						->where('scores.home_score', $game->home_score)
						->where('scores.visit_score', $game->visit_score)
						->orderBy('scores.payment', 'desc')
						->get();

				

				$comment = 'Se acaban de enviar correos a estos ganadores: ';							
				foreach($winners as $winner){

					//dd($winner);

					Mail::queue('mail.congratulation', 
							array(
								'name' => $winner->user->first_name.' '.$winner->user->last_name,
								'home_team' => $winner->game->homeTeam->name,
								'visit_team' => $winner->game->visitTeam->name,
								'home_score' => $winner->game->home_score,
								'visit_score' => $winner->game->visit_score,
								'event' => $winner->game->sportEvent->name,
								'event_id' => $winner->game->sportEvent->id,
								'game_id' => $winner->game->id,
								'email_comment' => (Input::has('email_comment') && $winner->payment)?Input::get('email_comment'):null
								), function($message) use ($winner) {
							$message->to($winner->user->email, $winner->user->first_name.' '.$winner->user->last_name)
									->subject("Felicidades acertaste el marcador {$winner->game->homeTeam->name}({$winner->game->home_score}) - {$winner->game->visitTeam->name}({$winner->game->visit_score})");
														
					});
					$comment .= $winner->user->username.' | ';
					
				}

				$comment .= (Input::has('email_comment'))?'<p>'.Input::get('email_comment').'</p>':'';

				Mail::send('static.feedback', array('name' => 'admin', 'email' => 'admin@chilibet777', 'comment' => $comment), function($message) use ($game) {
						$message->to('admin@chilibet777.com', 'Chilibet777.com')
						->subject('ganadores para el partido wwww.chilibet777.com/games/view/'.$game->id);
					});

			}

			if(Input::has('send_emails_not_score')){
				$users_needs_alert = User::where('role_id', '3')
									->whereNotIn('id', Game::find($game->id)->premiumScores()->lists('user_id'))
									->get();


				$comment = 'Se acaban de enviar correos a estos usuarios por no tener marcador premium agregado: ';
				foreach($users_needs_alert as $user){
					Mail::queue('mail.reminder-score', 
								array(
									'name' => $user->first_name.' '.$user->last_name,
									'home_team' => $game->homeTeam->name,
									'visit_team' => $game->visitTeam->name,
									'time' => (new Helper)->formatTime($game->date)
									), function($message) use ($user) {
								$message->to($user->email, $user->first_name.' '.$user->last_name)
										->subject("Recordatorio de ingreso de marcadores");
							});
					$comment .= $user->username.' | ';
				}
				Mail::queue('static.feedback', array('name' => 'admin', 'email' => 'admin@chilibet777', 'comment' => $comment), function($message) use ($game) {
					$message->to('admin@chilibet777.com', 'Chilibet777.com')
					->subject('Cuentas premiums sin marcador agregado');
				});
			}
			
			
		    return Redirect::to('games/dashboard')->with('message', $message);

		} else {

			return Redirect::to($route)->with('message', 'Ocurrieron los siguientes errores:')->withErrors($validator)->withInput();
		}
		
	}

	//add view with get data
	public function getAdd() {

			
		$game = new Game;
		$teams = Team::orderBy('name', 'asc')->lists('name', 'id');
		$events = SportEvent::orderBy('name', 'asc')->lists('name', 'id');
		$this->layout->content = View::make('games.add')
											->with('teams', $teams)
											->with('game', $game)
											->with('events', $events);

				
	}

	//home page with query by what games user like (chilibet777.com homepage)
	public function getDashboard($id = null) {

		$count_pages = 12;
		$active_events = SportEvent::where('active', '1')->lists('id');

		switch ($id) {
		
			case "starred":
				$title =  "Partidos Destacados";
				$games = Game::where('starred', '1')->whereIn('sport_event_id', $active_events)->orderBy('date', 'desc')->paginate($count_pages);
			break;
			case "all":
				$title = "Todos los partidos";	
				$games = Game::whereIn('sport_event_id', $active_events)->orderBy('date', 'asc')->paginate($count_pages);
			break;
			case "previuos":
				$title = "Partidos Anteriores";
				$games = Game::whereIn('sport_event_id', $active_events)->where('date', '<', new DateTime('-3 hours'))->orderBy('date', 'desc')->paginate($count_pages);
			break;
			case "next":
				$title = "Próximos Partidos";
				$games = Game::whereIn('sport_event_id', $active_events)->where('date', '>=', new DateTime('-3 hours'))->orderBy('date', 'asc')->paginate($count_pages);
			break;
			default:
				$title = "Partidos Anteriores";
				$games = Game::whereIn('sport_event_id', $active_events)->where('date', '<', new DateTime('-3 hours'))->orderBy('date', 'desc')->paginate($count_pages);

				
		}
			//go to view games.dashboard
			$this->layout->content = View::make('games.dashboard')->with('games', $games)->with('title', $title);
	}

	//show id for a selected game
	public function getEdit($id) {

		$game = Game::find($id);
		$date = \Carbon\Carbon::createFromFormat('Y-m-d H:i:s', $game->date);		
		$game->date = $date->format('m/d/Y h:i A');

		$teams = Team::orderBy('name', 'asc')->lists('name', 'id');
		$events = SportEvent::orderBy('name', 'asc')->lists('name', 'id');
		
		$this->layout->content = View::make('games.edit')
						->with('game', $game)
						->with('teams', $teams)
						->with('events', $events);

	}

	//delete function for a game by id
	public function delete($id) {

		$game = Game::find($id);
		$game->delete();

		return Redirect::to('games/dashboard')->with('message', 'El partido ha sido eliminado!');
	}

	//view a specific game
	public function getView($game_id) {

		$game = Game::find($game_id);
		$this->layout->content = View::make('games.view')
								->with('game', $game);

	}	

}
